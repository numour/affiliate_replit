import nodemailer from 'nodemailer';

// Create email transporter function (create a new connection for each email)
function createTransporter() {
  // Handle possible special characters in password
  const username = process.env.SMTP_USER || '';
  const password = process.env.SMTP_PASS || '';
  
  console.log(`Using SMTP user: ${username}`);
  // Don't log the actual password, just confirm we have one
  console.log(`SMTP password provided: ${password ? 'Yes' : 'No'}`);
  
  // Some email providers might require different authentication methods
  // Try different auth configurations based on the provider
  let authConfig: any = {
    user: username,
    pass: password,
  };
  
  // Determine if this is GoDaddy or other common providers
  const host = process.env.SMTP_HOST || '';
  if (host.includes('secureserver.net') || host.includes('godaddy')) {
    console.log('Using GoDaddy SMTP configuration');
    // GoDaddy sometimes requires XOAuth2 or specific settings
    authConfig = {
      user: username,
      pass: password,
      type: 'login',  // Try explicit login type for GoDaddy
    };
  } else if (host.includes('gmail')) {
    console.log('Using Gmail SMTP configuration');
    // Make sure Gmail is using the right auth type
    authConfig = {
      user: username,
      pass: password,
      type: 'login',  // For Gmail with app passwords
    };
  }
  
  const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // True if port is 465 (SSL)
    auth: authConfig,
    // Debug options
    debug: true, // Show debug output
    logger: true, // Log information to the console
    // TLS configuration
    tls: {
      // Do not fail on invalid certificates
      rejectUnauthorized: false
    },
    // Try another method if available
    authMethod: 'PLAIN'
  };
  
  console.log('SMTP Configuration:', {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    user: process.env.SMTP_USER ? '***User Provided***' : 'Missing',
    pass: process.env.SMTP_PASS ? '***Password Provided***' : 'Missing',
  });
  
  return nodemailer.createTransport(smtpConfig);
}

// Default from email address
const defaultFromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@numour.com';

// Base64 encoded logo image to embed directly in emails (prevents broken image links)
const logoBase64 = `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`;

// Welcoming banner image (purple gradient with text)
const welcomeBannerBase64 = `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`;

/**
 * Send an email using Nodemailer
 * @param mailOptions The email options for Nodemailer
 * @returns Promise<boolean> - Success or failure
 */
