// Direct SMTP handler for standalone email sending
import nodemailer from 'nodemailer';

/**
 * Handle direct SMTP email requests
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get action type and data from request body
    const { action, data } = req.body;

    // Validate required parameters
    if (!action || !data) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    let result = false;

    // Process different actions
    switch (action) {
      case 'welcome':
        // Send welcome email
        if (!data.name || !data.email) {
          return res.status(400).json({ success: false, message: 'Missing name or email for welcome email' });
        }
        result = await sendWelcomeEmail(data.name, data.email);
        break;

      case 'backup':
        // Send backup email
        if (!data.name || !data.email || !data.instagram || !data.phone || !data.address) {
          return res.status(400).json({ success: false, message: 'Missing required fields for backup email' });
        }
        result = await sendBackupEmail(data);
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    // Return result
    if (result) {
      return res.status(200).json({ success: true, message: 'Email sent successfully' });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Error in SMTP handler:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}

/**
 * Send an email using SMTP
 * @param {object} options - Email options
 * @returns {Promise<boolean>} - Success or failure
 */
async function sendEmail(options) {
  try {
    // Capture SMTP settings from environment variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // Log configuration (without password)
    console.log('SMTP Configuration:', {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser
    });

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        rejectUnauthorized: false // Accept self-signed certificates
      },
      // Debug options
      logger: true,
      debug: true
    });

    // Send email
    const info = await transporter.sendMail(options);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send welcome email to new affiliate
 * @param {string} name - Affiliate name
 * @param {string} email - Affiliate email
 * @returns {Promise<boolean>} - Success or failure
 */
async function sendWelcomeEmail(name, email) {
  const fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@numour.com';
  
  const mailOptions = {
    from: `"Numour Family" <${fromEmail}>`,
    to: email,
    subject: 'Welcome to the Numour Family! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #6a4c93;">Welcome to the Numour Family! 🎉</h2>
        <p>Hello ${name},</p>
        <p>We're thrilled to have you join our affiliate program! Your application has been successfully registered.</p>
        <p>Our team will review your information and get back to you shortly with the next steps.</p>
        <p>In the meantime, feel free to explore our product range and get familiar with what we offer.</p>
        <p>Best regards,<br>The Numour Team</p>
      </div>
    `
  };
  
  return await sendEmail(mailOptions);
}

/**
 * Send backup email when Google Sheets submission fails
 * @param {object} data - Affiliate data
 * @returns {Promise<boolean>} - Success or failure
 */
async function sendBackupEmail(data) {
  const fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@numour.com';
  
  const mailOptions = {
    from: `"Numour Affiliate System" <${fromEmail}>`,
    to: 'hanselenterprise@gmail.com',
    subject: 'BACKUP: New Affiliate Registration Data',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #d9534f;">Backup Notification: Google Sheets Integration Failed</h2>
        <p>The system failed to send data to Google Sheets. Please manually add this affiliate to your records.</p>
        <h3>Affiliate Data:</h3>
        <ul>
          <li><strong>Name:</strong> ${data.name}</li>
          <li><strong>Instagram:</strong> ${data.instagram}</li>
          <li><strong>Phone:</strong> ${data.phone}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Address:</strong> ${data.address}</li>
          <li><strong>Timestamp:</strong> ${data.timestamp || new Date().toISOString()}</li>
        </ul>
        <p>Please add this information to your Google Sheets manually.</p>
      </div>
    `
  };
  
  return await sendEmail(mailOptions);
}