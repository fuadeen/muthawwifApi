require('dotenv').config() // Load environment variables
const sgMail = require('@sendgrid/mail') // Import SendGrid module

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Define email message
const msg = {
  to: 'fuadinaslah@gmail.com', // Replace with recipient email
  from: 'admin@kinaustore.com', // Replace with your verified sender email
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px; padding: 20px; background-color: #f9f9f9;">
      <h2 style="color: #4CAF50; text-align: center;">Welcome to [Your Company Name]</h2>
      <p>Dear [Recipient's Name],</p>
      <p>We are delighted to have you on board. At [Your Company Name], we strive to provide the best experience for our clients and partners. If you have any questions or need support, please don’t hesitate to reach out to us.</p>
      <p style="text-align: center;">
        <a href="https://yourwebsite.com" style="display: inline-block; background-color: #4CAF50; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visit Our Website</a>
      </p>
      <p>Best regards,<br>[Your Company Name] Team</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">This email was sent from an automated system. Please do not reply to this email.</p>
    </div>
  `,
}

// Send email
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent successfully!')
  })
  .catch((error) => {
    console.error('Error sending email:', error)
  })
