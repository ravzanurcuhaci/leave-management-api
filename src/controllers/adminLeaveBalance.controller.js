const adminLeaveBalanceService = require("../services/adminLeaveBalance.service");

const getBalancesByUserId = async (req, res) => {
    try {
        const balances = await adminLeaveBalanceService.getBalancesByUserId(
            req.params.userId
        );

        res.status(200).json({ balances });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateBalance = async (req, res) => {
    try {
        const balance = await adminLeaveBalanceService.updateBalance(
            req.params.userId,
            req.params.leaveTypeId,
            req.body
        );

        res.status(200).json({
            message: "Leave balance updated",
            balance,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getBalancesByUserId,
    updateBalance,
};
