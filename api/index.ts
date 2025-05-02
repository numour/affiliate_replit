// Vercel serverless function entry point
import express from 'express';
import { registerRoutes } from '../server/routes';
import { serveStatic } from '../server/vite';
import { storage } from '../server/storage';
import { insertAffiliateSchema } from '../shared/schema';
import { sendWelcomeEmail, sendBackupEmail } from '../server/email';
import { z } from 'zod';
import fetch from 'node-fetch';

// Create a simple Express app for Vercel serverless environment
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Tell the app we're running in Vercel
process.env.VERCEL = "1";
process.env.NODE_ENV = "production";

// Set up the affiliate registration endpoint
app.post("/api/affiliates", async (req, res) => {
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
        
        // Get and log the response text
        const responseData = await response.text();
        
        if (!response.ok) {
          googleSheetsSuccess = false;
        } else {
          googleSheetsSuccess = true;
        }
      } catch (error) {
        console.error("Error sending data to Google Sheets");
        googleSheetsSuccess = false;
      }
    } else {
      googleSheetsSuccess = false;
    }
    
    // 2. Send backup notification email when Google Sheets fails
    if (!googleSheetsSuccess) {
      try {
        // Send backup email using SMTP
        await sendBackupEmail(payload);
      } catch (error) {
        console.error("Error sending backup data email");
      }
    }
    
    // 3. Send welcome email to the new affiliate
    try {
      // Send welcome email using SMTP
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
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Serve static files
serveStatic(app);

// Default route to serve index
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: './dist' });
});

// Export the Express app as the serverless function handler
export default app;