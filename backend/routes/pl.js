const express = require("express");
const footballAPI = require("../services/footballApi");

const router = express.Router();

let cache = null;
let cacheTime = 0;

const CACHE_DURATION = 5 * 60 * 1000;

const clubFacts = {
    ARS: { founded: 1886, capacity: "60,704", majorHonours: "13 league titles", nickname: "Gunners" },
    AVL: { founded: 1874, capacity: "42,657", majorHonours: "7 league titles", nickname: "Villans" },
    BOU: { founded: 1899, capacity: "11,307", majorHonours: "Premier League regulars", nickname: "Cherries" },
    BRE: { founded: 1889, capacity: "17,250", majorHonours: "Top-flight return story", nickname: "Bees" },
    BHA: { founded: 1901, capacity: "31,876", majorHonours: "European qualification", nickname: "Seagulls" },
    BUR: { founded: 1882, capacity: "21,944", majorHonours: "2 league titles", nickname: "Clarets" },
    CHE: { founded: 1905, capacity: "40,343", majorHonours: "6 league titles", nickname: "Blues" },
    CRY: { founded: 1905, capacity: "25,486", majorHonours: "FA Cup finalists", nickname: "Eagles" },
    EVE: { founded: 1878, capacity: "39,414", majorHonours: "9 league titles", nickname: "Toffees" },
    FUL: { founded: 1879, capacity: "25,700", majorHonours: "European finalist", nickname: "Cottagers" },
    IPS: { founded: 1878, capacity: "29,673", majorHonours: "1 league title", nickname: "Tractor Boys" },
    LEE: { founded: 1919, capacity: "37,792", majorHonours: "3 league titles", nickname: "Whites" },
    LEI: { founded: 1884, capacity: "32,312", majorHonours: "1 Premier League title", nickname: "Foxes" },
    LIV: { founded: 1892, capacity: "61,276", majorHonours: "19 league titles", nickname: "Reds" },
    MCI: { founded: 1880, capacity: "53,400", majorHonours: "10 league titles", nickname: "Cityzens" },
    MUN: { founded: 1878, capacity: "74,310", majorHonours: "20 league titles", nickname: "Red Devils" },
    NEW: { founded: 1892, capacity: "52,305", majorHonours: "4 league titles", nickname: "Magpies" },
    NFO: { founded: 1865, capacity: "30,445", majorHonours: "2 European Cups", nickname: "Forest" },
    NOR: { founded: 1902, capacity: "27,244", majorHonours: "2 League Cups", nickname: "Canaries" },
    SOU: { founded: 1885, capacity: "32,384", majorHonours: "1 FA Cup", nickname: "Saints" },
    SUN: { founded: 1879, capacity: "49,000", majorHonours: "6 league titles", nickname: "Black Cats" },
    TOT: { founded: 1882, capacity: "62,850", majorHonours: "2 league titles", nickname: "Spurs" },
    WHU: { founded: 1895, capacity: "62,500", majorHonours: "3 FA Cups", nickname: "Hammers" },
    WOL: { founded: 1877, capacity: "31,750", majorHonours: "3 league titles", nickname: "Wolves" }
};

const getPreviousCompletedSeasonStart = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return month >= 6 ? year - 1 : year - 2;
};

const seasonLabel = (startYear) => `${startYear}/${String(startYear + 1).slice(2)}`;

const fetchSeasonBundle = async (seasonStart) => {
    const params = seasonStart ? { season: seasonStart } : undefined;
    const [standings, scorers, matches] = await Promise.all([
        footballAPI.get("/competitions/PL/standings", { params }),
        footballAPI.get("/competitions/PL/scorers", { params }),
        footballAPI.get("/competitions/PL/matches", { params })
    ]);

    return {
        standings: standings.data,
        scorers: scorers.data,
        matches: matches.data
    };
};

const isEmptySeason = (standings) => {
    const table = standings?.standings?.[0]?.table || [];
    return table.length === 0 || table.every((row) => Number(row.playedGames) === 0);
};

const buildPayload = (bundle, source) => {
    const table = bundle.standings.standings?.[0]?.table || [];
    const sourceSeason = source.seasonStart || Number(bundle.standings.season?.startDate?.slice(0, 4));
    const clubs = table.map((row) => {
        const fact = clubFacts[row.team.tla] || {};
        return {
            ...row.team,
            facts: {
                founded: row.team.founded || fact.founded || "--",
                venue: row.team.venue || "TBA",
                capacity: fact.capacity || "TBA",
                majorHonours: fact.majorHonours || "Top-flight club",
                nickname: fact.nickname || row.team.shortName || row.team.name,
                lastSeasonFinish: row.position
            }
        };
    });

    return {
        competition: {
            code: "PL",
            name: "Premier League",
            emblem: bundle.standings.competition?.emblem,
            currentSeason: bundle.standings.season,
            displaySeason: seasonLabel(sourceSeason),
            dataMode: source.mode,
            note: source.note
        },
        standings: bundle.standings.standings || [],
        players: bundle.scorers.scorers || [],
        clubs,
        matches: bundle.matches.matches || []
    };
};

router.get("/home", async (req, res) => {

    if (cache && Date.now() - cacheTime < CACHE_DURATION) {
        return res.json(cache);
    }

    try {
        let bundle = await fetchSeasonBundle();
        let source = {
            mode: "live",
            seasonStart: Number(bundle.standings.season?.startDate?.slice(0, 4)),
            note: "Live Premier League season data"
        };

        if (isEmptySeason(bundle.standings)) {
            const previousSeasonStart = getPreviousCompletedSeasonStart();
            bundle = await fetchSeasonBundle(previousSeasonStart);
            source = {
                mode: "previous",
                seasonStart: previousSeasonStart,
                note: `New season has not started. Showing ${seasonLabel(previousSeasonStart)} final data.`
            };
        }

        const data = buildPayload(bundle, source);

        cache = data;
        cacheTime = Date.now();

        res.json(data);

    } catch (err) {

        console.log(err.response?.data || err.message);

        res.status(500).json({
            error: "Failed to fetch Premier League data."
        });

    }

});

module.exports = router;
