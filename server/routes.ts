import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAffiliateSchema } from "@shared/schema";
import { z } from "zod";
import fetch from "node-fetch";

export async function registerRoutes(app: Express): Promise<Server> {
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
      
      // Send data to Google Sheets via webhook if environment variable is provided
      const googleWebhookUrl = process.env.GOOGLE_WEBHOOK_URL;
      console.log("Google webhook URL exists:", !!googleWebhookUrl);
      
      if (googleWebhookUrl) {
        try {
          // Prepare the data payload
          const payload = {
            name: validatedData.name,
            instagram: validatedData.instagram,
            phone: validatedData.phone,
            email: validatedData.email,
            address: validatedData.address,
            timestamp: new Date().toISOString()
          };
          
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
          } else {
            console.log("Successfully sent data to Google Sheets");
          }
        } catch (error) {
          console.error("Error sending data to Google Sheets:", error);
          console.error("Error details:", error instanceof Error ? error.message : String(error));
          console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
          // Continue processing even if Google Sheets fails
        }
      } else {
        console.log("No Google Sheets webhook URL provided. Skipping Google Sheets integration.");
      }
      
      // Send welcome email via MailerSend if API key is provided
      const mailerSendApiKey = process.env.MAILERSEND_API_KEY;
      console.log("MailerSend API key exists:", !!mailerSendApiKey);
      
      if (mailerSendApiKey) {
        try {
          console.log("Preparing to send welcome email to:", validatedData.email);
          
          // Create email payload with improved HTML design
          const emailPayload = {
            from: {
              email: "hello@numour.com",
              name: "Numour Family"
            },
            to: [
              {
                email: validatedData.email,
                name: validatedData.name
              }
            ],
            subject: "Welcome to the Numour Family! 💜",
            text: `Hi ${validatedData.name},

Welcome to the Numour family! We're so excited to have you join us on this journey.

Here's what's next:
- We'll review your application and get back to you soon
- You'll receive your first Numour products to try
- We'll set you up with your unique affiliate link

Thank you for joining us as we redefine skincare in India!

With love,
The Numour Team`,
            html: `<!DOCTYPE html>
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
        <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px;">Hi ${validatedData.name},</p>
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
</html>`
          };
          
          console.log("Sending email request to MailerSend API");
          
          // Send email using MailerSend API
          const response = await fetch("https://api.mailersend.com/v1/email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${mailerSendApiKey}`,
              "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify(emailPayload),
          });
          
          const responseStatus = response.status;
          console.log("MailerSend API response status:", responseStatus);
          
          const mailHeadersObj: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            mailHeadersObj[key] = value;
          });
          console.log("MailerSend API response headers:", JSON.stringify(mailHeadersObj));
          
          // Parse and log response
          const responseData = await response.text();
          try {
            const jsonData = JSON.parse(responseData);
            console.log("MailerSend API response:", jsonData);
            
            if (response.ok) {
              console.log("Welcome email sent successfully to", validatedData.email);
            } else {
              console.error("MailerSend API error:", jsonData);
            }
          } catch (e) {
            console.log("MailerSend API raw response:", responseData);
          }
          
        } catch (error) {
          console.error("Error sending welcome email:", error);
          console.error("Error details:", error instanceof Error ? error.message : String(error));
          // Continue processing even if email sending fails
        }
      } else {
        console.log("No MailerSend API key provided. Skipping email delivery.");
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