export async function sendEmail(mailOptions: nodemailer.SendMailOptions): Promise<boolean> {
  try {
    console.log("Sending email via SMTP");
    
    // Set default from if not provided
    if (!mailOptions.from) {
      mailOptions.from = `"Numour" <${defaultFromEmail}>`;
    }
    
    // Create a new transporter for this email
    const transporter = createTransporter();
    
    // Verify the transporter configuration
    try {
      const verification = await transporter.verify();
      console.log('Transporter verification result:', verification);
    } catch (verifyError) {
      console.error('Transporter verification failed:', verifyError);
      // Continue anyway - some servers don't support verification
    }
    
    // Log the email we're attempting to send
    console.log('Attempting to send email:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}

/**
 * Send a welcome email to a new affiliate
 * @param name Affiliate's name
 * @param email Affiliate's email address
 * @returns Promise<boolean> - Success or failure
 */
export async function sendWelcomeEmail(name: string, email: string): Promise<boolean> {
  console.log(`Preparing welcome email for ${name} at ${email}`);
  
  // HTML template for welcome email
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome to Numour</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f6ff; color: #333333;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(138, 99, 210, 0.1);">
    <tr>
      <td style="padding: 40px 30px 20px; text-align: center;">
        <img src="data:image/png;base64,${logoBase64}" alt="Numour Logo" style="width: 180px; height: auto;">
      </td>
    </tr>
    <tr>
      <td style="padding: 10px 30px 30px;">
        <h1 style="color: #8A63D2; font-size: 28px; margin: 0 0 20px; text-align: center;">Welcome to the Numour Family! 💜</h1>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px;">Hi ${name},</p>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">We're so excited to welcome you to the Numour family! Thank you for joining us on this journey to redefine skincare in India.</p>
        
        <div style="background-color: #F2EBFD; padding: 25px; border-radius: 10px; margin: 25px 0;">
          <h3 style="color: #8A63D2; margin: 0 0 15px; font-size: 20px;">Here's what's next:</h3>
          <ul style="list-style-type: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 15px; display: flex; align-items: flex-start;">
              <span style="color: #8A63D2; font-size: 20px; margin-right: 10px;">✨</span>
              <span style="font-size: 16px;">We'll review your application and get back to you soon</span>
            </li>
            <li style="margin-bottom: 15px; display: flex; align-items: flex-start;">
              <span style="color: #8A63D2; font-size: 20px; margin-right: 10px;">🌱</span>
              <span style="font-size: 16px;">You'll receive your first Numour products to try</span>
            </li>
            <li style="display: flex; align-items: flex-start;">
              <span style="color: #8A63D2; font-size: 20px; margin-right: 10px;">💌</span>
              <span style="font-size: 16px;">We'll set you up with your unique affiliate link</span>
            </li>
          </ul>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px;">Thank you for joining us as we build something beautiful together!</p>
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px;">With love,<br>The Numour Team</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px; background-color: #F2EBFD; text-align: center; border-top: 1px solid #D4C2F0;">
        <p style="font-size: 12px; color: #666; margin: 0;">© ${new Date().getFullYear()} Numour. All rights reserved.</p>
        <p style="font-size: 12px; color: #666; margin: 10px 0 0;">Made with 💜 in India</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  
  // Send email using SMTP
  return sendEmail({
    to: email,
    subject: 'Welcome to the Numour Family! 💜',
    html: htmlContent,
    text: `Hi ${name},

Welcome to the Numour family! We're so excited to have you join us on this journey.

Here's what's next:
- We'll review your application and get back to you soon
- You'll receive your first Numour products to try
- We'll set you up with your unique affiliate link

Thank you for joining us as we redefine skincare in India!

With love,
The Numour Team`
  });
}

/**
 * Send a backup email when Google Sheets fails
 * @param affiliateData The affiliate data that needs to be manually added
 * @returns Promise<boolean> - Success or failure
 */
export async function sendBackupEmail(affiliateData: Record<string, any>): Promise<boolean> {
  console.log("Preparing backup email with affiliate data");
  
  // Format data table for HTML
  const dataTable = `
  <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;">
    <tr style="background-color: #8A63D2; color: white;">
      <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Field</th>
      <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Value</th>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">Name</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${affiliateData.name}</td>
    </tr>
    <tr style="background-color: rgba(138, 99, 210, 0.1);">
      <td style="padding: 10px; border: 1px solid #ddd;">Instagram Handle</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${affiliateData.instagram}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">Phone Number</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${affiliateData.phone}</td>
    </tr>
    <tr style="background-color: rgba(138, 99, 210, 0.1);">
      <td style="padding: 10px; border: 1px solid #ddd;">Email</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${affiliateData.email}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">Address</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${affiliateData.address}</td>
    </tr>
    <tr style="background-color: rgba(138, 99, 210, 0.1);">
      <td style="padding: 10px; border: 1px solid #ddd;">Submission Time</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${affiliateData.timestamp}</td>
    </tr>
  </table>
  `;
  
  // HTML template for backup notification email
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Backup: New Affiliate Registration</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f6ff; color: #333333;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(138, 99, 210, 0.1);">
    <tr>
      <td style="padding: 40px 30px 20px; text-align: center;">
        <img src="data:image/png;base64,${logoBase64}" alt="Numour Logo" style="width: 180px; height: auto;">
      </td>
    </tr>
    <tr>
      <td style="padding: 0px 30px 20px;">
        <div style="background-color: #ffeeee; padding: 15px; border-radius: 8px; border-left: 4px solid #ff6b6b;">
          <h3 style="color: #cc0000; margin-top: 0;">Google Sheets Backup</h3>
          <p>This is a backup of affiliate registration data that could not be saved to Google Sheets.</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 10px 30px 30px;">
        <h1 style="color: #8A63D2; font-size: 24px; margin: 0 0 20px;">New Affiliate Registration</h1>
        
        <p>The following affiliate registration data was received but could not be saved to Google Sheets:</p>
        
        ${dataTable}
        
        <p style="margin-top: 30px; padding-top: 10px; border-top: 1px solid #eee;">
          <strong>Note:</strong> Please manually add this data to your Google Sheet, or check if there are issues with the webhook integration.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 30px; background-color: #F2EBFD; text-align: center; border-top: 1px solid #D4C2F0;">
        <p style="font-size: 12px; color: #666; margin: 0;">© ${new Date().getFullYear()} Numour. All rights reserved.</p>
        <p style="font-size: 12px; color: #666; margin: 10px 0 0;">Made with 💜 in India</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  
  // Generate plain text version
  const plainText = `New Affiliate Registration (Google Sheets backup)

Name: ${affiliateData.name}
Instagram: ${affiliateData.instagram}
Phone: ${affiliateData.phone}
Email: ${affiliateData.email}
Address: ${affiliateData.address}
Submitted: ${affiliateData.timestamp}

This is a backup of affiliate registration data that could not be saved to Google Sheets. Please manually add this data to your records.`;
  
  // Send backup email to admin
  return sendEmail({
    to: 'hanselenterprise@gmail.com',
    subject: '🚨 Backup: New Affiliate Registration Data',
    html: htmlContent,
    text: plainText
  });
}