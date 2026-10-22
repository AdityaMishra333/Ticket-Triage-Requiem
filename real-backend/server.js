require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const userAuthRoutes = require("./routes/userAuth")
const adminAuthRoutes = require("./routes/adminAuth")

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: "http://localhost:5173", credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", userAuthRoutes)
app.use("/api/admin", adminAuthRoutes)
app.use("/api/tickets", require("./routes/tickets"))

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
    })
