const managerService = require("../services/manager.service");

const getLeaveRequests = async (req, res) => {
    try {
        const managerId = req.user.userId;

        const { status, page = 1, limit = 10 } = req.query;

        const result = await managerService.getLeaveRequests(managerId, {
            status,
            page: Number(page),
            limit: Number(limit),
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};
const updateLeaveRequestStatus = async (req, res) => {
    try {
        const managerId = req.user.userId;
        const leaveRequestId = req.params.id;
        const { status } = req.body;

        const updatedRequest = await managerService.updateLeaveRequestStatus(
            managerId,
            leaveRequestId,
            status
        );

        res.status(200).json({
            message: "Leave request status updated",
            leaveRequest: updatedRequest,
        });
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};
const getDashboard = async (req, res) => {
    try {
        const managerId = req.user.userId;

        const dashboard = await managerService.getDashboard(managerId);

        res.status(200).json(dashboard);
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};

const getLeaveRequestById = async (req, res) => {
    try {
        const managerId = req.user.userId;
        const leaveRequestId = req.params.id;

        const leaveRequest = await managerService.getLeaveRequestById(
            managerId,
            leaveRequestId
        );

        res.status(200).json({ leaveRequest });
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};

module.exports = {
    getLeaveRequests,
    updateLeaveRequestStatus,
    getDashboard,
    getLeaveRequestById,
};