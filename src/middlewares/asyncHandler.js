// Async controller fonksiyonlarını try/catch'siz yazmamızı sağlar
// Express 4 async hataları yakalamaz, bu wrapper next(err)'e yönlendirir
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = asyncHandler;
