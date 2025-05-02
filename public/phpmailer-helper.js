// Helper functions for sending emails directly from the browser
// using the SMTP server configured in the environment variables

/**
 * Send a welcome email to a new affiliate
 * @param {Object} formData - The affiliate form data
 * @returns {Promise} - A promise that resolves when the email is sent
 */
async function sendWelcomeEmail(formData) {
  try {
    // Create the email body content
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #6a4c93;">Welcome to the Numour Family! 🎉</h2>
        <p>Hello ${formData.name},</p>
        <p>We're thrilled to have you join our affiliate program! Your application has been successfully registered.</p>
        <p>Our team will review your information and get back to you shortly with the next steps.</p>
        <p>In the meantime, feel free to explore our product range and get familiar with what we offer.</p>
        <p>Best regards,<br>The Numour Team</p>
      </div>
    `;

    // Send the email using our Node API
    const response = await fetch('/api/standalone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'welcome',
        data: {
          name: formData.name,
          email: formData.email
        }
      })
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

/**
 * Send a backup email if Google Sheets fails
 * @param {Object} formData - The affiliate form data
 * @returns {Promise} - A promise that resolves when the email is sent
 */
async function sendBackupEmail(formData) {
  try {
    // Send the email using our Node API
    const response = await fetch('/api/standalone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'backup',
        data: formData
      })
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error sending backup email:', error);
    return false;
  }
}

/**
 * Submit form data to Google Sheets
 * @param {Object} formData - The affiliate form data
 * @returns {Promise} - A promise that resolves with the result
 */
async function submitToGoogleSheets(formData) {
  try {
    const response = await fetch(googleWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error submitting to Google Sheets:', error);
    return false;
  }
}