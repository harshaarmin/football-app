const prisma = require("../config/prisma");

const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const userIdFromRequest = (req) => req.user.id;

// ================= List Favorites =================

const listFavorites = asyncHandler(async (req, res) => {
  const userId = userIdFromRequest(req);

  const [teams, players, matches] = await Promise.all([
    prisma.favoriteTeam.findMany({
      where: { userId },
      orderBy: { id: "desc" },
    }),
    prisma.favoritePlayer.findMany({
      where: { userId },
      orderBy: { id: "desc" },
    }),
    prisma.favoriteMatch.findMany({
      where: { userId },
      orderBy: { id: "desc" },
    }),
  ]);

  res.json({
    teams,
    players,
    matches,
  });
});

// ================= Add Team =================

const addTeam = asyncHandler(async (req, res) => {
  const userId = userIdFromRequest(req);

  const { teamId, teamName, teamLogo } = req.body;

  if (!teamId || !teamName) {
    throw new AppError("teamId and teamName are required", 400);
  }

  const existing = await prisma.favoriteTeam.findFirst({
    where: {
      userId,
      teamId: Number(teamId),
    },
  });

  if (existing) {
    return res.json(existing);
  }

  const favorite = await prisma.favoriteTeam.create({
    data: {
      userId,
      teamId: Number(teamId),
      teamName,
      teamLogo,
    },
  });

  res.status(201).json(favorite);
});

// ================= Add Player =================

const addPlayer = asyncHandler(async (req, res) => {
  const userId = userIdFromRequest(req);

  const { playerId, playerName, playerPhoto, teamName } = req.body;

  if (!playerId || !playerName) {
    throw new AppError("playerId and playerName are required", 400);
  }

  const existing = await prisma.favoritePlayer.findFirst({
    where: {
      userId,
      playerId: Number(playerId),
    },
  });

  if (existing) {
    return res.json(existing);
  }

  const favorite = await prisma.favoritePlayer.create({
    data: {
      userId,
      playerId: Number(playerId),
      playerName,
      playerPhoto,
      teamName,
    },
  });

  res.status(201).json(favorite);
});

// ================= Add Match =================

const addMatch = asyncHandler(async (req, res) => {
  const userId = userIdFromRequest(req);

  const { matchId, homeTeam, awayTeam, kickoff } = req.body;

  if (!matchId || !homeTeam || !awayTeam) {
    throw new AppError(
      "matchId, homeTeam and awayTeam are required",
      400
    );
  }

  const existing = await prisma.favoriteMatch.findFirst({
    where: {
      userId,
      matchId: Number(matchId),
    },
  });

  if (existing) {
    return res.json(existing);
  }

  const favorite = await prisma.favoriteMatch.create({
    data: {
      userId,
      matchId: Number(matchId),
      homeTeam,
      awayTeam,
      kickoff: kickoff ? new Date(kickoff) : new Date(),
    },
  });

  res.status(201).json(favorite);
});

// ================= Remove Favorite =================

const removeFavorite = asyncHandler(async (req, res) => {
  const userId = userIdFromRequest(req);

  const { type, id } = req.params;

  const where = {
    id: Number(id),
    userId,
  };

  switch (type) {
    case "team":
      await prisma.favoriteTeam.deleteMany({ where });
      break;

    case "player":
      await prisma.favoritePlayer.deleteMany({ where });
      break;

    case "match":
      await prisma.favoriteMatch.deleteMany({ where });
      break;

    default:
      throw new AppError("Invalid favorite type", 400);
  }

  res.json({
    success: true,
  });
});

module.exports = {
  listFavorites,
  addTeam,
  addPlayer,
  addMatch,
  removeFavorite,
};