const pool = require("../db/pool");
const { BadRequestError, NotFoundError, ConflictError } = require("../errors/AppError");

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
        throw new BadRequestError("leave_type_id, start_date and end_date are required");
    }

    // Geçmiş tarih kontrolü: bugünden önceki bir tarihe izin alınamaz
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(start_date) < today) {
        throw new BadRequestError("start_date cannot be in the past");
    }

    const totalDays = calculateTotalDays(start_date, end_date);

    if (totalDays <= 0) {
        throw new BadRequestError("end_date must be after or equal to start_date");
    }

    const balanceResult = await pool.query(
        `SELECT remaining_days
     FROM leave_balances
     WHERE user_id = $1 AND leave_type_id = $2`,
        [userId, leave_type_id]
    );

    if (balanceResult.rows.length === 0) {
        throw new NotFoundError("Leave balance not found for this leave type");
    }

    const remainingDays = balanceResult.rows[0].remaining_days;

    if (remainingDays < totalDays) {
        throw new BadRequestError("Not enough leave balance");
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
        throw new ConflictError("Leave request overlaps with existing request");
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

const getLeaveRequestById = async (userId, leaveRequestId) => {
    const result = await pool.query(
        `SELECT *
     FROM leave_requests
     WHERE id = $1 AND user_id = $2`,
        [leaveRequestId, userId]
    );

    if (result.rows.length === 0) {
        throw new NotFoundError("Leave request not found");
    }

    return result.rows[0];
};

const updateLeaveRequest = async (userId, leaveRequestId, data) => {
    const { leave_type_id, start_date, end_date, reason } = data;

    const existingResult = await pool.query(
        `SELECT *
     FROM leave_requests
     WHERE id = $1 AND user_id = $2`,
        [leaveRequestId, userId]
    );

    if (existingResult.rows.length === 0) {
        throw new NotFoundError("Leave request not found");
    }

    const existingRequest = existingResult.rows[0];

    if (existingRequest.status !== "PENDING") {
        throw new BadRequestError("Only PENDING requests can be updated");
    }

    const newLeaveTypeId = leave_type_id || existingRequest.leave_type_id;
    const newStartDate = start_date || existingRequest.start_date;
    const newEndDate = end_date || existingRequest.end_date;
    const newReason = reason !== undefined ? reason : existingRequest.reason;

    // Geçmiş tarih kontrolü: bugünden önceki bir tarihe izin alınamaz
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(newStartDate) < today) {
        throw new BadRequestError("start_date cannot be in the past");
    }

    const totalDays = calculateTotalDays(newStartDate, newEndDate);

    if (totalDays <= 0) {
        throw new BadRequestError("end_date must be after or equal to start_date");
    }

    const balanceResult = await pool.query(
        `SELECT remaining_days
     FROM leave_balances
     WHERE user_id = $1 AND leave_type_id = $2`,
        [userId, newLeaveTypeId]
    );

    if (balanceResult.rows.length === 0) {
        throw new NotFoundError("Leave balance not found for this leave type");
    }

    const remainingDays = balanceResult.rows[0].remaining_days;

    if (remainingDays < totalDays) {
        throw new BadRequestError("Not enough leave balance");
    }

    const overlapResult = await pool.query(
        `SELECT id
     FROM leave_requests
     WHERE user_id = $1
       AND id != $2
       AND status IN ('PENDING', 'APPROVED')
       AND start_date <= $4
       AND end_date >= $3`,
        [userId, leaveRequestId, newStartDate, newEndDate]
    );

    if (overlapResult.rows.length > 0) {
        throw new ConflictError("Leave request overlaps with existing request");
    }

    const result = await pool.query(
        `UPDATE leave_requests
     SET leave_type_id = $1,
         start_date = $2,
         end_date = $3,
         total_days = $4,
         reason = $5
     WHERE id = $6 AND user_id = $7
     RETURNING *`,
        [
            newLeaveTypeId,
            newStartDate,
            newEndDate,
            totalDays,
            newReason,
            leaveRequestId,
            userId,
        ]
    );

    return result.rows[0];
};

const deleteLeaveRequest = async (userId, leaveRequestId) => {
    const existingResult = await pool.query(
        `SELECT *
     FROM leave_requests
     WHERE id = $1 AND user_id = $2`,
        [leaveRequestId, userId]
    );

    if (existingResult.rows.length === 0) {
        throw new NotFoundError("Leave request not found");
    }

    const existingRequest = existingResult.rows[0];

    if (existingRequest.status !== "PENDING") {
        throw new BadRequestError("Only PENDING requests can be deleted");
    }

    await pool.query(
        `DELETE FROM leave_requests
     WHERE id = $1 AND user_id = $2`,
        [leaveRequestId, userId]
    );

    return true;
};

module.exports = {
    createLeaveRequest,
    getMyLeaveRequests,
    getLeaveRequestById,
    updateLeaveRequest,
    deleteLeaveRequest,
};
