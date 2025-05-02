// Serverless function to handle affiliate registration
import { z } from 'zod';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

// Schema validation
const affiliateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  instagram: z.string(),
  phone: z.string(),
  address: z.string()
});

// Email functions
async function sendEmail(options) {
  try {
    // Create transporter with SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Send email
    await transporter.sendMail(options);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

// Welcome Email
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

// Backup Email
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
          <li><strong>Timestamp:</strong> ${data.timestamp}</li>
        </ul>
        <p>Please add this information to your Google Sheets manually.</p>
      </div>
    `
  };
  
  return await sendEmail(mailOptions);
}

// Main handler for affiliate registration
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log("Received affiliate registration request in Vercel");
    
    // Log request body to troubleshoot submission errors
    console.log("Request body:", JSON.stringify(req.body));
    
    // Validate request data with more lenient validation for Instagram
    // Instead of using schema directly, we'll modify the validation
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ message: "Invalid request format" });
    }
    
    const { name, email, instagram, phone, address } = req.body;
    
    // Manual validation with better error handling
    if (!name || name.length < 2) {
      return res.status(400).json({ message: "Name is required and must be at least 2 characters" });
    }
    
    if (!email || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ message: "Valid email is required" });
    }
    
    // Instagram validation - handle the @ symbol automatically if missing
    let instagramHandle = instagram;
    if (instagram && !instagram.startsWith('@')) {
      instagramHandle = '@' + instagram;
    }
    
    if (!phone || phone.length < 10) {
      return res.status(400).json({ message: "Valid phone number is required" });
    }
    
    if (!address || address.length < 5) {
      return res.status(400).json({ message: "Valid address is required" });
    }
    
    // Prepare payload for Google Sheets and emails
    const payload = {
      name: name,
      instagram: instagramHandle,
      phone: phone,
      email: email,
      address: address,
      timestamp: new Date().toISOString()
    };
    
    // Return success response first to avoid timeout issues
    // We'll use non-blocking operations to complete the rest of the process
    const responseData = {
      message: "Affiliate registration successful",
      affiliate: {
        name: name,
        email: email
      }
    };
    
    // Send response before continuing with potentially slow operations
    res.status(201).json(responseData);
    
    // Continue processing in the background (non-blocking)
    // These operations won't block the response
    
    // Send to Google Sheets (non-blocking)
    const googleWebhookUrl = process.env.GOOGLE_WEBHOOK_URL;
    let googleSheetsSuccess = false;
    
    if (googleWebhookUrl) {
      console.log("Sending data to Google Sheets webhook:", googleWebhookUrl);
      
      // Attempt to send data to Google Sheets
      fetch(googleWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        redirect: "follow",
        body: JSON.stringify(payload),
      })
      .then(response => {
        console.log("Google Sheets response status:", response.status);
        googleSheetsSuccess = response.ok;
        
        // If Google Sheets failed, send backup email
        if (!googleSheetsSuccess) {
          console.error("Google Sheets submission failed with status:", response.status);
          return response.text().then(text => {
            console.error("Google Sheets error response:", text);
            return sendBackupEmail(payload);
          });
        } else {
          console.log("Successfully submitted to Google Sheets");
          return response.text().then(text => {
            console.log("Google Sheets response:", text);
          });
        }
      })
      .catch(error => {
        console.error("Error sending data to Google Sheets:", error);
        // Also send backup email on error
        return sendBackupEmail(payload);
      });
    }
    
    // Send welcome email (non-blocking)
    sendWelcomeEmail(name, email)
      .catch(error => {
        console.error("Error sending welcome email:", error);
      });
    
    // Since we already sent the response, we'll return to end the function
    return;

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("Server error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}