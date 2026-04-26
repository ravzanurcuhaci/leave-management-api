const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        // 1. Authorization header al
        const authHeader = req.headers.authorization;
        console.log("Authorization Header:", req.headers.authorization);
        // 2. Token yoksa
        if (!authHeader) {
            return res.status(401).json({ message: "Token yok" });
        }

        // 3. "Bearer TOKEN" → TOKEN al
        const token = authHeader.split(" ")[1];
        console.log("Extracted Token:", token);

        // 4. Token doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);
        // 5. Kullanıcıyı request'e ekle
        req.user = decoded;

        // 6. Devam et
        next();
    } catch (error) {
        console.log("JWT ERROR:", error.message);
        return res.status(403).json({ message: error.message });
    }
};

module.exports = authMiddleware;