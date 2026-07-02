const axios = require("axios");

const footballAPI = axios.create({
    baseURL: process.env.FOOTBALL_API_BASE_URL,
    headers: {
        "X-Auth-Token": process.env.FOOTBALL_API_KEY
    }
});

module.exports = footballAPI;