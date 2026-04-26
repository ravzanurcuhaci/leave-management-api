const express = require("express");
require("dotenv").config();
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dk
    max: 100, // max 100 request
    message: "Too many requests, try again later",
});
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");


const pool = require("./db/pool");
const authRoutes = require("./routes/auth.routes");
const leaveRoutes = require("./routes/leave.routes");
const managerRoutes = require("./routes/manager.routes");
const leaveBalanceRoutes = require("./routes/leaveBalance.routes");
const adminRoutes = require("./routes/admin.routes");
const leaveTypeRoutes = require("./routes/leaveType.routes");
const adminLeaveBalanceRoutes = require("./routes/adminLeaveBalance.routes");
const auditLogRoutes = require("./routes/auditLog.routes");
const app = express();

app.use(express.json());
app.use(limiter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRoutes);
app.use("/leave-requests", leaveRoutes);
app.use("/manager", managerRoutes);
app.use("/leave-balances", leaveBalanceRoutes);
app.use("/admin", adminRoutes);
app.use("/leave-types", leaveTypeRoutes);
app.use("/admin", adminLeaveBalanceRoutes);
app.use("/admin", auditLogRoutes);

app.get("/health", async (req, res) => {
    const result = await pool.query("SELECT NOW()");

    res.json({
        message: "API is running",
        database_time: result.rows[0].now,
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});