import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendApplicationResultEmail = async ({
  userEmail,
  fullName,
  jobTitle,
  applicationStatus,
}) => {
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

    const isHired = applicationStatus.toLowerCase() === "hired";

    const mailOptions = {
      from: `"TeamWork IT Solution" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Your Application Result for ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h2 style="color: #1a73e8;">Application Update - ${jobTitle}</h2>
          <p>Dear <strong>${fullName}</strong>,</p>

          <p>Thank you for applying for the <strong>${jobTitle}</strong> position at <strong>TeamWork IT Solution</strong>.</p>

          ${
            isHired
              ? `<p>We are pleased to inform you that you have been <strong style="color: green;">hired</strong> for the position.</p>
                 <p>Our team will reach out to you soon with the next steps.</p>`
              : `<p>After careful consideration, we regret to inform you that you have not been selected for this position.</p>
                 <p>We appreciate the time and effort you invested in the application process and encourage you to apply for future opportunities with us.</p>`
          }

          <br/>
          <p>Best regards,</p>
          <p><strong>TeamWork IT Solution</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Job application result email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending application result email:", error.message);
  }
};
