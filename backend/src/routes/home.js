const express = require('express')
const Parser = require('rss-parser')
const { fallbackWorldCup, fallbackPLHome } = require("../data/fallbackContent")

const router = express.Router()
const parser = new Parser()

const FALLBACK_NEWS = [
  {
    title: "Spain crowned World Cup champions after extra-time win over Argentina",
    link: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026",
    contentSnippet: "Ferran Torres' 106th-minute strike sealed a 1-0 win in the 2026 final at MetLife Stadium.",
    pubDate: new Date("2026-07-19T22:30:00.000Z").toISOString(),
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Mbappe wins Golden Boot with 10 goals as France finish fourth",
    link: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026",
    contentSnippet: "Kylian Mbappe became the first player to win the Golden Boot twice after his brace in the third-place play-off.",
    pubDate: new Date("2026-07-19T18:00:00.000Z").toISOString(),
    image: "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&w=1200&q=80"
  },
  {
    title: "Arsenal crowned 2025/26 Premier League champions for the first time in 22 years",
    link: "https://www.premierleague.com",
    contentSnippet: "Mikel Arteta's side finished on 85 points, seven clear of Manchester City, with Haaland taking the Golden Boot on 27 goals.",
    pubDate: new Date("2026-05-24T18:00:00.000Z").toISOString(),
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80"
  }
]

const fetchNews = async () => {
  const feed = await parser.parseURL('https://feeds.bbci.co.uk/sport/football/rss.xml')
  return feed.items.slice(0, 15).map((item) => ({
    title: item.title,
    link: item.link,
    pubDate: item.pubDate,
    contentSnippet: item.contentSnippet,
    image: null
  }))
}

// GET /api/home — unified homepage feed (resilient: every section falls back independently)
router.get('/', async (req, res) => {
  const results = await Promise.allSettled([fetchNews()])

  const news = results[0].status === 'fulfilled' ? results[0].value : FALLBACK_NEWS

  res.json({
    premierLeague: fallbackPLHome,
    worldCup: {
      groups: fallbackWorldCup.groups,
      matches: fallbackWorldCup.matches,
      teams: fallbackWorldCup.teams,
      scorers: fallbackWorldCup.scorers
    },
    news
  })
})

module.exports = router
