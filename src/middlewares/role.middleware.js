const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        const userRoleId = req.user.roleId;

        if (!allowedRoles.includes(userRoleId)) {
            return res.status(403).json({
                message: "Forbidden: yetkin yok",
            });
        }

        next();
    };
};

module.exports = roleMiddleware;