const express = require("express");
const footballAPI = require("../services/footballApi");
const { redisClient } = require("../config/redis");
const {
  competitionSummaries,
  fallbackCompetitions,
} = require("../data/fallbackContent");

const {
  redisHitsTotal,
  redisMissesTotal,
  redisSetsTotal,
} = require("../config/metrics");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const CACHE_TTL = 60 * 60; // 1 Hour

/*
|--------------------------------------------------------------------------
| Helper Functions
|--------------------------------------------------------------------------
*/

const getCurrentSeasonStart = () => {
    const now = new Date();
    const year = now.getFullYear();

    // July onwards -> new season
    return now.getMonth() >= 6 ? year : year - 1;
};

const getPreviousSeasonStart = () => {
    const now = new Date();
    const year = now.getFullYear();

    return now.getMonth() >= 6 ? year - 1 : year - 2;
};

const formatSeason = (startYear) =>
    `${startYear}/${String(startYear + 1).slice(2)}`;

const isSeasonEmpty = (standings) => {

    const table =
        standings?.standings?.[0]?.table || [];

    if (!table.length) return false;

    return table.every(
        (club) => Number(club.playedGames) === 0
    );
};

/*
|--------------------------------------------------------------------------
| Redis Helpers
|--------------------------------------------------------------------------
*/

const getCachedData = async (key) => {
    if (!redisClient || !redisClient.isOpen) {
        return null;
    }

    try {

        const cached = await redisClient.get(key);

      if (!cached) {
    redisMissesTotal.inc();

    console.log(`🟡 Redis MISS -> ${key}`);
    return null;
}

        redisHitsTotal.inc();

console.log(`⚡ Redis HIT -> ${key}`);

        return JSON.parse(cached);

    } catch (err) {

        console.warn("Redis GET failed:", err.message);

        return null;
    }
};

const setCachedData = async (key, value) => {
    if (!redisClient || !redisClient.isOpen) {
        return;
    }

    try {

        await redisClient.setEx(
            key,
            CACHE_TTL,
            JSON.stringify(value)
        );

        redisSetsTotal.inc();

console.log(`💾 Redis SET -> ${key}`);

    } catch (err) {

        console.warn("Redis SET failed:", err.message);

    }
};

/*
|--------------------------------------------------------------------------
| Football API
|--------------------------------------------------------------------------
*/

const fetchCompetitionBundle = async (
    competitionCode,
    season
) => {

    const params = season
        ? { season }
        : undefined;

    const [
        standings,
        scorers,
        matches,
        teams
    ] = await Promise.allSettled([

        footballAPI.get(
            `/competitions/${competitionCode}/standings`,
            { params }
        ),

        footballAPI.get(
            `/competitions/${competitionCode}/scorers`,
            { params }
        ),

        footballAPI.get(
            `/competitions/${competitionCode}/matches`,
            { params }
        ),

        footballAPI.get(
            `/competitions/${competitionCode}/teams`,
            { params }
        )

    ]);

    // Preserve rejection reasons so callers can distinguish
    // a genuine 404 (invalid competition code) from a partial failure.
    const errors = [standings, scorers, matches, teams]
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason);

    return {

        standings:
            standings.status === "fulfilled"
                ? standings.value.data
                : null,

        scorers:
            scorers.status === "fulfilled"
                ? scorers.value.data
                : null,

        matches:
            matches.status === "fulfilled"
                ? matches.value.data
                : null,

        teams:
            teams.status === "fulfilled"
                ? teams.value.data
                : null,

        errors

    };

};

/*
|--------------------------------------------------------------------------
| Response Builder
|--------------------------------------------------------------------------
*/

const buildSummary = (bundle, source) => {

    const competition =
        bundle.standings?.competition ||
        bundle.matches?.competition ||
        bundle.teams?.competition ||
        {};

    const seasonStart =
        source.seasonStart ||
        Number(bundle.standings?.season?.startDate?.slice(0, 4)) ||
        getPreviousSeasonStart();

    const standings =
        bundle.standings?.standings || [];

    const table =
        standings[0]?.table || [];

    const teams =
        bundle.teams?.teams ||
        table.map((club) => club.team);

    const players =
        bundle.scorers?.scorers || [];

    const matches =
        bundle.matches?.matches || [];

    const finishedMatches = matches.filter(
        (match) => match.status === "FINISHED"
    );

    const liveMatches = matches.filter(
        (match) =>
            match.status === "LIVE" ||
            match.status === "IN_PLAY" ||
            match.status === "PAUSED"
    );

    const upcomingMatches = matches.filter(
        (match) => match.status === "SCHEDULED"
    );

    const totalGoals = finishedMatches.reduce(
        (sum, match) =>
            sum +
            (match.score?.fullTime?.home ?? 0) +
            (match.score?.fullTime?.away ?? 0),
        0
    );

    const averageGoals =
        finishedMatches.length > 0
            ? Number(
                  (
                      totalGoals /
                      finishedMatches.length
                  ).toFixed(2)
              )
            : 0;

    return {

        competition: {

            id: competition.id,
            code: competition.code,
            name: competition.name,
            type: competition.type,

            area: competition.area || null,

            emblem: competition.emblem || null,

            currentSeason: formatSeason(
                seasonStart
            ),

            lastUpdated:
                competition.lastUpdated || null,

            dataMode: source.mode,

            note: source.note

        },

        standings,

        teams,

        players,

        matches,

        insights: {

            totalTeams: teams.length,

            totalMatches: matches.length,

            matchesPlayed:
                finishedMatches.length,

            liveMatches:
                liveMatches.length,

            upcomingMatches:
                upcomingMatches.length,

            totalGoals,

            averageGoals

        }

    };

};

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

