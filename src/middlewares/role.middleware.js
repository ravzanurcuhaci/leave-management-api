const { ForbiddenError } = require("../errors/AppError");

const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        const userRoleId = req.user.roleId;

        if (!allowedRoles.includes(userRoleId)) {
            return next(new ForbiddenError("Forbidden: yetkin yok"));
        }

        next();
    };
};

module.exports = roleMiddleware;