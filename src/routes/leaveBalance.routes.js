const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const leaveBalanceController = require("../controllers/leaveBalance.controller");

router.get(
    "/my",
    authMiddleware,
    leaveBalanceController.getMyLeaveBalances
);

module.exports = router;