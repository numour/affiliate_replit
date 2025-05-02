// Simple AJAX submission handler for the static affiliate form
document.addEventListener('DOMContentLoaded', function() {
  const formStepTwo = document.getElementById('form-step-two');
  
  if (formStepTwo) {
    formStepTwo.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitButton = document.getElementById('submit-button');
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';
      
      // Collect form data
      const name = document.getElementById('name').value.trim();
      const instagram = document.getElementById('instagram').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('email').value.trim();
      const address = document.getElementById('address').value.trim();
      
      const formData = {
        name,
        instagram,
        phone,
        email,
        address,
        timestamp: new Date().toISOString()
      };
      
      // Direct Google Sheets submission and email sending via fetch to avoid Vercel timeout
      Promise.all([
        // 1. Submit to Google Sheets webhook directly
        fetch(googleWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }).catch(error => {
          console.error("Google Sheets error:", error);
          
          // Send backup email
          return fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              service_id: emailjsServiceId,
              template_id: emailjsBackupTemplateId,
              user_id: emailjsUserId,
              template_params: {
                name: formData.name,
                email: formData.email,
                instagram: formData.instagram,
                phone: formData.phone,
                address: formData.address,
                timestamp: formData.timestamp
              }
            })
          });
        }),
        
        // 2. Send welcome email via EmailJS directly
        fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            service_id: emailjsServiceId,
            template_id: emailjsTemplateId,
            user_id: emailjsUserId,
            template_params: {
              name: formData.name,
              email: formData.email,
              to_email: formData.email
            }
          })
        })
      ])
      .then(() => {
        // Display success UI
        document.getElementById('form-container').classList.add('hidden');
        document.getElementById('success-message').classList.remove('hidden');
        document.getElementById('user-name').textContent = formData.name;
      })
      .catch(error => {
        console.error('Error:', error);
        alert('There was an error submitting your application. Please try again later.');
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Application';
      });
    });
  }
});

// These values are loaded from config.js which should be included before this script