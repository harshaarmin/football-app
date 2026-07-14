const express = require("express");
const axios = require("axios");
const Parser = require("rss-parser");

const router = express.Router();
const parser = new Parser();

const footballAPI = axios.create({
    baseURL: process.env.FOOTBALL_API_BASE_URL,
    headers: {
        "X-Auth-Token": process.env.FOOTBALL_API_KEY
    }
});

router.get("/", async (req, res) => {

    const query = (req.query.q || "").toLowerCase();

    if (!query) {
        return res.status(400).json({
            error: "Search query is required."
        });
    }

    try {

        const leagues = [
            "PL",
            "PD",
            "SA",
            "BL1",
            "FL1",
            "CL"
        ];

        // Competitions
        const competitionsResponse =
            await footballAPI.get("/competitions");

        const competitions =
            competitionsResponse.data.competitions.filter(c =>
                c.name.toLowerCase().includes(query)
            );

        // Teams
        const teams = [];

        for (const league of leagues) {

            const response =
                await footballAPI.get(`/competitions/${league}/teams`);

            response.data.teams.forEach(team => {

                if (
                    team.name.toLowerCase().includes(query)
                ) {

                    teams.push({

                        id: team.id,

                        name: team.name,

                        crest: team.crest,

                        league

                    });

                }

            });

        }

        // Players
        const players = [];

        for (const league of leagues) {

            const response =
                await footballAPI.get(`/competitions/${league}/scorers`);

            response.data.scorers.forEach(player => {

                if (

                    player.player.name
                        .toLowerCase()
                        .includes(query)

                ) {

                    players.push({

                        id: player.player.id,

                        name: player.player.name,

                        team: player.team.name,

                        goals: player.goals

                    });

                }

            });

        }

        // BBC News
        const feed = await parser.parseURL(
            "https://feeds.bbci.co.uk/sport/football/rss.xml"
        );

        const news = feed.items.filter(article =>
            article.title.toLowerCase().includes(query)
        );

        res.json({

            competitions,

            teams,

            players,

            news

        });

    }

    catch (err) {

        console.log(err.response?.data || err.message);

        res.status(500).json({

            error: "Search failed."

        });

    }

});

module.exports = router;