const authService = require("../services/auth.service");
const pool = require("../db/pool");
const asyncHandler = require("../middlewares/asyncHandler");

const register = asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);

    res.status(201).json({
        message: "User created",
        user,
    });
});

const login = asyncHandler(async (req, res) => {
    const { accessToken, refreshToken, user } = await authService.login(req.body);

    res.status(200).json({
        message: "Login successful",
        accessToken,
        refreshToken,
        user,
    });
});

const me = asyncHandler(async (req, res) => {
    const result = await pool.query(
        "SELECT id, full_name, email, role_id FROM users WHERE id = $1",
        [req.user.userId]
    );

    res.json({
        user: result.rows[0],
    });
});

const refresh = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    const result = await authService.refresh(refreshToken);

    res.status(200).json({
        message: "Access token refreshed",
        accessToken: result.accessToken,
    });
});

const logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    await authService.logout(refreshToken);

    res.status(200).json({
        message: "Logout successful",
    });
});

module.exports = { register, login, me, refresh, logout };