const express = require("express");
const axios = require("axios");
const { findFallbackMatch } = require("../data/fallbackContent");

const router = express.Router();

const footballAPI = axios.create({
    baseURL: process.env.FOOTBALL_API_BASE_URL || "https://api.football-data.org/v4",
    headers: {
        "X-Auth-Token": process.env.FOOTBALL_API_KEY
    }
});

// GET /api/match/:id
// Example:
// /api/match/497410

router.get("/:id", async (req, res) => {

    const id = req.params.id;

    try {

        const response = await footballAPI.get(`/matches/${id}`);

        const match = response.data;

        res.json({

            id: match.id,

            utcDate: match.utcDate,

            status: match.status,

            stage: match.stage,

            matchday: match.matchday,

            venue: match.venue,

            attendance: match.attendance,

            referees: match.referees,

            competition: {

                id: match.competition.id,

                name: match.competition.name,

                code: match.competition.code,

                emblem: match.competition.emblem

            },

            season: match.season,

            homeTeam: match.homeTeam,

            awayTeam: match.awayTeam,

            score: match.score,

            odds: match.odds,

            lastUpdated: match.lastUpdated

        });

    }

    catch (err) {

        console.log(
            err.response?.data ||
            err.message
        );

        const fallback = findFallbackMatch(id);
        if (fallback) {
            return res.json(fallback);
        }

        res.status(500).json({
            error: "Failed to fetch match."
        });

    }

});

module.exports = router;
