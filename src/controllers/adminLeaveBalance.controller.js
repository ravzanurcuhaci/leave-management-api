const adminLeaveBalanceService = require("../services/adminLeaveBalance.service");
const asyncHandler = require("../middlewares/asyncHandler");

const getBalancesByUserId = asyncHandler(async (req, res) => {
    const balances = await adminLeaveBalanceService.getBalancesByUserId(
        req.params.userId
    );

    res.status(200).json({ balances });
});

const updateBalance = asyncHandler(async (req, res) => {
    const balance = await adminLeaveBalanceService.updateBalance(
        req.params.userId,
        req.params.leaveTypeId,
        req.body
    );

    res.status(200).json({
        message: "Leave balance updated",
        balance,
    });
});

module.exports = {
    getBalancesByUserId,
    updateBalance,
};
