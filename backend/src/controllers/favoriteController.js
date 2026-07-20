const prisma = require("../config/prisma");

const userIdFromRequest = (req) => req.user.id;

const listFavorites = async (req, res) => {
  try {
    const userId = userIdFromRequest(req);
    const [teams, players, matches] = await Promise.all([
      prisma.favoriteTeam.findMany({ where: { userId }, orderBy: { id: "desc" } }),
      prisma.favoritePlayer.findMany({ where: { userId }, orderBy: { id: "desc" } }),
      prisma.favoriteMatch.findMany({ where: { userId }, orderBy: { id: "desc" } })
    ]);

    res.json({ teams, players, matches });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to load favorites" });
  }
};

const addTeam = async (req, res) => {
  try {
    const userId = userIdFromRequest(req);
    const { teamId, teamName, teamLogo } = req.body;

    if (!teamId || !teamName) {
      return res.status(400).json({ message: "teamId and teamName are required" });
    }

    const existing = await prisma.favoriteTeam.findFirst({
      where: { userId, teamId: Number(teamId) }
    });

    if (existing) return res.json(existing);

    const favorite = await prisma.favoriteTeam.create({
      data: { userId, teamId: Number(teamId), teamName, teamLogo }
    });

    res.status(201).json(favorite);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to save team" });
  }
};

const addPlayer = async (req, res) => {
  try {
    const userId = userIdFromRequest(req);
    const { playerId, playerName, playerPhoto, teamName } = req.body;

    if (!playerId || !playerName) {
      return res.status(400).json({ message: "playerId and playerName are required" });
    }

    const existing = await prisma.favoritePlayer.findFirst({
      where: { userId, playerId: Number(playerId) }
    });

    if (existing) return res.json(existing);

    const favorite = await prisma.favoritePlayer.create({
      data: { userId, playerId: Number(playerId), playerName, playerPhoto, teamName }
    });

    res.status(201).json(favorite);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to save player" });
  }
};

const addMatch = async (req, res) => {
  try {
    const userId = userIdFromRequest(req);
    const { matchId, homeTeam, awayTeam, kickoff } = req.body;

    if (!matchId || !homeTeam || !awayTeam) {
      return res.status(400).json({ message: "matchId, homeTeam and awayTeam are required" });
    }

    const existing = await prisma.favoriteMatch.findFirst({
      where: { userId, matchId: Number(matchId) }
    });

    if (existing) return res.json(existing);

    const favorite = await prisma.favoriteMatch.create({
      data: {
        userId,
        matchId: Number(matchId),
        homeTeam,
        awayTeam,
        kickoff: kickoff ? new Date(kickoff) : new Date()
      }
    });

    res.status(201).json(favorite);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to save match" });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const userId = userIdFromRequest(req);
    const { type, id } = req.params;
    const where = { id: Number(id), userId };

    if (type === "team") await prisma.favoriteTeam.deleteMany({ where });
    if (type === "player") await prisma.favoritePlayer.deleteMany({ where });
    if (type === "match") await prisma.favoriteMatch.deleteMany({ where });

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to remove favorite" });
  }
};

module.exports = {
  listFavorites,
  addTeam,
  addPlayer,
  addMatch,
  removeFavorite
};
