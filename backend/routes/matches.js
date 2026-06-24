const express = require('express')
const axios = require('axios')
const router = express.Router()

// Base config for every football API request
const footballAPI = axios.create({
    baseURL: process.env.FOOTBALL_API_BASE_URL,
    headers: {
        'X-Auth-Token': process.env.FOOTBALL_API_KEY
    }
})

// Competition IDs on football-data.org
// PL = Premier League, CL = Champions League
const COMPETITIONS = {
    premierLeague: 'PL',
    championsLeague: 'CL'
}

// GET /api/matches/live
// Returns today's matches across both competitions
router.get('/live', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0] // "2024-01-15"

        const [plMatches, clMatches] = await Promise.all([
            footballAPI.get(`/competitions/${COMPETITIONS.premierLeague}/matches`, {
                params: { dateFrom: today, dateTo: today }
            }),
            footballAPI.get(`/competitions/${COMPETITIONS.championsLeague}/matches`, {
                params: { dateFrom: today, dateTo: today }
            })
        ])

        res.json({
            premierLeague: plMatches.data.matches,
            championsLeague: clMatches.data.matches
        })
    } catch (error) {
        console.error('Error fetching matches:', error.message)
        res.status(500).json({ error: 'Failed to fetch matches' })
    }
})

// GET /api/matches/upcoming
// Returns next 7 days of fixtures
router.get('/upcoming', async (req, res) => {
    try {
        const today = new Date()
        const nextWeek = new Date(today)
        nextWeek.setDate(today.getDate() + 7)

        const dateFrom = today.toISOString().split('T')[0]
        const dateTo = nextWeek.toISOString().split('T')[0]

        const [plFixtures, clFixtures] = await Promise.all([
            footballAPI.get(`/competitions/${COMPETITIONS.premierLeague}/matches`, {
                params: { dateFrom, dateTo }
            }),
            footballAPI.get(`/competitions/${COMPETITIONS.championsLeague}/matches`, {
                params: { dateFrom, dateTo }
            })
        ])

        res.json({
            premierLeague: plFixtures.data.matches,
            championsLeague: clFixtures.data.matches
        })
    } catch (error) {
        console.error('Error fetching fixtures:', error.message)
        res.status(500).json({ error: 'Failed to fetch fixtures' })
    }
})

module.exports = router