import express from 'express'
import dns from 'node:dns'
import dotenv from 'dotenv'

dotenv.config()
// dns.setServers(["1.1.1.1", "8.8.8.8"])



import cors from 'cors'
import { errorMiddleware } from './middleware/middleware.js'
import authRoute from './routes/authRoute.js'
import userRoute from './routes/userRoute.js'
import assetRoute from './routes/assetRoute.js'
import publicRoute from './routes/publicRoute.js'
import issueRoute from './routes/issueRoute.js'
import aiRoute from './routes/aiRoute.js'
import { authenticateUser, requireRole } from './middleware/authMiddleware.js'

export const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Health check route
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "MaintainIQ API is healthy",
        timestamp: new Date().toISOString(),
        uptime: `${process.uptime().toFixed(2)}s`
    })
})

app.use("/api/server",(req, res) => {
    res.send("hello from the server!")
})

app.use("/api/auth", authRoute)
app.use("/api/user", userRoute)
app.use("/api/assets", assetRoute)
app.use("/api/public", publicRoute)
app.use("/api/issues", issueRoute)
app.use("/api/ai", aiRoute)

// Verification / Test routes for Authentication & Authorization
app.get("/api/protected", authenticateUser, (req, res) => {
    res.status(200).json({
        status: true,
        message: "Access granted to protected route",
        user: req.user
    })
})

app.get("/api/admin-only", authenticateUser, requireRole("admin"), (req, res) => {
    res.status(200).json({
        status: true,
        message: "Access granted to admin-only route",
        user: req.user
    })
})








app.use(errorMiddleware)
