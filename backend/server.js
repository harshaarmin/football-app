const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

// Load your .env variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware — runs on every request
app.use(cors())          // allow frontend to talk to this server
app.use(express.json())  // parse incoming JSON

// Health check route — just to confirm server is alive
app.get('/', (req, res) => {
    res.json({ message: 'Football app backend is running!' })
})

// Import routes (we'll create these next)
const matchesRouter = require('./routes/matches')
const standingsRouter = require('./routes/standings')

app.use('/api/matches', matchesRouter)
app.use('/api/standings', standingsRouter)

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})