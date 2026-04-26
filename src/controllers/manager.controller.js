const managerService = require("../services/manager.service");
const asyncHandler = require("../middlewares/asyncHandler");

const getLeaveRequests = asyncHandler(async (req, res) => {
    const managerId = req.user.userId;

    const { status, page = 1, limit = 10 } = req.query;

    const result = await managerService.getLeaveRequests(managerId, {
        status,
        page: Number(page),
        limit: Number(limit),
    });

    res.status(200).json(result);
});

const updateLeaveRequestStatus = asyncHandler(async (req, res) => {
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
});

const getDashboard = asyncHandler(async (req, res) => {
    const managerId = req.user.userId;

    const dashboard = await managerService.getDashboard(managerId);

    res.status(200).json(dashboard);
});

const getLeaveRequestById = asyncHandler(async (req, res) => {
    const managerId = req.user.userId;
    const leaveRequestId = req.params.id;

    const leaveRequest = await managerService.getLeaveRequestById(
        managerId,
        leaveRequestId
    );

    res.status(200).json({ leaveRequest });
});

module.exports = {
    getLeaveRequests,
    updateLeaveRequestStatus,
    getDashboard,
    getLeaveRequestById,
};