const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const leaveTypeController = require("../controllers/leaveType.controller");
/**
 * @swagger
 * /leave-types:
 *   get:
 *     summary: Get all leave types
 *     tags: [Leave Types]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of leave types
 */
router.get("/", authMiddleware, leaveTypeController.getAll);
/**
 * @swagger
 * /leave-types:
 *   post:
 *     summary: Create a new leave type (Admin)
 *     tags: [Leave Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Maternity Leave"
 *               default_days:
 *                 type: integer
 *                 example: 60
 *     responses:
 *       201:
 *         description: Leave type created
 */
router.post("/", authMiddleware, roleMiddleware(3), leaveTypeController.create);
/**
 * @swagger
 * /leave-types/{id}:
 *   patch:
 *     summary: Update leave type (Admin)
 *     tags: [Leave Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               default_days:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Leave type updated
 */
router.patch("/:id", authMiddleware, roleMiddleware(3), leaveTypeController.update);
/**
 * @swagger
 * /leave-types/{id}:
 *   delete:
 *     summary: Delete leave type (Admin)
 *     tags: [Leave Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Leave type deleted
 */
router.delete("/:id", authMiddleware, roleMiddleware(3), leaveTypeController.remove);

module.exports = router;
