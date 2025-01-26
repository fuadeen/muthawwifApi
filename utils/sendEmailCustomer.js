const sgMail = require('@sendgrid/mail') // Import SendGrid library
sgMail.setApiKey(process.env.SENDGRID_API_KEY) // Load SendGrid API key

/**
 * Sends a booking confirmation email.
 *
 * @param {Object} params - Parameters for the email.
 * @param {string} params.customerEmail - Customer's email address.
 * @param {string} params.customerName - Customer's full name.
 * @param {string} params.serviceType - Type of service booked.
 * @param {string} params.muthawwifName - Name of the Muthawwif.
 * @param {string} params.muthawwifEmail - Email of the Muthawwif.
 * @param {string} params.muthawwifMobile - Email of the Muthawwif.
 * @param {number} params.totalAmount - Total amount for the booking.
 * @param {string[]} params.bookingDates - List of booked dates.
 */

function formatServiceType(serviceType) {
  return serviceType
    .split('_') // Split by underscores
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
    .join(' ') // Join with spaces
}

async function sendBookingConfirmationEmail({
  customerEmail,
  customerName,
  serviceType,
  muthawwifName,
  muthawwifEmail,
  muthawwifMobile,
  totalAmount,
  bookingDates,
}) {
  const serviceTypeName = formatServiceType(serviceType)
  const emailBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px; padding: 20px; background-color: #f9f9f9;">
      <h2 style="color: #4CAF50; text-align: center;">Booking Confirmation</h2>
      <p>Dear ${customerName},</p>
      <p>Thank you for booking with us. Here are your booking details:</p>
      <ul>
        <li><strong>Service Type:</strong> ${serviceTypeName}</li>
        <li><strong>Muthawwif Name:</strong> ${muthawwifName}</li>
        <li><strong>Muthawwif Email:</strong> ${muthawwifEmail}</li>
        <li><strong>Muthawwif Mobile:</strong> ${muthawwifMobile}</li>
        <li><strong>Total Amount:</strong> SAR ${totalAmount}</li>
        <li><strong>Booked Dates:</strong> ${bookingDates.join(', ')}</li>
      </ul>
      <p>We look forward to serving you.</p>
      <p>Best regards,<br>Your Booking Team</p>
    </div>
  `

  const emailMessage = {
    to: customerEmail,
    from: 'admin@kinaustore.com', // Update with your verified sender email
    subject: 'Booking Confirmation',
    html: emailBody,
  }

  try {
    await sgMail.send(emailMessage)
    console.log('Email sent successfully to', customerEmail)
  } catch (error) {
    console.error('Error sending email:', error.message)
    throw new Error('Failed to send booking confirmation email.')
  }
}

module.exports = {
  sendBookingConfirmationEmail,
}
