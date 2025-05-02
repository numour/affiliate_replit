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
      if (googleWebhookUrl) {
        try {
          await fetch(googleWebhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(validatedData),
          });
        } catch (error) {
          console.error("Error sending data to Google Sheets:", error);
          // Continue processing even if Google Sheets fails
        }
      }
      
      // Send welcome email via MailerSend if API key is provided
      const mailerSendApiKey = process.env.MAILERSEND_API_KEY;
      if (mailerSendApiKey) {
        try {
          await fetch("https://api.mailersend.com/v1/email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${mailerSendApiKey}`,
              "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify({
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
              text: `Hi ${validatedData.name},\n\nWelcome to the Numour family! We're excited to have you join us on this journey.\n\nHere's what's next:\n- We'll review your application and get back to you soon\n- You'll receive your first Numour products to try\n- We'll set you up with your unique affiliate link\n\nThank you for joining us as we redefine skincare in India!\n\nWith love,\nThe Numour Team`,
              html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                      <img src="https://i.ibb.co/JrKS2S9/Numour-Logo-No-BG.png" alt="Numour Logo" style="width: 150px; margin-bottom: 20px;">
                      <h1 style="color: #8A63D2;">Welcome to the Numour Family! 💜</h1>
                      <p>Hi ${validatedData.name},</p>
                      <p>We're so excited to welcome you to the Numour family! Thank you for joining us on this journey to redefine skincare in India.</p>
                      <div style="background-color: #F2EBFD; padding: 15px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="color: #8A63D2; margin-top: 0;">Here's what's next:</h3>
                        <ul style="list-style-type: none; padding-left: 0;">
                          <li style="margin-bottom: 10px;">✨ We'll review your application and get back to you soon</li>
                          <li style="margin-bottom: 10px;">🌱 You'll receive your first Numour products to try</li>
                          <li style="margin-bottom: 10px;">💌 We'll set you up with your unique affiliate link</li>
                        </ul>
                      </div>
                      <p>Thank you for joining us as we build something beautiful together!</p>
                      <p>With love,<br>The Numour Team</p>
                      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #D4C2F0; font-size: 12px; color: #666;">
                        <p>© ${new Date().getFullYear()} Numour. All rights reserved.</p>
                      </div>
                    </div>`
            }),
          });
        } catch (error) {
          console.error("Error sending welcome email:", error);
          // Continue processing even if email sending fails
        }
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
