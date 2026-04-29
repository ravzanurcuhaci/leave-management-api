const { Queue } = require("bullmq");

const emailQueue = new Queue("email-queue", {
    connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379, //redisin varsayılan portu 
    },
});

module.exports = emailQueue;