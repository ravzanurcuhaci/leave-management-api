require("dotenv").config();

const { Worker } = require("bullmq");
const { sendLeaveStatusEmail } = require("../services/email.service");

const worker = new Worker(
    "email-queue",
    async (job) => {
        if (job.name === "leave-status-updated") {
            await sendLeaveStatusEmail(job.data);  // Asıl e-posta gönderimi
        }
    },
    {
        connection: {
            host: "localhost",
            port: 6379,
        },
    }
);

worker.on("completed", (job) => {
    console.log("Mail gönderildi:", job.id);
});

worker.on("failed", (job, err) => {
    console.error("Mail gönderilemedi:", job.id, err.message);
});