const adminService = require("../services/admin.service");
const asyncHandler = require("../middlewares/asyncHandler");

const getAllUsers = asyncHandler(async (req, res) => {
    const { role_id, page = 1, limit = 10 } = req.query;

    const result = await adminService.getAllUsers({
        role_id,
        page: Number(page),
        limit: Number(limit),
    });

    res.status(200).json(result);
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await adminService.getUserById(req.params.id);

    res.status(200).json({ user });
});

const createUser = asyncHandler(async (req, res) => {
    const user = await adminService.createUser(req.body);

    res.status(201).json({
        message: "User created",
        user,
    });
});

const updateUser = asyncHandler(async (req, res) => {
    const user = await adminService.updateUser(req.params.id, req.body);

    res.status(200).json({
        message: "User updated",
        user,
    });
});

const deleteUser = asyncHandler(async (req, res) => {
    await adminService.deleteUser(req.params.id);

    res.status(200).json({
        message: "User deleted",
    });
});

const updateUserRole = asyncHandler(async (req, res) => {
    const adminUserId = req.user.userId;
    const { role_id } = req.body;

    const user = await adminService.updateUserRole(
        adminUserId,
        req.params.id,
        role_id
    );

    res.status(200).json({
        message: "User role updated",
        user,
    });
});

const updateUserManager = asyncHandler(async (req, res) => {
    const adminUserId = req.user.userId;
    const { manager_id } = req.body;

    const user = await adminService.updateUserManager(
        adminUserId,
        req.params.id,
        manager_id
    );

    res.status(200).json({
        message: "User manager updated",
        user,
    });
});

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateUserRole,
    updateUserManager,
};
