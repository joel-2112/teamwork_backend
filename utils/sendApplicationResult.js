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

    let statusMessage = "";

    switch (applicationStatus.toLowerCase()) {
      case "reviewed":
        statusMessage = `
          <p>Your application has been <strong style="color: #1a73e8;">reviewed</strong> by our team.</p>
          <p>We will contact you if you're selected for the next phase.</p>
        `;
        break;
      case "interviewed":
        statusMessage = `
          <p>You have been <strong style="color: #ff9800;">invited for an interview</strong> for the <strong>${jobTitle}</strong> position.</p>
          <p>Please check your email or phone for more details regarding the interview schedule.</p>
        `;
        break;
      case "hired":
        statusMessage = `
          <p>Congratulations! You have been <strong style="color: green;">hired</strong> for the <strong>${jobTitle}</strong> position.</p>
          <p>Our HR team will be in touch with you regarding the next steps and onboarding process.</p>
        `;
        break;
      case "rejected":
        statusMessage = `
          <p>After careful consideration, we regret to inform you that you have not been selected for the <strong>${jobTitle}</strong> position.</p>
          <p>We truly appreciate your time and encourage you to apply for future opportunities with <strong>TeamWork IT Solution</strong>.</p>
        `;
        break;
      default:
        statusMessage = `
          <p>Your application status has been updated to <strong>${applicationStatus}</strong>.</p>
        `;
        break;
    }

    const mailOptions = {
      from: `"TeamWork IT Solution" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Application Update - ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h2 style="color: #1a73e8;">Job Application Status Update</h2>
          <p>Dear <strong>${fullName}</strong>,</p>

          <p>We would like to update you regarding your application for the <strong>${jobTitle}</strong> position at <strong>TeamWork IT Solution</strong>.</p>

          ${statusMessage}

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


export const sendJobApplicationConfirmationEmail = async ({ userEmail, fullName, jobTitle }) => {
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
      from: `"TeamWork IT Solution" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Job Application Submitted Successfully`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h2 style="color: #1a73e8;">Job Application Confirmation</h2>
          <p>Dear <strong>${fullName}</strong>,</p>

          <p>We have successfully received your application for the position of <strong>${jobTitle}</strong>. Thank you for showing interest in joining <strong>TeamWork IT Solution</strong>.</p>

          <p>Our recruitment team will carefully review your application. We will reach out to you if your profile matches our requirements.</p>

          <p>If you have any questions, feel free to reply to this message or contact us directly.</p>

          <br/>
          <p>Best regards,</p>
          <p><strong>TeamWork IT Solution</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Job application confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending job application confirmation email:", error.message);
  }
};
