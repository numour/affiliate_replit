import fetch from 'node-fetch';

// Type for EmailJS params
interface EmailJSParams {
  service_id: string;
  template_id: string;
  user_id: string;
  template_params: Record<string, any>;
}

/**
 * Send an email using EmailJS
 * @param params The EmailJS parameters
 * @returns Promise<boolean> - Success or failure
 */
export async function sendEmailJS(params: EmailJSParams): Promise<boolean> {
  try {
    console.log("Sending email via EmailJS");
    
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    console.log(`EmailJS response status: ${response.status}`);
    
    if (response.ok) {
      console.log('Email sent successfully via EmailJS');
      return true;
    } else {
      const responseText = await response.text();
      console.error('Failed to send email via EmailJS:', responseText);
      return false;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send a welcome email to a new affiliate
 * @param name Affiliate's name
 * @param email Affiliate's email address
 * @returns Promise<boolean> - Success or failure
 */
export async function sendWelcomeEmail(name: string, email: string): Promise<boolean> {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const userId = process.env.EMAILJS_USER_ID;
  
  if (!serviceId || !templateId || !userId) {
    console.log('Missing EmailJS credentials. Cannot send welcome email.');
    return false;
  }
  
  return sendEmailJS({
    service_id: serviceId,
    template_id: templateId,
    user_id: userId,
    template_params: {
      to_name: name,
      to_email: email,
      reply_to: 'hello@numour.com',
      message: `Welcome to the Numour family! We're excited to have you join us on this journey.
      
Here's what's next:
- We'll review your application and get back to you soon
- You'll receive your first Numour products to try
- We'll set you up with your unique affiliate link

Thank you for joining us as we redefine skincare in India!`
    }
  });
}

/**
 * Send a backup email when Google Sheets fails
 * @param affiliateData The affiliate data that needs to be manually added
 * @returns Promise<boolean> - Success or failure
 */
export async function sendBackupEmail(affiliateData: Record<string, any>): Promise<boolean> {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_BACKUP_TEMPLATE_ID;
  const userId = process.env.EMAILJS_USER_ID;
  
  if (!serviceId || !templateId || !userId) {
    console.log('Missing EmailJS credentials. Cannot send backup email.');
    return false;
  }
  
  const formattedData = Object.entries(affiliateData)
    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
    .join('\n');
  
  return sendEmailJS({
    service_id: serviceId,
    template_id: templateId,
    user_id: userId,
    template_params: {
      to_email: 'hanselenterprise@gmail.com',
      subject: '🚨 Backup: New Affiliate Registration Data',
      reply_to: 'hello@numour.com',
      message: `A new affiliate registration was received, but could not be saved to Google Sheets. Please add this data manually:

${formattedData}

This is an automated message from the Numour Affiliate Registration System.`
    }
  });
}