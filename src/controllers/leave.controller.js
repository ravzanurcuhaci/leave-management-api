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

const getLeaveRequestById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const leaveRequestId = req.params.id;

        const leaveRequest = await leaveService.getLeaveRequestById(
            userId,
            leaveRequestId
        );

        res.status(200).json({ leaveRequest });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateLeaveRequest = async (req, res) => {
    try {
        const userId = req.user.userId;
        const leaveRequestId = req.params.id;

        const updatedRequest = await leaveService.updateLeaveRequest(
            userId,
            leaveRequestId,
            req.body
        );

        res.status(200).json({
            message: "Leave request updated",
            leaveRequest: updatedRequest,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteLeaveRequest = async (req, res) => {
    try {
        const userId = req.user.userId;
        const leaveRequestId = req.params.id;

        await leaveService.deleteLeaveRequest(userId, leaveRequestId);

        res.status(200).json({
            message: "Leave request deleted",
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
module.exports = {
    createLeaveRequest,
    getMyLeaveRequests,
    getLeaveRequestById,
    updateLeaveRequest,
    deleteLeaveRequest,
};