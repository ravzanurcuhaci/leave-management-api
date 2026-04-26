const leaveTypeService = require("../services/leaveType.service");
const asyncHandler = require("../middlewares/asyncHandler");

const getAll = asyncHandler(async (req, res) => {
    const leaveTypes = await leaveTypeService.getAll();

    res.status(200).json({ leaveTypes });
});

const create = asyncHandler(async (req, res) => {
    const leaveType = await leaveTypeService.create(req.body);

    res.status(201).json({
        message: "Leave type created",
        leaveType,
    });
});

const update = asyncHandler(async (req, res) => {
    const leaveType = await leaveTypeService.update(req.params.id, req.body);

    res.status(200).json({
        message: "Leave type updated",
        leaveType,
    });
});

const remove = asyncHandler(async (req, res) => {
    await leaveTypeService.remove(req.params.id);

    res.status(200).json({
        message: "Leave type deleted",
    });
});

module.exports = {
    getAll,
    create,
    update,
    remove,
};
