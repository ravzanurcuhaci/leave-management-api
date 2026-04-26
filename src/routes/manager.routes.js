const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const managerController = require("../controllers/manager.controller");
/**
 * @swagger
 * /manager/leave-requests:
 *   get:
 *     summary: Get employees' leave requests (Manager)
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of employees' leave requests
 */
router.get("/leave-requests", authMiddleware, roleMiddleware(2), managerController.getLeaveRequests);
/**
 * @swagger
 * /manager/leave-requests/{id}/status:
 *   patch:
 *     summary: Approve or reject leave request
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Leave request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: APPROVED
 *     responses:
 *       200:
 *         description: Leave request updated
 */
router.patch("/leave-requests/:id/status", authMiddleware, roleMiddleware(2), managerController.updateLeaveRequestStatus);

module.exports = router;