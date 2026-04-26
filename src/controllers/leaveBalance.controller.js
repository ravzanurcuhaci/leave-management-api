const leaveBalanceService = require("../services/leaveBalance.service");
const asyncHandler = require("../middlewares/asyncHandler");

const getMyLeaveBalances = asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const balances = await leaveBalanceService.getMyLeaveBalances(userId);

    res.status(200).json({
        balances,
    });
});

module.exports = {
    getMyLeaveBalances,
};