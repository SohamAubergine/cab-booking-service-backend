import express from 'express'
import cors from 'cors'
import { errorConverter, errorHandler } from './middlewares/error.middleware'
import v1Router from './routes'
import { CONSTANTS } from './utils/constants'

// Initialize express app
const app = express()
app.disable('x-powered-by')
const PORT = process.env.PORT || 3000

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: CONSTANTS.CORS.METHODS,
  allowedHeaders: CONSTANTS.CORS.ALLOWED_HEADERS,
  credentials: true,
  maxAge: CONSTANTS.CORS.MAX_AGE,
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API Routes
app.use('/api', v1Router)

// Error handling middleware
app.use(errorConverter)
app.use(errorHandler)

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
