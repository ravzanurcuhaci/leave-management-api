const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const leaveController = require("../controllers/leave.controller");
/**
 * @swagger
 * /leave-requests:
 *   post:
 *     summary: Create leave request (Employee)
 *     tags: [Leave Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leave_type_id:
 *                 type: integer
 *                 example: 1
 *               start_date:
 *                 type: string
 *                 example: "2026-05-01"
 *               end_date:
 *                 type: string
 *                 example: "2026-05-03"
 *               reason:
 *                 type: string
 *                 example: "tatil"
 *     responses:
 *       201:
 *         description: Leave request created
 */
router.post("/", authMiddleware, roleMiddleware(1), leaveController.createLeaveRequest);
router.get("/my", authMiddleware, leaveController.getMyLeaveRequests);

module.exports = router;



