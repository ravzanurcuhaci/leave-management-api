const leaveTypeService = require("../services/leaveType.service");

const getAll = async (req, res) => {
    try {
        const leaveTypes = await leaveTypeService.getAll();

        res.status(200).json({ leaveTypes });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const create = async (req, res) => {
    try {
        const leaveType = await leaveTypeService.create(req.body);

        res.status(201).json({
            message: "Leave type created",
            leaveType,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const update = async (req, res) => {
    try {
        const leaveType = await leaveTypeService.update(req.params.id, req.body);

        res.status(200).json({
            message: "Leave type updated",
            leaveType,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const remove = async (req, res) => {
    try {
        await leaveTypeService.remove(req.params.id);

        res.status(200).json({
            message: "Leave type deleted",
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getAll,
    create,
    update,
    remove,
};