/**
 * GET /competitions
 * Returns top-tier competitions from Football Data API.
 * Filters out youth, women's, amateur and archived competitions
 * so the frontend (built for top leagues) doesn't get flooded.
 */
router.get("/", async (req, res) => {
    try {

        const response = await footballAPI.get("/competitions");

        const competitions = (response.data.competitions || [])
            .filter(
                (competition) =>
                    competition.plan === "TIER_ONE" &&
                    Boolean(competition.currentSeason)
            )
            .map((competition) => ({
                id: competition.id,
                code: competition.code,
                name: competition.name,
                type: competition.type,
                emblem: competition.emblem,
                area: competition.area,
                currentSeason: competition.currentSeason,
                numberOfAvailableSeasons: competition.numberOfAvailableSeasons,
                lastUpdated: competition.lastUpdated
            }));

        res.status(200).json(competitions);

    } catch (err) {
  console.error(
    "Competition List Error:",
    err.response?.data || err.message
  );

        return res.status(200).json(fallbackCompetitions);
}

});

/**
 * GET /competitions/:code/summary
 * Returns standings, teams, players and matches.
 */
router.get("/:code/summary", async (req, res) => {

    const code = req.params.code.toUpperCase();

    const cacheKey = `competitions:${code}:summary`;

    try {

        /*
        ----------------------------------------
        Check Redis
        ----------------------------------------
        */

        const cached = await getCachedData(cacheKey);

        if (cached) {
            return res.status(200).json(cached);
        }

        /*
        ----------------------------------------
        Fetch Current Season
        ----------------------------------------
        */

        let bundle = await fetchCompetitionBundle(
            code,
            getCurrentSeasonStart()
        );

        /*
        ----------------------------------------
        Invalid Competition Code
        ----------------------------------------
        If every request in the bundle 404'd, the code itself
        is invalid rather than the season just being empty.
        */

        const allNotFound =
            bundle.errors.length > 0 &&
            bundle.errors.every(
                (error) => error.response?.status === 404
            );

        if (allNotFound) {
            return res.status(404).json({
                success: false,
                message: "Competition not found."
            });
        }

        let source = {
            mode: "current",
            seasonStart: getCurrentSeasonStart(),
            note: "Current season data"
        };

        /*
        ----------------------------------------
        Fallback to Previous Season
        ----------------------------------------
        */

        if (
            !bundle.standings ||
            isSeasonEmpty(bundle.standings)
        ) {

            const previousSeason =
                getPreviousSeasonStart();

            bundle = await fetchCompetitionBundle(
                code,
                previousSeason
            );

            source = {
                mode: "previous",
                seasonStart: previousSeason,
                note: `Showing ${formatSeason(previousSeason)} because the latest season has not started yet.`
            };

        }

        /*
        ----------------------------------------
        Validate We Actually Have Data
        ----------------------------------------
        If standings, matches AND teams are all missing,
        buildSummary() would return an almost empty shell.
        Treat that as a 404 instead.
        */

        if (
            !bundle.standings &&
            !bundle.matches &&
            !bundle.teams
        ) {
            return res.status(200).json(
                competitionSummaries[code] ||
                competitionSummaries.PL
            );
        }

        /*
        ----------------------------------------
        Build Response
        ----------------------------------------
        */

        const response = buildSummary(
            bundle,
            source
        );

        /*
        ----------------------------------------
        Save to Redis
        ----------------------------------------
        */

        await setCachedData(
            cacheKey,
            response
        );

        res.status(200).json(response);

    } catch (err) {

        console.error(
            "Competition Summary Error:",
            err.response?.data || err.message
        );

        if (err.response?.status === 404) {
            return res.status(200).json(
                competitionSummaries[code] ||
                competitionSummaries.PL
            );
        }

        res.status(200).json(
            competitionSummaries[code] ||
            competitionSummaries.PL
        );

    }

});

module.exports = router;
