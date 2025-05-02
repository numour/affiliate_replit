// Vercel serverless function entry point
import express, { Request, Response } from 'express';
import { storage } from '../server/storage';
import { insertAffiliateSchema } from '../shared/schema';
import { sendWelcomeEmail, sendBackupEmail } from '../server/email';
import { z } from 'zod';
import fetch from 'node-fetch';

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

// Export default handler for Vercel
export default app;