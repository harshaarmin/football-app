const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ================= ROUTES =================

const homeRouter = require("./routes/home");
const competitionsRouter = require("./routes/competitions");
const worldcupRouter = require("./routes/worldcup");
const newsRouter = require("./routes/news");
const searchRouter = require("./routes/search");
const matchRouter = require("./routes/match");
const plRouter = require("./routes/pl");

// ================= ROOT =================

app.get("/", (req, res) => {

    res.json({

        app: "Football Hub API",

        version: "2.0.0",

        status: "Running"

    });

});

// ================= API =================

app.use("/api/home", homeRouter);

app.use("/api/competitions", competitionsRouter);

app.use("/api/worldcup", worldcupRouter);

app.use("/api/news", newsRouter);

app.use("/api/search", searchRouter);

app.use("/api/match", matchRouter);

app.use("/api/pl", plRouter);

// ================= SERVER =================

app.listen(PORT, () => {

    console.log("");
    console.log("=====================================");
    console.log("⚽ Football Hub Backend Started");
    console.log(`🚀 http://localhost:${PORT}`);
    console.log("=====================================");
    console.log("");

});