const nodemailer = require('nodemailer');

const sendOTP = async (otp) => {
  try {
    // Create a test account at Ethereal
    const testAccount = await nodemailer.createTestAccount();

    // Create reusable transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    // During development, instead of sending to virajbhamre55@gmail.com, we'll log a preview link
    const mailOptions = {
      from: '"Hostel System" <no-reply@example.com>',
      to: 'virajbhamre55@gmail.com',
      subject: 'Admin Login OTP',
      html: `<div>Your OTP: <strong>${otp}</strong></div>`
    };

    const info = await transporter.sendMail(mailOptions);
    
    // This creates a URL where you can preview the email that would have been sent
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

module.exports = { sendOTP };