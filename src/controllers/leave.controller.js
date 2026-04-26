const leaveService = require("../services/leave.service");

const createLeaveRequest = async (req, res) => {
    try {
        const userId = req.user.userId;

        const leaveRequest = await leaveService.createLeaveRequest(
            userId,
            req.body
        );

        res.status(201).json({
            message: "Leave request created",
            leaveRequest,
        });
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};

const getMyLeaveRequests = async (req, res) => {
    try {
        const userId = req.user.userId;

        const leaveRequests = await leaveService.getMyLeaveRequests(userId);

        res.json({
            leaveRequests,
        });
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};
module.exports = {
    createLeaveRequest,
    getMyLeaveRequests,
};