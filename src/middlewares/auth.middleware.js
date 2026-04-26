const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../errors/AppError");

const authMiddleware = (req, res, next) => {
    try {
        // 1. Authorization header al
        const authHeader = req.headers.authorization;

        // 2. Token yoksa
        if (!authHeader) {
            throw new UnauthorizedError("Token yok");
        }

        // 3. "Bearer TOKEN" → TOKEN al
        const token = authHeader.split(" ")[1];

        // 4. Token doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Kullanıcıyı request'e ekle
        req.user = decoded;

        // 6. Devam et
        next();
    } catch (error) {
        // JWT hataları da UnauthorizedError olarak fırlatılsın
        if (error instanceof UnauthorizedError) {
            next(error);
        } else {
            next(new UnauthorizedError(error.message));
        }
    }
};

module.exports = authMiddleware;