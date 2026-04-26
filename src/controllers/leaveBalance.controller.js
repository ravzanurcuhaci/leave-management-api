const leaveBalanceService = require("../services/leaveBalance.service");

const getMyLeaveBalances = async (req, res) => {
    try {
        const userId = req.user.userId;

        const balances = await leaveBalanceService.getMyLeaveBalances(userId);

        res.status(200).json({
            balances,
        });
    } catch (error) {
        res.status(400).json({
            message: error.message,
        });
    }
};

module.exports = {
    getMyLeaveBalances,
};