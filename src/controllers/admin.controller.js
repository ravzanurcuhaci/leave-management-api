const adminService = require("../services/admin.service");

const getAllUsers = async (req, res) => {
    try {
        const { role_id, page = 1, limit = 10 } = req.query;

        const result = await adminService.getAllUsers({
            role_id,
            page: Number(page),
            limit: Number(limit),
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await adminService.getUserById(req.params.id);

        res.status(200).json({ user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const user = await adminService.createUser(req.body);

        res.status(201).json({
            message: "User created",
            user,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await adminService.updateUser(req.params.id, req.body);

        res.status(200).json({
            message: "User updated",
            user,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await adminService.deleteUser(req.params.id);

        res.status(200).json({
            message: "User deleted",
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateUserRole = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateUserManager = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateUserRole,
    updateUserManager,
};
