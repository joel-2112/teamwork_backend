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
