const express = require("express");
const axios = require("axios");
const footballAPI = require("../services/footballApi");

const router = express.Router();
const CACHE_DURATION = 5 * 60 * 1000;
const cache = {};

const COMPETITION_META = {
    PL: {
        code: "PL",
        name: "Premier League",
        country: "England",
        accent: "cyan",
        headline: "English football control room",
        description: "Table, fixtures, scorers and club intelligence for the Premier League."
    },
    CL: {
        code: "CL",
        name: "Champions League",
        country: "Europe",
        accent: "blue",
        headline: "Europe's elite knockout path",
        description: "Fixtures, standings and top scorers from UEFA's top club competition."
    },
    PD: {
        code: "PD",
        name: "La Liga",
        country: "Spain",
        accent: "red",
        headline: "Spanish title race tracker",
        description: "A focused hub for La Liga table movement, clubs and matchdays."
    },
    BL1: {
        code: "BL1",
        name: "Bundesliga",
        country: "Germany",
        accent: "orange",
        headline: "German football tempo board",
        description: "High-intensity fixtures, standings and scorer data from Germany."
    },
    SA: {
        code: "SA",
        name: "Serie A",
        country: "Italy",
        accent: "emerald",
        headline: "Italian football table watch",
        description: "Serie A clubs, fixtures and top-player snapshots."
    },
    FL1: {
        code: "FL1",
        name: "Ligue 1",
        country: "France",
        accent: "violet",
        headline: "French football weekly desk",
        description: "Fixtures, standings and scorer data from Ligue 1."
    }
};

const allowedCodes = Object.keys(COMPETITION_META);

const getPreviousCompletedSeasonStart = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return month >= 6 ? year - 1 : year - 2;
};

const seasonLabel = (startYear) => `${startYear}/${String(startYear + 1).slice(2)}`;

const getCache = (key) => {
    const hit = cache[key];
    if (!hit || Date.now() - hit.time > CACHE_DURATION) return null;
    return hit.data;
};

const setCache = (key, data) => {
    cache[key] = { time: Date.now(), data };
    return data;
};

const fetchCompetitionBundle = async (code, seasonStart) => {
    const params = seasonStart ? { season: seasonStart } : undefined;
    const [standings, scorers, matches, teams] = await Promise.allSettled([
        footballAPI.get(`/competitions/${code}/standings`, { params }),
        footballAPI.get(`/competitions/${code}/scorers`, { params }),
        footballAPI.get(`/competitions/${code}/matches`, { params }),
        footballAPI.get(`/competitions/${code}/teams`, { params })
    ]);

    return {
        standings: standings.status === "fulfilled" ? standings.value.data : null,
        scorers: scorers.status === "fulfilled" ? scorers.value.data : null,
        matches: matches.status === "fulfilled" ? matches.value.data : null,
        teams: teams.status === "fulfilled" ? teams.value.data : null
    };
};

const isEmptySeason = (standings) => {
    const table = standings?.standings?.[0]?.table || [];
    return table.length > 0 && table.every((row) => Number(row.playedGames) === 0);
};

const buildSummary = (code, bundle, source) => {
    const meta = COMPETITION_META[code];
    const seasonStart = source.seasonStart ||
        Number(bundle.standings?.season?.startDate?.slice(0, 4)) ||
        getPreviousCompletedSeasonStart();
    const table = bundle.standings?.standings?.[0]?.table || [];
    const teams = bundle.teams?.teams || table.map((row) => row.team);
    const finished = (bundle.matches?.matches || []).filter((match) => match.status === "FINISHED");
    const goals = finished.reduce(
        (sum, match) => sum + (match.score?.fullTime?.home ?? 0) + (match.score?.fullTime?.away ?? 0),
        0
    );

    return {
        competition: {
            ...meta,
            emblem: bundle.standings?.competition?.emblem || bundle.teams?.competition?.emblem,
            displaySeason: seasonLabel(seasonStart),
            dataMode: source.mode,
            note: source.note
        },
        standings: bundle.standings?.standings || [],
        players: bundle.scorers?.scorers || [],
        matches: bundle.matches?.matches || [],
        teams,
        insights: {
            matchesPlayed: finished.length,
            totalGoals: goals,
            averageGoals: finished.length ? (goals / finished.length).toFixed(1) : "--",
            totalTeams: teams.length || table.length
        }
    };
};

router.get("/", async (req, res) => {

    try {

        const footballAPI = axios.create({
            baseURL: process.env.FOOTBALL_API_BASE_URL,
            headers: {
                "X-Auth-Token": process.env.FOOTBALL_API_KEY
            }
        });

        console.log("Base URL:", process.env.FOOTBALL_API_BASE_URL);

        const response = await footballAPI.get("/competitions");

        const competitions = response.data.competitions
            .filter(c => allowedCodes.includes(c.code))
            .map(c => ({
                ...c,
                ...COMPETITION_META[c.code]
            }));

        res.json(competitions);

    } catch (err) {

        console.log(err.response?.data || err.message);

        res.status(500).json({
            error: err.message
        });

    }

});

router.get("/:code/summary", async (req, res) => {
    const code = String(req.params.code || "").toUpperCase();

    if (!allowedCodes.includes(code)) {
        return res.status(404).json({ error: "Competition is not supported yet." });
    }

    const cacheKey = `summary:${code}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    try {
        let bundle = await fetchCompetitionBundle(code);
        let source = {
            mode: "live",
            seasonStart: Number(bundle.standings?.season?.startDate?.slice(0, 4)),
            note: "Live season data"
        };

        if (!bundle.standings || isEmptySeason(bundle.standings)) {
            const previousSeasonStart = getPreviousCompletedSeasonStart();
            bundle = await fetchCompetitionBundle(code, previousSeasonStart);
            source = {
                mode: "previous",
                seasonStart: previousSeasonStart,
                note: `Showing ${seasonLabel(previousSeasonStart)} data until the new season has enough activity.`
            };
        }

        res.json(setCache(cacheKey, buildSummary(code, bundle, source)));
    } catch (err) {
        console.log(err.response?.data || err.message);
        res.status(500).json({ error: "Failed to fetch competition summary." });
    }
});

module.exports = router;
