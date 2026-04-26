const pool = require("../db/pool");

const calculateTotalDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffTime = end - start;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays + 1;
};

const createLeaveRequest = async (userId, data) => {
    const { leave_type_id, start_date, end_date, reason } = data;

    if (!leave_type_id || !start_date || !end_date) {
        throw new Error("leave_type_id, start_date and end_date are required");
    }

    const totalDays = calculateTotalDays(start_date, end_date);

    if (totalDays <= 0) {
        throw new Error("end_date must be after or equal to start_date");
    }

    const balanceResult = await pool.query(
        `SELECT remaining_days
     FROM leave_balances
     WHERE user_id = $1 AND leave_type_id = $2`,
        [userId, leave_type_id]
    );

    if (balanceResult.rows.length === 0) {
        throw new Error("Leave balance not found for this leave type");
    }

    const remainingDays = balanceResult.rows[0].remaining_days;

    if (remainingDays < totalDays) {
        throw new Error("Not enough leave balance");
    }

    const overlapResult = await pool.query(
        `SELECT id
     FROM leave_requests
     WHERE user_id = $1
       AND status IN ('PENDING', 'APPROVED')
       AND start_date <= $3
       AND end_date >= $2`,
        [userId, start_date, end_date]
    );

    if (overlapResult.rows.length > 0) {
        throw new Error("Leave request overlaps with existing request");
    }

    const result = await pool.query(
        `INSERT INTO leave_requests
      (user_id, leave_type_id, start_date, end_date, total_days, reason)
     VALUES
      ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
        [userId, leave_type_id, start_date, end_date, totalDays, reason]
    );

    return result.rows[0];
};

const getMyLeaveRequests = async (userId) => {
    const result = await pool.query(
        `SELECT * FROM leave_requests
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
    );

    return result.rows;
};
module.exports = {
    createLeaveRequest,
    getMyLeaveRequests,
};
