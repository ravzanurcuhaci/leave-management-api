const authService = require("../services/auth.service");
const pool = require("../db/pool");

const register = async (req, res) => {
    try {
        const user = await authService.register(req.body);

        res.status(201).json({
            message: "User created",
            user,
        });
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};

const login = async (req, res) => {
    try {
        const { accessToken, refreshToken, user } = await authService.login(req.body);

        res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user,
        });
    } catch (error) {
        // 401 Unauthorized
        res.status(401).json({
            message: error.message,
        });
    }
};

const me = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, full_name, email, role_id FROM users WHERE id = $1",
            [req.user.userId]
        );
        console.log("User ID from Token:", req.user.userId);

        res.json({
            user: result.rows[0]
        });
        console.log("User Data from DB:", result.rows[0]);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        const result = await authService.refresh(refreshToken);

        res.status(200).json({
            message: "Access token refreshed",
            accessToken: result.accessToken,
        });
    } catch (error) {
        res.status(401).json({
            message: error.message,
        });
    }
};
const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        await authService.logout(refreshToken);

        res.status(200).json({
            message: "Logout successful",
        });
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};

module.exports = { register, login, me, refresh, logout };