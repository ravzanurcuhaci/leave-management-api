const pool = require("../db/pool");

// Bir kullanıcının tüm izin bakiyelerini getir
const getBalancesByUserId = async (userId) => {
    // Kullanıcı var mı kontrol et
    const userCheck = await pool.query(
        "SELECT id FROM users WHERE id = $1",
        [userId]
    );

    if (userCheck.rows.length === 0) {
        throw new Error("User not found");
    }

    const result = await pool.query(
        `SELECT
           lb.id,
           lb.user_id,
           lb.leave_type_id,
           lt.name AS leave_type,
           lt.default_days,
           lb.remaining_days
         FROM leave_balances lb
         JOIN leave_types lt ON lb.leave_type_id = lt.id
         WHERE lb.user_id = $1
         ORDER BY lt.name ASC`,
        [userId]
    );

    return result.rows;
};

// Bir kullanıcının belirli izin türündeki bakiyesini güncelle
const updateBalance = async (userId, leaveTypeId, data) => {
    const { remaining_days } = data;

    if (remaining_days === undefined) {
        throw new Error("remaining_days is required");
    }

    if (remaining_days < 0) {
        throw new Error("remaining_days cannot be negative");
    }

    // Bakiye kaydı var mı kontrol et
    const existing = await pool.query(
        `SELECT * FROM leave_balances
         WHERE user_id = $1 AND leave_type_id = $2`,
        [userId, leaveTypeId]
    );

    if (existing.rows.length === 0) {
        // Yoksa oluştur
        const result = await pool.query(
            `INSERT INTO leave_balances (user_id, leave_type_id, remaining_days)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [userId, leaveTypeId, remaining_days]
        );
        return result.rows[0];
    }

    // Varsa güncelle
    const result = await pool.query(
        `UPDATE leave_balances
         SET remaining_days = $1
         WHERE user_id = $2 AND leave_type_id = $3
         RETURNING *`,
        [remaining_days, userId, leaveTypeId]
    );

    return result.rows[0];
};

module.exports = {
    getBalancesByUserId,
    updateBalance,
};
