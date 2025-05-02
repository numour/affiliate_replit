// Completely standalone serverless API function for Vercel
// This file doesn't depend on any external modules from the project

import express from 'express';
import { z } from 'zod';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

// Create Express app
const app = express();
app.use(express.json());

// Schema validation
const affiliateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  instagram: z.string(),
  phone: z.string(),
  address: z.string()
});

// Simple in-memory storage (not persistent but works for serverless)
let affiliateCounter = 1;

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
app.post('/api/affiliates', async (req, res) => {
  try {
    console.log("Received affiliate registration request in Vercel");
    
    // Log request body to troubleshoot submission errors
    console.log("Request body:", JSON.stringify(req.body));
    
    // Validate request data with more lenient validation
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
    
    // Create affiliate (in memory only)
    const affiliateId = affiliateCounter++;
    
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
    const responseData = {
      message: "Affiliate registration successful",
      affiliate: {
        id: affiliateId,
        name: name,
        email: email
      }
    };
    
    // Send response immediately to avoid Vercel timeout
    res.status(201).json(responseData);
    
    // Continue with background processing (non-blocking)
    
    // Send to Google Sheets (non-blocking)
    const googleWebhookUrl = process.env.GOOGLE_WEBHOOK_URL;
    
    if (googleWebhookUrl) {
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
        const googleSheetsSuccess = response.ok;
        // If Google Sheets failed, send backup email
        if (!googleSheetsSuccess) {
          return sendBackupEmail(payload);
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
      
    // We've already sent the response, so no need to return anything here
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
});

// Health check endpoint
app.get('/api/health', (_, res) => {
  res.status(200).json({ 
    status: 'OK', 
    environment: 'Vercel',
    timestamp: new Date().toISOString() 
  });
});

// Default handler for other paths
app.get('*', (_, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Numour API Server</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          padding: 20px;
          text-align: center;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          padding: 40px;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #6a4c93; }
        .api-status {
          margin-top: 20px;
          padding: 15px;
          border-radius: 5px;
          background: #e8f5e9;
          border-left: 5px solid #4caf50;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Numour API Server</h1>
        <div class="api-status">
          <p>API is running correctly ✅</p>
          <p>This is the API server for the Numour Affiliate Program.</p>
        </div>
        <p>To access the main website, please visit the frontend URL.</p>
      </div>
    </body>
    </html>
  `);
});

// Export for Vercel serverless function
export default app;