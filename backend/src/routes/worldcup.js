const express = require('express')
const axios = require('axios')
const { fallbackWorldCup } = require("../data/fallbackContent");
const router = express.Router()

const WC_BASE = 'https://worldcup26.ir'
const CACHE_DURATION = 5 * 60 * 1000
const cache = {}
const FALLBACK_WC_HOME = fallbackWorldCup

const getCached = (key) => {
    const hit = cache[key]
    if (!hit || Date.now() - hit.time > CACHE_DURATION) return null
    return hit.data
}

const setCached = (key, data) => {
    cache[key] = { time: Date.now(), data }
    return data
}

const fetchTeams = async () => {
    const cached = getCached('teams')
    if (cached) return cached

    const response = await axios.get(`${WC_BASE}/get/teams`)
    return setCached('teams', response.data.teams)
}

const fetchMatches = async () => {
    const cached = getCached('matches')
    if (cached) return cached

    const [gamesRes, teams] = await Promise.all([
        axios.get(`${WC_BASE}/get/games`),
        fetchTeams()
    ])

    const teamMap = {}
    teams.forEach(t => { teamMap[t.id] = t })

    const matches = gamesRes.data.games.map(m => ({
        ...m,
        home_team: teamMap[m.home_team_id] || { name_en: m.home_team_name_en, flag: '' },
        away_team: teamMap[m.away_team_id] || { name_en: m.away_team_name_en, flag: '' },
    }))

    return setCached('matches', matches)
}

const fetchGroups = async () => {
    const cached = getCached('groups')
    if (cached) return cached

    const [groupsRes, teams] = await Promise.all([
        axios.get(`${WC_BASE}/get/groups`),
        fetchTeams()
    ])

    const teamMap = {}
    teams.forEach(t => { teamMap[t.id] = t })

    const groups = groupsRes.data.groups.map(group => ({
        name: group.name,
        teams: group.teams
            .map(t => ({
                ...t,
                team: teamMap[t.team_id] || { name_en: 'Unknown', flag: '' }
            }))
            .sort((a, b) => Number(b.pts) - Number(a.pts) || Number(b.gd) - Number(a.gd))
    }))

    groups.sort((a, b) => a.name.localeCompare(b.name))
    return setCached('groups', groups)
}

// GET /api/worldcup/groups
router.get('/groups', async (req, res) => {
    try {
        res.json(await fetchGroups())
    } catch (error) {
        console.error('Error fetching World Cup groups:', error.message)
        res.json(fallbackWorldCup.groups)
    }
})

// GET /api/worldcup/matches
router.get('/matches', async (req, res) => {
    try {
        res.json(await fetchMatches())
    } catch (error) {
        console.error('Error fetching WC matches:', error.message)
        res.json(fallbackWorldCup.matches)
    }
})

// GET /api/worldcup/teams
router.get('/teams', async (req, res) => {
    try {
        res.json(await fetchTeams())
    } catch (error) {
        res.json(fallbackWorldCup.teams)
    }
})

// GET /api/worldcup/home
router.get('/home', async (req, res) => {
    try {
        const [matches, groups, teams] = await Promise.all([
            fetchMatches(),
            fetchGroups(),
            fetchTeams()
        ])

        res.json({ matches, groups, teams })
    } catch (error) {
        console.error('Error fetching WC home:', error.message)
        res.json(FALLBACK_WC_HOME)
    }
})

module.exports = router
