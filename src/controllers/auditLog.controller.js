const auditLogService = require("../services/auditLog.service");

const getLogs = async (req, res) => {
    try {
        const { action, page = 1, limit = 20 } = req.query;

        const result = await auditLogService.getLogs({
            action,
            page: Number(page),
            limit: Number(limit),
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getLogs,
};
