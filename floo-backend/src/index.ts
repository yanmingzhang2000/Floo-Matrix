import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth'
import progressRouter from './routes/progress'

const app = express()
const PORT = Number(process.env.PORT) || 3001

// CORS 白名单：支持多个域名（逗号分隔）
const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())

app.use(
  cors({
    origin: (origin, callback) => {
      // 允许无 origin 请求（如 curl / Postman）
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS blocked: ${origin}`))
      }
    },
    credentials: true,
  })
)

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() })
})

app.use('/api/auth', authRouter)
app.use('/api/progress', progressRouter)

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[floo-backend] running on port ${PORT}`)
  console.log(`[floo-backend] listening on 0.0.0.0:${PORT}`)
})

server.on('error', (err) => {
  console.error('[floo-backend] Server error:', err)
  process.exit(1)
})
