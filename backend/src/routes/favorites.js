const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  listFavorites,
  addTeam,
  addPlayer,
  addMatch,
  removeFavorite,
} = require("../controllers/favoriteController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Manage user's favorite teams, players and matches
 */

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Get all favorites
 *     description: Returns all favorite teams, players and matches for the authenticated user.
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favorites retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.use(authMiddleware);

router.get("/", listFavorites);

/**
 * @swagger
 * /api/favorites/teams:
 *   post:
 *     summary: Add a favorite team
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamId
 *             properties:
 *               teamId:
 *                 type: integer
 *                 example: 33
 *     responses:
 *       201:
 *         description: Team added to favorites
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post("/teams", addTeam);

/**
 * @swagger
 * /api/favorites/players:
 *   post:
 *     summary: Add a favorite player
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *             properties:
 *               playerId:
 *                 type: integer
 *                 example: 276
 *     responses:
 *       201:
 *         description: Player added to favorites
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post("/players", addPlayer);

/**
 * @swagger
 * /api/favorites/matches:
 *   post:
 *     summary: Add a favorite match
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fixtureId
 *             properties:
 *               fixtureId:
 *                 type: integer
 *                 example: 1034567
 *     responses:
 *       201:
 *         description: Match added to favorites
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post("/matches", addMatch);

/**
 * @swagger
 * /api/favorites/{type}/{id}:
 *   delete:
 *     summary: Remove a favorite
 *     description: Remove a favorite team, player or match.
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [teams, players, matches]
 *         example: teams
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 33
 *     responses:
 *       200:
 *         description: Favorite removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Favorite not found
 */
router.delete("/:type/:id", removeFavorite);

module.exports = router;