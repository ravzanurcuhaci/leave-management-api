const { AppError } = require("../errors/AppError");

// Global error handler — tüm hatalar buraya düşer
const errorHandler = (err, req, res, next) => {
    // Bizim fırlattığımız hata mı?
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
        });
    }

    // Beklenmedik hata (bug, DB bağlantı hatası vs.)
    console.error("UNEXPECTED ERROR:", err);

    return res.status(500).json({
        message: "Internal server error",
    });
};

module.exports = errorHandler;
