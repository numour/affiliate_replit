import nodemailer from 'nodemailer';

// Create email transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // True if port is 465 (SSL)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Default from email address
const defaultFromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@numour.com';

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
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
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
        <img src="https://i.ibb.co/JrKS2S9/Numour-Logo-No-BG.png" alt="Numour Logo" style="width: 180px; height: auto;">
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
        <img src="https://i.ibb.co/JrKS2S9/Numour-Logo-No-BG.png" alt="Numour Logo" style="width: 180px; height: auto;">
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