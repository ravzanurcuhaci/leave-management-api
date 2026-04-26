const pool = require("../db/pool");

// Audit logları listele (pagination + opsiyonel action filtresi)
const getLogs = async (filters) => {
    const { action, page = 1, limit = 20 } = filters;

    const offset = (page - 1) * limit;
    const values = [];
    let whereClause = "";

    if (action) {
        values.push(action);
        whereClause = `WHERE al.action = $${values.length}`;
    }

    values.push(limit);
    const limitIndex = values.length;

    values.push(offset);
    const offsetIndex = values.length;

    const result = await pool.query(
        `SELECT
           al.id,
           al.actor_user_id,
           u.full_name AS actor_name,
           al.action,
           al.target_type,
           al.target_id,
           al.created_at
         FROM audit_logs al
         LEFT JOIN users u ON al.actor_user_id = u.id
         ${whereClause}
         ORDER BY al.created_at DESC
         LIMIT $${limitIndex}
         OFFSET $${offsetIndex}`,
        values
    );

    return {
        page: Number(page),
        limit: Number(limit),
        count: result.rows.length,
        logs: result.rows,
    };
};

module.exports = {
    getLogs,
};
