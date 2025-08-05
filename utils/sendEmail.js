import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendServiceOrderConfirmationEmail = async ({
  userEmail,
  fullName,
  serviceName,
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

    const mailOptions = {
      from: `"TeamWork IT Solution" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Service Order Confirmation - ${serviceName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h2 style="color: #1a73e8;">Order Placed Successfully - ${serviceName}</h2>
          <p>Dear <strong>${fullName}</strong>,</p>

          <p>We have received your service order for <strong>${serviceName}</strong>. Thank you for choosing <strong>TeamWork IT Solution</strong>.</p>

          <p>Our team is currently reviewing your request. Please wait while we process your order. You will receive a follow-up email once your request is reviewed and acted upon.</p>

          <p>If you have any questions or need further assistance, feel free to reply to this email.</p>

          <br/>
          <p>Best regards,</p>
          <p><strong>TeamWork IT Solution</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Service order confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.error(
      "Error sending service order confirmation email:",
      error.message
    );
  }
};

export const sendOrderStatusUpdateEmail = async ({
  userEmail,
  fullName,
  orderTitle,
  status,
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

    switch (status) {
      case "accepted":
        statusMessage =
          "Your service order has been <strong style='color:green;'>accepted</strong>. We will begin processing it shortly.";
        break;
      case "in_progress":
        statusMessage =
          "Your service order is currently <strong style='color:orange;'>in progress</strong>.";
        break;
      case "completed":
        statusMessage =
          "Your service order has been <strong style='color:green;'>completed</strong>. Thank you for your patience.";
        break;
      case "rejected":
        statusMessage =
          "We regret to inform you that your service order was <strong style='color:red;'>rejected</strong>.";
        break;
      case "cancelled":
        statusMessage =
          "You have <strong style='color:red;'>cancelled</strong> your service order. If this was a mistake, please submit a new request.";
        break;
      default:
        statusMessage = `Your order status has been updated to: <strong>${status}</strong>.`;
    }

    const mailOptions = {
      from: `"TeamWork IT Solution" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Update on Your Service Order: ${orderTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h2 style="color: #1a73e8;">Service Order Status Update</h2>
          <p>Dear <strong>${fullName}</strong>,</p>

          <p>${statusMessage}</p>

          <p>Order Title: <strong>${orderTitle}</strong></p>

          <p>If you have any questions, feel free to reply to this email.</p>

          <br/>
          <p>Best regards,</p>
          <p><strong>TeamWork IT Solution</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Status update email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending order status update email:", error.message);
  }
};

export const sendAgentRequestConfirmationEmail = async ({
  userEmail,
  fullName,
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

    const mailOptions = {
      from: `"TeamWork IT Solution" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Agent Request Submitted Successfully`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h2 style="color: #1a73e8;">Agent Request Confirmation</h2>
          <p>Dear <strong>${fullName}</strong>,</p>

          <p>We have successfully received your <strong>agent request</strong>. Thank you for your interest in collaborating with <strong>TeamWork IT Solution</strong>.</p>

          <p>Our team will review your request shortly. Please wait for our response via email or phone.</p>

          <p>If you have any questions, feel free to reply to this message or contact us directly.</p>

          <br/>
          <p>Best regards,</p>
          <p><strong>TeamWork IT Solution</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Agent request confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.error(
      "Error sending agent request confirmation email:",
      error.message
    );
  }
};

// utils/sendEmail.js
export const sendAgentStatusUpdateEmail = async ({
  userEmail,
  fullName,
  agentStatus,
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
    switch (agentStatus) {
      case "reviewed":
        statusMessage =
          "Your agent request has been <strong>reviewed</strong>. We will notify you of the final decision soon.";
        break;
      case "accepted":
        statusMessage =
          "Congratulations! Your agent request has been <strong style='color:green;'>accepted</strong>.";
        break;
      case "rejected":
        statusMessage =
          "We regret to inform you that your agent request has been <strong style='color:red;'>rejected</strong>.";
        break;
      case "cancelled":
        statusMessage =
          "You have <strong style='color:red;'>cancelled</strong> your agent request. If this was a mistake, please submit a new request.";
        break;
      default:
        statusMessage = `Your agent request status has been updated to <strong>${agentStatus}</strong>.`;
    }

    const mailOptions = {
      from: `"TeamWork IT Solution" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Agent Request Status Update`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h2 style="color: #1a73e8;">Agent Request Status Update</h2>
          <p>Dear <strong>${fullName}</strong>,</p>

          <p>${statusMessage}</p>

          <p>If you have any questions, feel free to reply to this email.</p>

          <br/>
          <p>Best regards,</p>
          <p><strong>TeamWork IT Solution</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Agent status update email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending agent status update email:", error.message);
  }
};

export const sendPartnershipRequestConfirmationEmail = async ({
  userEmail,
  fullName,
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

    const mailOptions = {
      from: `"TeamWork IT Solution" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Partnership Request Submitted Successfully`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h2 style="color: #1a73e8;">Partnership Request Confirmation</h2>
          <p>Dear <strong>${fullName}</strong>,</p>

          <p>We have successfully received your <strong>partnership request</strong>. Thank you for your interest in collaborating with <strong>TeamWork IT Solution</strong>.</p>

          <p>Our team will review your request shortly. Please wait for our response via email or phone.</p>

          <p>If you have any questions, feel free to reply to this message or contact us directly.</p>

          <br/>
          <p>Best regards,</p>
          <p><strong>TeamWork IT Solution</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Partnership request confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.error(
      "Error sending partnership request confirmation email:",
      error.message
    );
  }
};

export const sendPartnershipStatusUpdateEmail = async ({
  userEmail,
  fullName,
  status,
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

    const statusMessages = {
      reviewed: {
        subject: "Your Partnership Request Has Been Reviewed",
        body: `<p>We have reviewed your partnership request. Our team is evaluating the next steps and will contact you if needed.</p>`,
      },
      accepted: {
        subject: "Congratulations! Your Partnership Request is Accepted",
        body: `<p>We are excited to inform you that your partnership request has been <strong>accepted</strong>. Welcome to TeamWork IT Solution as a valued partner!</p>`,
      },
      rejected: {
        subject: "Your Partnership Request Has Been Rejected",
        body: `<p>We regret to inform you that your partnership request has been <strong>rejected</strong>. We appreciate your interest and encourage you to reach out again in the future.</p>`,
      },
    };

    const { subject, body } = statusMessages[status] || {
      subject: "Partnership Request Status Update",
      body: `<p>Your partnership request has been updated to: <strong>${status}</strong>.</p>`,
    };

    const mailOptions = {
      from: `"TeamWork IT Solution" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h2 style="color: #1a73e8;">Partnership Request Status Update</h2>
          <p>Dear <strong>${fullName}</strong>,</p>
          ${body}
          <p>If you have any questions, feel free to contact us.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>TeamWork IT Solution</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(
      `Partnership status update email (${status}) sent to ${userEmail}`
    );
  } catch (error) {
    console.error(
      "Error sending partnership status update email:",
      error.message
    );
  }
};

// To send password forgot link
export const sendPasswordResetEmail = async ({
  userEmail,
  fullName,
  resetLink,
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



    const mailOptions = {
      from: `"TeamWork IT Solution" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Password Reset Request`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
          <h2 style="color: #d93025;">Password Reset Request</h2>
          <p>Dear <strong>${fullName}</strong>,</p>

          <p>We received a request to reset your password for your <strong>TeamWork IT Solution</strong> account.</p>

          <p>Click the link below to reset your password. This link will expire in <strong>15 minutes</strong>:</p>
          <p><a href="${resetLink}" style="color: #1a73e8;">Reset Password</a></p>

          <p>If you didn’t request this, you can ignore this email. Your password will remain unchanged.</p>

          <br/>
          <p>Best regards,</p>
          <p><strong>TeamWork IT Solution</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending password reset email:", error.message);
  }
};
