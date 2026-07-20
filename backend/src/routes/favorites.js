const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  listFavorites,
  addTeam,
  addPlayer,
  addMatch,
  removeFavorite
} = require("../controllers/favoriteController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", listFavorites);
router.post("/teams", addTeam);
router.post("/players", addPlayer);
router.post("/matches", addMatch);
router.delete("/:type/:id", removeFavorite);

module.exports = router;
