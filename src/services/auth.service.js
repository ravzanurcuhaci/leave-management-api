const pool = require("../db/pool");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BadRequestError, UnauthorizedError, ConflictError } = require("../errors/AppError");

const register = async ({ full_name, email, password, role_id, manager_id }) => {
    // 1. email var mı kontrol
    const existingUser = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    if (existingUser.rows.length > 0) {
        throw new ConflictError("Email already exists");
    }

    // 2. şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. user oluştur
    const result = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role_id, manager_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, full_name, email, role_id`,
        [full_name, email, hashedPassword, role_id, manager_id]
    );

    return result.rows[0];
};
const login = async ({ email, password }) => {
    const user = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    if (user.rows.length === 0) {
        throw new UnauthorizedError("Invalid email or password");
    }

    const userData = user.rows[0];

    const isPasswordValid = await bcrypt.compare(
        password,
        userData.password_hash
    );

    if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid email or password");
    }

    const accessToken = jwt.sign(
        {
            userId: userData.id,
            roleId: userData.role_id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN,
        }
    );

    const refreshToken = jwt.sign(
        {
            userId: userData.id,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        }
    );

    await pool.query(
        `INSERT INTO refresh_tokens (user_id, token)
         VALUES ($1, $2)`,
        [userData.id, refreshToken]
    );

    return {
        accessToken,
        refreshToken,
        user: {
            id: userData.id,
            full_name: userData.full_name,
            email: userData.email,
            role_id: userData.role_id,
        },
    };
};
const refresh = async (refreshToken) => {
    if (!refreshToken) {
        throw new BadRequestError("Refresh token is required");
    }

    const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
    );

    const tokenResult = await pool.query(
        `SELECT * FROM refresh_tokens
         WHERE token = $1 AND user_id = $2`,
        [refreshToken, decoded.userId]
    );

    if (tokenResult.rows.length === 0) {
        throw new UnauthorizedError("Refresh token is revoked or invalid");
    }

    const userResult = await pool.query(
        `SELECT id, role_id
         FROM users
         WHERE id = $1`,
        [decoded.userId]
    );

    if (userResult.rows.length === 0) {
        throw new UnauthorizedError("User not found");
    }

    const user = userResult.rows[0];

    const newAccessToken = jwt.sign(
        {
            userId: user.id,
            roleId: user.role_id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN,
        }
    );

    return {
        accessToken: newAccessToken,
    };
};

const logout = async (refreshToken) => {
    if (!refreshToken) {
        throw new BadRequestError("Refresh token is required");
    }

    await pool.query(
        `DELETE FROM refresh_tokens
         WHERE token = $1`,
        [refreshToken]
    );

    return true;
};


module.exports = { register, login, refresh, logout };