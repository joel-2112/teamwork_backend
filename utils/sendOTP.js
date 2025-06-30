import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendOtpEMail = async (OTP, userEmail) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"TeamWork" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Your OTP Code for Email Verification",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5;">
          <h2>Email Verification Code</h2>
          <p>Hello,</p>
          <p>Thank you for signing up. Please use the following One-Time Password (OTP) to verify your email address:</p>
          <h1 style="letter-spacing: 3px; font-size: 32px;">${OTP}</h1>
          <p>This OTP is valid for <strong>5 minutes</strong>.</p>
          <p>If you did not request this, please ignore this email.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>Your App Team</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending OTP email:", error.message);
  }
};
