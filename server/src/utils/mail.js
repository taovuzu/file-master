import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import { ApiError } from "./ApiError.js";

// input : {email,mailgenContent,subject}

const sendEmail = async (input) => {

  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "tier",
      link: "http://localhost:3000"
    }
  });

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  const emailHTML = mailGenerator.generate(input.mailgenContent);

  const emailText = mailGenerator.generatePlaintext(input.mailgenContent);

  const mail = {
    from: "narmankalyan@gmail.com", 
    to: input.email, 
    subject: input.subject, 
    text: emailText, 
    html: emailHTML, 
  }
  try {
    await transporter.sendMail(mail);
  } catch (error) {
    throw new ApiError(400, "Email could not be send",error);
  }
}



const emailVerificationMailgen = (verificationUrl, otpNumber) => {
  return {
    body: {
      intro: "Welcome to tier! We're very excited to have you on board.",
      action: {
        instructions: `Either click on the link to verify your email or enter the OTP: <span style="color: #ff5733; font-size: 28px; font-weight: bold;">${otpNumber}</span>`,
        button: {
          color: "#22BC66",
          text: "Confirm your account",
          link: verificationUrl
        }
      },
      outro: 'This is a system-generated email. Do not reply to this!'
    }
  };
};

const forgetPasswordMailgen = (verificationUrl) => {
  return {
    body: {
      intro: "Welcome to tier! We're very excited to have you on board.",
      action: {
        instructions: `Click on the link to reset your password of the tier `,
        button: {
          color: "#22BC66",
          text: "Confirm your account",
          link: verificationUrl
        }
      },
      outro: 'This is a system-generated email. Do not reply to this!'
    }
  };
};



export { sendEmail, emailVerificationMailgen, forgetPasswordMailgen };