const express = require('express')
const axios = require('axios')
const router = express.Router()

const footballAPI = axios.create({
    baseURL: process.env.FOOTBALL_API_BASE_URL,
    headers: {
        'X-Auth-Token': process.env.FOOTBALL_API_KEY
    }
})

// GET /api/standings/pl
router.get('/pl', async (req, res) => {
    try {
        const response = await footballAPI.get('/competitions/PL/standings')
        res.json(response.data.standings[0].table)
    } catch (error) {
        console.error('Error fetching PL standings:', error.message)
        res.status(500).json({ error: 'Failed to fetch standings' })
    }
})

// GET /api/standings/cl
router.get('/cl', async (req, res) => {
    try {
        const response = await footballAPI.get('/competitions/CL/standings')
        res.json(response.data)
    } catch (error) {
        console.error('Error fetching CL standings:', error.message)
        res.status(500).json({ error: 'Failed to fetch standings' })
    }
})

module.exports = router