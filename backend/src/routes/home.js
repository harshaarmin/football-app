const express = require('express')
const axios = require('axios')
const Parser = require('rss-parser')

const router = express.Router()
const parser = new Parser()

const WC_BASE = 'https://worldcup26.ir'

const footballAPI = axios.create({
    baseURL: process.env.FOOTBALL_API_BASE_URL,
    headers: {
        'X-Auth-Token': process.env.FOOTBALL_API_KEY
    }
})

router.get('/', async (req, res) => {

    try {

        const [

            plStandings,

            plMatches,

            wcMatches,

            wcGroups,

            teams,

            news

        ] = await Promise.all([

            footballAPI.get('/competitions/PL/standings'),

            footballAPI.get('/competitions/PL/matches'),

            axios.get(`${WC_BASE}/get/games`),

            axios.get(`${WC_BASE}/get/groups`),

            axios.get(`${WC_BASE}/get/teams`),

            parser.parseURL(
                'https://feeds.bbci.co.uk/sport/football/rss.xml'
            )

        ])

        res.json({

            premierLeague: {

                standings: plStandings.data.standings[0].table,

                matches: plMatches.data.matches

            },

            worldCup: {

                groups: wcGroups.data.groups,

                matches: wcMatches.data.games,

                teams: teams.data.teams

            },

            news: news.items.slice(0, 15)

        })

    }

    catch (err) {

        console.log(err.message)

        res.status(500).json({

            error: err.message

        })

    }

})

module.exports = router