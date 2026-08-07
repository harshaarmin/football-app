const express = require('express')
const { fallbackWorldCup } = require("../data/fallbackContent");
const router = express.Router()

/*
|--------------------------------------------------------------------------
| FIFA World Cup 2026 — archived results
|--------------------------------------------------------------------------
| The tournament concluded on 19 July 2026 (Spain 1-0 Argentina a.e.t.).
| The former live source (worldcup26.ir) is no longer serving data, so
| this endpoint serves the complete archived record of the tournament.
|--------------------------------------------------------------------------
*/

// GET /api/worldcup/groups
router.get('/groups', (req, res) => {
  res.json(fallbackWorldCup.groups)
})

// GET /api/worldcup/matches
router.get('/matches', (req, res) => {
  res.json(fallbackWorldCup.matches)
})

// GET /api/worldcup/teams
router.get('/teams', (req, res) => {
  res.json(fallbackWorldCup.teams)
})

// GET /api/worldcup/scorers
router.get('/scorers', (req, res) => {
  res.json(fallbackWorldCup.scorers)
})

// GET /api/worldcup/home
router.get('/home', (req, res) => {
  res.json({
    matches: fallbackWorldCup.matches,
    groups: fallbackWorldCup.groups,
    teams: fallbackWorldCup.teams,
    scorers: fallbackWorldCup.scorers
  })
})

module.exports = router
