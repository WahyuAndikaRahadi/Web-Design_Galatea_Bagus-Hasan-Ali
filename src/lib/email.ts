import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || "CollaboLab <noreply@collabolab.id>";

export async function sendVerificationEmail(email: string, name: string, otp: string) {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Verifikasi Email CollaboLab 🤝",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 3px solid #000; border-radius: 8px; overflow: hidden;">
        <div style="background: #FFE500; padding: 24px; border-bottom: 3px solid #000;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #000;">CollaboLab 🤝</h1>
          <p style="margin: 4px 0 0; font-size: 13px; color: #333;">Find Your People. Build Together.</p>
        </div>
        <div style="padding: 32px; background: #fff;">
          <p style="font-size: 16px; color: #000;">Hei <strong>${name}</strong>! 👋</p>
          <p style="color: #3D3D3D;">Masukkan kode OTP berikut untuk memverifikasi email kamu:</p>
          <div style="background: #F5F0E8; border: 2px solid #000; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; box-shadow: 4px 4px 0px #000;">
            <span style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #000;">${otp}</span>
          </div>
          <p style="color: #3D3D3D; font-size: 14px;">Kode ini berlaku selama <strong>10 menit</strong>.</p>
          <p style="color: #3D3D3D; font-size: 14px;">Jika kamu tidak mendaftar di CollaboLab, abaikan email ini.</p>
        </div>
        <div style="padding: 16px 32px; background: #F5F0E8; border-top: 2px solid #000; font-size: 12px; color: #3D3D3D;">
          CollaboLab — Team Galatea | HIMSE Telkom University Surabaya
        </div>
      </div>
    `,
  });
}

export async function sendApprovalEmail(email: string, name: string, projectTitle: string) {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `✅ Kamu diterima di project "${projectTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 3px solid #000; border-radius: 8px; overflow: hidden;">
        <div style="background: #00D37F; padding: 24px; border-bottom: 3px solid #000;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #000;">CollaboLab 🤝</h1>
        </div>
        <div style="padding: 32px; background: #fff;">
          <p style="font-size: 16px; color: #000;">Selamat <strong>${name}</strong>! 🎉</p>
          <p style="color: #3D3D3D;">Kamu berhasil diterima di project <strong>"${projectTitle}"</strong>. Langsung masuk ke Collab Room dan mulai berkolaborasi!</p>
        </div>
      </div>
    `,
  });
}

export async function sendRejectionEmail(email: string, name: string, projectTitle: string) {
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `Update lamaran project "${projectTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 3px solid #000; border-radius: 8px; overflow: hidden;">
        <div style="background: #FFE500; padding: 24px; border-bottom: 3px solid #000;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #000;">CollaboLab 🤝</h1>
        </div>
        <div style="padding: 32px; background: #fff;">
          <p style="font-size: 16px; color: #000;">Hei <strong>${name}</strong>,</p>
          <p style="color: #3D3D3D;">Sayangnya, lamaranmu untuk project <strong>"${projectTitle}"</strong> belum bisa diterima saat ini. Jangan menyerah — masih banyak project lain yang menunggumu di CollaboLab! 💪</p>
        </div>
      </div>
    `,
  });
}

export async function sendDeadlineReminderEmail(email: string, name: string, projectTitle: string, deadline: Date) {
  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: `⏰ ${daysLeft} hari lagi — deadline project "${projectTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 3px solid #000; border-radius: 8px; overflow: hidden;">
        <div style="background: #FF4D4D; padding: 24px; border-bottom: 3px solid #000;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #fff;">CollaboLab 🤝</h1>
        </div>
        <div style="padding: 32px; background: #fff;">
          <p style="font-size: 16px; color: #000;">Hei <strong>${name}</strong>! ⏰</p>
          <p style="color: #3D3D3D;">Deadline project <strong>"${projectTitle}"</strong> tinggal <strong>${daysLeft} hari lagi</strong>. Yuk semangat!</p>
        </div>
      </div>
    `,
  });
}
