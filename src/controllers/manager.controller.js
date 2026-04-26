const managerService = require("../services/manager.service");

const getLeaveRequests = async (req, res) => {
    try {
        const managerId = req.user.userId;

        const leaveRequests = await managerService.getLeaveRequests(managerId);

        res.status(200).json({
            leaveRequests,
        });
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
module.exports = {
    getLeaveRequests,
    updateLeaveRequestStatus,
};