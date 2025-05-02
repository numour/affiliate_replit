// Dedicated function for Google Sheets integration
import fetch from 'node-fetch';

/**
 * Handler function for Google Sheets API requests
 * This is a standalone function that accepts JSON data and
 * submits it to the Google Sheets web app
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get the webhook URL from environment
    const googleWebhookUrl = process.env.GOOGLE_WEBHOOK_URL;
    
    if (!googleWebhookUrl) {
      return res.status(500).json({ 
        success: false, 
        message: 'Google Webhook URL not configured' 
      });
    }

    console.log('Received Google Sheets submission request');

    // Get the submitted data
    const formData = req.body;

    // Add timestamp if not present
    if (!formData.timestamp) {
      formData.timestamp = new Date().toISOString();
    }

    console.log('Submitting to Google Sheets:', JSON.stringify(formData));

    // Submit to Google Sheets with more robust configuration
    const response = await fetch(googleWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Numour-Affiliate-App'
      },
      redirect: 'follow',
      // Extend timeout for slow connections
      timeout: 8000,
      body: JSON.stringify(formData),
    });

    // Check the response
    if (response.ok) {
      console.log('Google Sheets submission successful');
      return res.status(200).json({ 
        success: true, 
        message: 'Data submitted to Google Sheets successfully' 
      });
    } else {
      const errorText = await response.text();
      console.error('Google Sheets submission failed:', errorText);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to submit data to Google Sheets',
        error: errorText 
      });
    }
  } catch (error) {
    console.error('Error submitting to Google Sheets:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}