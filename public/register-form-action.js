// AJAX submission handler for the static affiliate form
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
      
      // Direct Google Sheets submission and email sending via SMTP
      Promise.all([
        // 1. Try our Google Sheets API endpoint first 
        fetch('/api/google-sheets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Google Sheets API failed');
          }
          return response.json();
        })
        .catch(error => {
          console.error("Google Sheets API error:", error);
          
          // If that fails, try the direct webhook as fallback
          return fetch(googleWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            redirect: 'follow',
            mode: 'no-cors', // Bypass CORS issues  
            body: JSON.stringify(formData)
          }).catch(secondError => {
            console.error("Direct Google Sheets error:", secondError);
            
            // If both fail, send backup email
            return fetch('/api/direct-smtp', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                action: 'backup',
                data: formData
              })
            });
          });
        }),
        
        // 2. Send welcome email using our API
        fetch('/api/direct-smtp', {
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