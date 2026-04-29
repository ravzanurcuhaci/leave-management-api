const pool = require("../db/pool");
const { BadRequestError, NotFoundError } = require("../errors/AppError");
//leave_requests tablosu izinleri bilir.
//users tablosu çalışanın manager'ını bilir.
//leave_types tablosu izin türünün adını bilir.

//Bu yüzden JOIN yaptık.
//WHERE u.manager_id = managerId dediğimiz için manager sadece kendi çalışanlarını görür.
const getLeaveRequests = async (managerId, filters) => {
    const { status, page, limit } = filters;

    const offset = (page - 1) * limit;

    const values = [managerId];
    let whereClause = "WHERE u.manager_id = $1";

    if (status) {
        values.push(status);
        whereClause += ` AND lr.status = $${values.length}`;
    }

    values.push(limit);
    const limitIndex = values.length;

    values.push(offset);
    const offsetIndex = values.length;

    const result = await pool.query(
        `SELECT 
       lr.id,
       lr.user_id,
       u.full_name AS employee_name,
       lr.leave_type_id,
       lt.name AS leave_type,
       lr.start_date,
       lr.end_date,
       lr.total_days,
       lr.reason,
       lr.status,
       lr.reviewed_by,
       lr.reviewed_at,
       lr.created_at
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.id
     JOIN leave_types lt ON lr.leave_type_id = lt.id
     ${whereClause}
     ORDER BY lr.created_at DESC
     LIMIT $${limitIndex}
     OFFSET $${offsetIndex}`,
        values
    );

    return {
        page,
        limit,
        count: result.rows.length,
        leaveRequests: result.rows,
    };
};

//BEGIN   → işlem paketi başladı
//COMMIT  → her şey başarılıysa kaydet
//ROLLBACK → hata varsa hepsini geri al
//FOR UPDATE → aynı kayıt aynı anda iki kişi tarafından değiştirilmesin
const emailQueue = require("../queues/email.queue");
const updateLeaveRequestStatus = async (managerId, leaveRequestId, status) => {
    console.log("QUEUEYA GİTTİ");
    if (!["APPROVED", "REJECTED"].includes(status)) {
        throw new BadRequestError("Status must be APPROVED or REJECTED");
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const requestResult = await client.query(
            `SELECT 
               lr.*,
               u.manager_id
             FROM leave_requests lr
             JOIN users u ON lr.user_id = u.id
             WHERE lr.id = $1
             FOR UPDATE`,
            [leaveRequestId]
        );

        if (requestResult.rows.length === 0) {
            throw new NotFoundError("Leave request not found");
        }

        const leaveRequest = requestResult.rows[0];

        if (leaveRequest.manager_id !== managerId) {
            throw new BadRequestError("You can only update your employees' leave requests");
        }

        if (leaveRequest.status !== "PENDING") {
            throw new BadRequestError("Only PENDING requests can be updated");
        }

        if (status === "APPROVED") {
            const balanceResult = await client.query(
                `SELECT remaining_days
                 FROM leave_balances
                 WHERE user_id = $1 AND leave_type_id = $2
                 FOR UPDATE`,
                [leaveRequest.user_id, leaveRequest.leave_type_id]
            );

            if (balanceResult.rows.length === 0) {
                throw new NotFoundError("Leave balance not found");
            }

            const remainingDays = balanceResult.rows[0].remaining_days;

            if (remainingDays < leaveRequest.total_days) {
                throw new BadRequestError("Not enough leave balance");
            }

            await client.query(
                `UPDATE leave_balances
                 SET remaining_days = remaining_days - $1
                 WHERE user_id = $2 AND leave_type_id = $3`,
                [
                    leaveRequest.total_days,
                    leaveRequest.user_id,
                    leaveRequest.leave_type_id,
                ]
            );
        }

        const updatedResult = await client.query(
            `UPDATE leave_requests
             SET status = $1,
                 reviewed_by = $2,
                 reviewed_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING *`,
            [status, managerId, leaveRequestId]
        );

        await client.query(
            `INSERT INTO audit_logs (actor_user_id, action, target_type, target_id)
             VALUES ($1, $2, $3, $4)`,
            [
                managerId,
                status === "APPROVED"
                    ? "APPROVE_LEAVE_REQUEST"
                    : "REJECT_LEAVE_REQUEST",
                "leave_request",
                leaveRequestId,
            ]
        );

        await client.query("COMMIT");

        const userResult = await pool.query(
            `SELECT email, full_name FROM users WHERE id = $1`,
            [leaveRequest.user_id]
        );

        const user = userResult.rows[0];

        // Manager bir izin talebini onayladığında/reddettiğinde:
        await emailQueue.add("leave-status-updated", {
            email: user.email,
            fullName: user.full_name,
            status,
        });

        return updatedResult.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

// Manager dashboard: pending / approved / rejected sayılarını döner
const getDashboard = async (managerId) => {
    const result = await pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE lr.status = 'PENDING')  AS pending,
           COUNT(*) FILTER (WHERE lr.status = 'APPROVED') AS approved,
           COUNT(*) FILTER (WHERE lr.status = 'REJECTED') AS rejected
         FROM leave_requests lr
         JOIN users u ON lr.user_id = u.id
         WHERE u.manager_id = $1`,
        [managerId]
    );

    return {
        pending: Number(result.rows[0].pending),
        approved: Number(result.rows[0].approved),
        rejected: Number(result.rows[0].rejected),
    };
};

// Manager tek bir izin talebinin detayını görür (sadece kendi çalışanının)
const getLeaveRequestById = async (managerId, leaveRequestId) => {
    const result = await pool.query(
        `SELECT
           lr.id,
           lr.user_id,
           u.full_name  AS employee_name,
           lr.leave_type_id,
           lt.name       AS leave_type,
           lr.start_date,
           lr.end_date,
           lr.total_days,
           lr.reason,
           lr.status,
           lr.reviewed_by,
           lr.reviewed_at,
           lr.created_at
         FROM leave_requests lr
         JOIN users u  ON lr.user_id = u.id
         JOIN leave_types lt ON lr.leave_type_id = lt.id
         WHERE lr.id = $1 AND u.manager_id = $2`,
        [leaveRequestId, managerId]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError("Leave request not found");
    }

    return result.rows[0];
};

module.exports = {
    getLeaveRequests,
    updateLeaveRequestStatus,
    getDashboard,
    getLeaveRequestById,
};