import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAffiliateSchema } from "@shared/schema";
import { z } from "zod";
import fetch from "node-fetch";
import { sendWelcomeEmail, sendBackupEmail } from "./email";

export async function registerRoutes(app: Express): Promise<Server | null> {
  // Affiliate registration endpoint
  app.post("/api/affiliates", async (req, res) => {
    try {
      console.log("Received affiliate registration request:", req.body);
      
      // Validate the request body against our schema
      const validatedData = insertAffiliateSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      
      // Save the affiliate data to the storage
      const affiliate = await storage.createAffiliate(validatedData);
      console.log("Affiliate created:", affiliate);
      
      // Get integration settings
      const googleWebhookUrl = process.env.GOOGLE_WEBHOOK_URL;
      
      console.log("Google webhook URL exists:", !!googleWebhookUrl);
      
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
          console.log("Sending data to Google Sheets webhook:", JSON.stringify(payload));
          console.log("Webhook URL:", googleWebhookUrl);
          
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
          
          console.log("Google Sheets response status:", response.status);
          const headersObj: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            headersObj[key] = value;
          });
          console.log("Google Sheets response headers:", JSON.stringify(headersObj));
          
          // Get and log the response text
          const responseData = await response.text();
          console.log("Google Sheets response body:", responseData);
          
          if (!response.ok) {
            console.error("Google Sheets webhook error details:", {
              status: response.status,
              statusText: response.statusText,
              body: responseData
            });
            // Set success flag to false to trigger backup email
            googleSheetsSuccess = false;
          } else {
            console.log("Successfully sent data to Google Sheets");
            googleSheetsSuccess = true;
          }
        } catch (error) {
          console.error("Error sending data to Google Sheets:", error);
          console.error("Error details:", error instanceof Error ? error.message : String(error));
          console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
          // Set success flag to false to trigger backup email
          googleSheetsSuccess = false;
        }
      } else {
        console.log("No Google Sheets webhook URL provided. Skipping Google Sheets integration.");
        // If Google Sheets webhook is not configured, we need to send the backup email
        googleSheetsSuccess = false;
      }
      
      // 2. Send backup notification email when Google Sheets fails
      if (!googleSheetsSuccess) {
        console.log("Google Sheets integration failed. Sending backup data email...");
        
        try {
          // Send backup email using SMTP
          const backupSuccess = await sendBackupEmail(payload);
          
          if (backupSuccess) {
            console.log("Backup data email sent successfully to hanselenterprise@gmail.com");
          } else {
            console.error("Failed to send backup email via SMTP");
          }
        } catch (error) {
          console.error("Error sending backup data email:", error);
          console.error("Error details:", error instanceof Error ? error.message : String(error));
        }
      }
      
      // Send welcome email to the new affiliate
      console.log("Preparing welcome email for new affiliate...");
      try {
        console.log("Preparing to send welcome email to:", validatedData.email);
        
        // Send welcome email using SMTP
        const welcomeEmailSuccess = await sendWelcomeEmail(validatedData.name, validatedData.email);
        
        if (welcomeEmailSuccess) {
          console.log("Welcome email sent successfully to", validatedData.email);
        } else {
          console.error("Failed to send welcome email via SMTP");
        }
      } catch (error) {
        console.error("Error sending welcome email:", error);
        console.error("Error details:", error instanceof Error ? error.message : String(error));
        // Continue processing even if email sending fails
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
      console.error("Error processing affiliate registration:", error);
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

  const httpServer = createServer(app);
  return httpServer;
}
