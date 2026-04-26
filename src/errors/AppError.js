// Tüm custom error'ların babası
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

// 400 — geçersiz istek (validation hataları vs.)
class BadRequestError extends AppError {
    constructor(message = "Bad request") {
        super(message, 400);
    }
}

// 401 — kimlik doğrulaması yapılmadı (token yok, geçersiz vs.)
class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}

// 403 — yetki yok (rolün yetmiyor)
class ForbiddenError extends AppError {
    constructor(message = "Forbidden: yetkin yok") {
        super(message, 403);
    }
}

// 404 — bulunamadı
class NotFoundError extends AppError {
    constructor(message = "Not found") {
        super(message, 404);
    }
}

// 409 — çakışma (zaten var, duplicate vs.)
class ConflictError extends AppError {
    constructor(message = "Conflict") {
        super(message, 409);
    }
}

module.exports = {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
};
