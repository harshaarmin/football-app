const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/", async (req, res) => {

    try {

        const footballAPI = axios.create({
            baseURL: process.env.FOOTBALL_API_BASE_URL,
            headers: {
                "X-Auth-Token": process.env.FOOTBALL_API_KEY
            }
        });

        console.log("Base URL:", process.env.FOOTBALL_API_BASE_URL);

        const response = await footballAPI.get("/competitions");

        const allowed = [
            "PL",
            "PD",
            "BL1",
            "SA",
            "FL1",
            "CL"
        ];

        const competitions = response.data.competitions
            .filter(c => allowed.includes(c.code));

        res.json(competitions);

    } catch (err) {

        console.log(err.response?.data || err.message);

        res.status(500).json({
            error: err.message
        });

    }

});

module.exports = router;