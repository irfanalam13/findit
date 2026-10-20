
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import itemRoutes from './routes/itemRoutes.js'

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
}))

app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FindIt API is running',
    database: mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected',
  })
})

app.use('/api/items', itemRoutes)

app.use((err, req, res, next) => {
  console.error(err)

  res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred.',
  })
})

const PORT = process.env.PORT || 5000

async function startServer() {
  try {
    await connectDB()

    app.listen(PORT, () => {
      console.log(`FindIt API running at http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()
