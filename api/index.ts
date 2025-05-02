// Vercel serverless function entry point - Standalone handler for Vercel deployment
import express, { Request, Response } from 'express';
import { z } from 'zod';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

// Simplified schema implementation for Vercel
const insertAffiliateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  instagram: z.string(),
  phone: z.string(),
  address: z.string()
});

// Simple in-memory storage implementation for serverless
class VercelStorage {
  private affiliateId = 1;

  async createAffiliate(data: z.infer<typeof insertAffiliateSchema>) {
    const id = this.affiliateId++;
    return {
      id,
      ...data,
      createdAt: new Date()
    };
  }
}

const storage = new VercelStorage();

// Email sending functionality
async function sendEmail(options: nodemailer.SendMailOptions): Promise<boolean> {
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

// Send welcome email function
async function sendWelcomeEmail(name: string, email: string): Promise<boolean> {
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

// Send backup email function
async function sendBackupEmail(data: any): Promise<boolean> {
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

// Create Express handler for the serverless API
const app = express();
app.use(express.json());

// API route handler for affiliate registration
async function processAffiliateRegistration(req: Request, res: Response) {
  try {
    console.log("Received affiliate registration request in Vercel");
    
    // Validate the request body against our schema
    const validatedData = insertAffiliateSchema.parse(req.body);
    
    // Save the affiliate data to the storage
    const affiliate = await storage.createAffiliate(validatedData);
    
    // Get integration settings
    const googleWebhookUrl = process.env.GOOGLE_WEBHOOK_URL;
    
    // Prepare the data payload (will be used for both Google Sheets and emails)
    const payload = {
      name: validatedData.name,
      instagram: validatedData.instagram,
      phone: validatedData.phone,
      email: validatedData.email,
      address: validatedData.address,
      timestamp: new Date().toISOString()
    };
    
    // Flag to track Google Sheets success
    let googleSheetsSuccess = false;
    
    // 1. Send data to Google Sheets if webhook URL is provided
    if (googleWebhookUrl) {
      try {
        console.log("Sending data to Google Sheets webhook");
        
        // Send data to Google Sheets
        const response = await fetch(googleWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          redirect: "follow",
          body: JSON.stringify(payload),
        });
        
        if (response.ok) {
          googleSheetsSuccess = true;
        }
      } catch (error) {
        console.error("Error sending data to Google Sheets");
      }
    }
    
    // 2. Send backup notification email when Google Sheets fails
    if (!googleSheetsSuccess) {
      try {
        await sendBackupEmail(payload);
      } catch (error) {
        console.error("Error sending backup data email");
      }
    }
    
    // 3. Send welcome email to the new affiliate
    try {
      await sendWelcomeEmail(validatedData.name, validatedData.email);
    } catch (error) {
      console.error("Error sending welcome email");
    }
    
    // Return success response
    return res.status(201).json({
      message: "Affiliate registration successful",
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
      },
    });
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

// Configure route
app.post('/api/affiliates', processAffiliateRegistration);

// Simple health check for Vercel
app.get('/api/health', (_, res) => {
  res.status(200).json({ status: 'OK', environment: 'Vercel' });
});

// API health check to ensure deployment is working
app.get('/api/status', (_, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'unknown',
    vercel: process.env.VERCEL || 'not-vercel'
  });
});

// Export default handler for Vercel
export default app;