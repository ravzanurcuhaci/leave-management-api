const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const adminLeaveBalanceController = require("../controllers/adminLeaveBalance.controller");
/**
 * @swagger
 * /admin/users/{userId}/leave-balances:
 *   get:
 *     summary: Get user's leave balances (Admin)
 *     tags: [Admin - Leave Balances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User's leave balances
 */
router.get(
    "/users/:userId/leave-balances",
    authMiddleware,
    roleMiddleware(3),
    adminLeaveBalanceController.getBalancesByUserId
);
/**
 * @swagger
 * /admin/users/{userId}/leave-balances/{leaveTypeId}:
 *   patch:
 *     summary: Update user's leave balance (Admin)
 *     tags: [Admin - Leave Balances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: leaveTypeId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remaining_days:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       200:
 *         description: Leave balance updated
 */
router.patch(
    "/users/:userId/leave-balances/:leaveTypeId",
    authMiddleware,
    roleMiddleware(3),
    adminLeaveBalanceController.updateBalance
);

module.exports = router;
