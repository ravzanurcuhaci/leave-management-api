const pool = require("../db/pool");

const getMyLeaveBalances = async (userId) => {
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

module.exports = {
    getMyLeaveBalances,
};