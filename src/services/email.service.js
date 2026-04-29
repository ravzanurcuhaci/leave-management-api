const nodemailer = require("nodemailer");

//  nodemailer'dan gelen şey → transporter (posta taşıyıcısı
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
//Bu senin KENDI fonksiyonun, nodemailer'ın değil
const sendLeaveStatusEmail = async ({ email, fullName, status }) => {
    //nodemailer'dan gelen şey → transporter.sendMail()
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "İzin Talebi Güncellendi",
        text: `Merhaba ${fullName}, izin talebiniz ${status} olarak güncellendi.`,
    });
};

module.exports = {
    sendLeaveStatusEmail,
};