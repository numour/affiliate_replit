// Test endpoint to troubleshoot Google Sheets integration
import fetch from 'node-fetch';

/**
 * Test function to diagnose Google Sheets integration issues
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export default async function handler(req, res) {
  try {
    // Get Google webhook URL from environment variables
    const googleWebhookUrl = process.env.GOOGLE_WEBHOOK_URL;
    
    if (!googleWebhookUrl) {
      return res.status(500).json({
        success: false,
        message: 'Google Webhook URL not configured in environment variables'
      });
    }
    
    console.log('Google Webhook URL:', googleWebhookUrl);
    
    // Create a simple test payload
    const testPayload = {
      name: 'TEST ENTRY',
      instagram: '@testaccount',
      phone: '1234567890',
      email: 'test@example.com',
      address: 'Test Address, Test City',
      timestamp: new Date().toISOString()
    };
    
    console.log('Sending test data to Google Sheets:', JSON.stringify(testPayload));
    
    // Send directly to Google Sheets
    const response = await fetch(googleWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      redirect: 'follow',
      body: JSON.stringify(testPayload)
    });
    
    // Get response details
    const responseStatus = response.status;
    const responseText = await response.text();
    
    console.log('Google Sheets response status:', responseStatus);
    console.log('Google Sheets response:', responseText);
    
    // Return detailed diagnostic information
    return res.status(200).json({
      success: response.ok,
      message: 'Test completed',
      details: {
        status: responseStatus,
        response: responseText,
        url: googleWebhookUrl.replace(/\/[^\/]+$/, '/***'), // Hide the actual ID for security
        requestPayload: testPayload
      }
    });
  } catch (error) {
    console.error('Error testing Google Sheets integration:', error);
    
    // Return error details
    return res.status(500).json({
      success: false,
      message: 'Error testing Google Sheets integration',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}