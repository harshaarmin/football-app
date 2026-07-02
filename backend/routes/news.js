const express = require('express')
const Parser = require('rss-parser')
const axios = require('axios')
const cheerio = require('cheerio')

const router = express.Router()
const parser = new Parser()
const CACHE_DURATION = 10 * 60 * 1000
const feedCache = {}

const fromCache = (key) => {
    const hit = feedCache[key]
    if (!hit || Date.now() - hit.time > CACHE_DURATION) return null
    return hit.data
}

const saveCache = (key, data) => {
    feedCache[key] = { time: Date.now(), data }
    return data
}

const scrapeImage = async (url) => {
    try {
        const response = await axios.get(url, { timeout: 4000, headers: { 'User-Agent': 'Mozilla/5.0' } })
        const $ = cheerio.load(response.data)
        return $('meta[property="og:image"]').attr('content') || null
    } catch {
        return null
    }
}

const fetchFeed = async (url, limit = 10) => {
    const cacheKey = `${url}:${limit}`
    const cached = fromCache(cacheKey)
    if (cached) return cached

    const feed = await parser.parseURL(url)
    const articles = await Promise.all(
        feed.items.slice(0, limit).map(async (item) => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            content: item.contentSnippet,
            image: await scrapeImage(item.link)
        }))
    )
    return saveCache(cacheKey, articles)
}

// GET /api/news — general football news
router.get('/', async (req, res) => {
    try {
        const articles = await fetchFeed('https://feeds.bbci.co.uk/sport/football/rss.xml', 15)
        res.json(articles)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// GET /api/news/pl — Premier League specific news
router.get('/pl', async (req, res) => {
    try {
        const articles = await fetchFeed('https://feeds.bbci.co.uk/sport/football/premier-league/rss.xml', 12)
        res.json(articles)
    } catch (err) {
        // fallback to general football news filtered
        try {
            const articles = await fetchFeed('https://feeds.bbci.co.uk/sport/football/rss.xml', 12)
            res.json(articles)
        } catch (e) {
            res.status(500).json({ error: e.message })
        }
    }
})

// GET /api/news/worldcup — free RSS fallback for tournament story cards
router.get('/worldcup', async (req, res) => {
    try {
        const articles = await fetchFeed('https://feeds.bbci.co.uk/sport/football/rss.xml', 12)
        const filtered = articles.filter(article =>
            /world cup|fifa|international|qualifier|tournament|mexico|canada|usa/i.test(
                `${article.title} ${article.content || ''}`
            )
        )
        res.json(filtered.length ? filtered : articles.slice(0, 8))
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router
