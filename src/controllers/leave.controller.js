const leaveService = require("../services/leave.service");
const asyncHandler = require("../middlewares/asyncHandler");

const createLeaveRequest = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const leaveRequest = await leaveService.createLeaveRequest(
        userId,
        req.body
    );

    res.status(201).json({
        message: "Leave request created",
        leaveRequest,
    });
});

const getMyLeaveRequests = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const leaveRequests = await leaveService.getMyLeaveRequests(userId);

    res.json({
        leaveRequests,
    });
});

const getLeaveRequestById = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const leaveRequestId = req.params.id;

    const leaveRequest = await leaveService.getLeaveRequestById(
        userId,
        leaveRequestId
    );

    res.status(200).json({ leaveRequest });
});

const updateLeaveRequest = asyncHandler(async (req, res) => {
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
});

const deleteLeaveRequest = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const leaveRequestId = req.params.id;

    await leaveService.deleteLeaveRequest(userId, leaveRequestId);

    res.status(200).json({
        message: "Leave request deleted",
    });
});

module.exports = {
    createLeaveRequest,
    getMyLeaveRequests,
    getLeaveRequestById,
    updateLeaveRequest,
    deleteLeaveRequest,
};