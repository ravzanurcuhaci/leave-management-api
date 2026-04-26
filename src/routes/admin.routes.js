const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const adminController = require("../controllers/admin.controller");
/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Create a new user (Admin)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: "Ahmet Yılmaz"
 *               email:
 *                 type: string
 *                 example: "ahmet@test.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               role_id:
 *                 type: integer
 *                 example: 1
 *               manager_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: User created
 */
router.post("/users", authMiddleware, roleMiddleware(3), adminController.createUser);
/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: List all users (Admin)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: integer
 *         description: Filter by role
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/users", authMiddleware, roleMiddleware(3), adminController.getAllUsers);
/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get single user detail (Admin)
 *     tags: [Admin - Users]
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
 *         description: User detail
 */
router.get("/users/:id", authMiddleware, roleMiddleware(3), adminController.getUserById);
/**
 * @swagger
 * /admin/users/{id}:
 *   patch:
 *     summary: Update user info (Admin)
 *     tags: [Admin - Users]
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
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 */
router.patch("/users/:id", authMiddleware, roleMiddleware(3), adminController.updateUser);
/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete user (Admin)
 *     tags: [Admin - Users]
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
 *         description: User deleted
 */
router.delete("/users/:id", authMiddleware, roleMiddleware(3), adminController.deleteUser);
/**
 * @swagger
 * /admin/users/{id}/role:
 *   patch:
 *     summary: Change user role (Admin)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               role_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Role updated
 */
router.patch("/users/:id/role", authMiddleware, roleMiddleware(3), adminController.updateUserRole);
/**
 * @swagger
 * /admin/users/{id}/manager:
 *   patch:
 *     summary: Change user manager (Admin)
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               manager_id:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Manager updated
 */
router.patch("/users/:id/manager", authMiddleware, roleMiddleware(3), adminController.updateUserManager);

module.exports = router;
