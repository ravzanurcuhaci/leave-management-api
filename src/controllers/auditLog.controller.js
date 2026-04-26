const auditLogService = require("../services/auditLog.service");
const asyncHandler = require("../middlewares/asyncHandler");

const getLogs = asyncHandler(async (req, res) => {
    const { action, page = 1, limit = 20 } = req.query;

    const result = await auditLogService.getLogs({
        action,
        page: Number(page),
        limit: Number(limit),
    });

    res.status(200).json(result);
});

module.exports = {
    getLogs,
};
