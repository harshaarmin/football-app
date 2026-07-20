const express = require("express");
const footballAPI = require("../services/footballApi");

const router = express.Router();
const cache = {};
const CACHE_DURATION = 10 * 60 * 1000;

const getCached = (key) => {
  const hit = cache[key];
  if (!hit || Date.now() - hit.time > CACHE_DURATION) return null;
  return hit.data;
};

const setCached = (key, data) => {
  cache[key] = { time: Date.now(), data };
  return data;
};

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const cached = getCached(id);
  if (cached) return res.json(cached);

  try {
    const [teamRes, matchesRes] = await Promise.allSettled([
      footballAPI.get(`/teams/${id}`),
      footballAPI.get(`/teams/${id}/matches`)
    ]);

    const team = teamRes.status === "fulfilled" ? teamRes.value.data : null;
    const matches = matchesRes.status === "fulfilled" ? matchesRes.value.data.matches : [];

    if (!team) {
      return res.status(404).json({ error: "Team not found." });
    }

    let leagueStanding = null;
    const allowedLeagues = ["PL", "PD", "BL1", "SA", "FL1"];
    const activeLeague = team.runningCompetitions?.find(c => allowedLeagues.includes(c.code));
    
    if (activeLeague) {
      try {
        const standingsRes = await footballAPI.get(`/competitions/${activeLeague.code}/standings`);
        const standings = standingsRes.data?.standings?.[0]?.table || [];
        const standingRow = standings.find(row => row.team?.id === Number(id));
        if (standingRow) {
          leagueStanding = {
            position: standingRow.position,
            points: standingRow.points,
            playedGames: standingRow.playedGames,
            won: standingRow.won,
            draw: standingRow.draw,
            lost: standingRow.lost,
            goalDifference: standingRow.goalDifference,
            leagueName: activeLeague.name,
            leagueCode: activeLeague.code
          };
        }
      } catch (standingsErr) {
        console.log("Failed to fetch standings for team league:", standingsErr.message);
      }
    }

    res.json(setCached(id, {
      team,
      matches,
      leagueStanding,
      form: matches
        .filter((match) => match.status === "FINISHED")
        .slice(-8)
        .map((match) => ({
          id: match.id,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          score: match.score,
          utcDate: match.utcDate,
          competition: match.competition
        }))
    }));
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch team." });
  }
});

module.exports = router;
