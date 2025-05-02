# Deploying Numour Affiliate Registration to Vercel

This guide will help you deploy your Numour Affiliate Registration application to Vercel, which will provide reliable hosting and excellent performance.

## Prerequisites

1. [Create a Vercel account](https://vercel.com/signup) if you don't have one already
2. Install the Vercel CLI (optional, but useful for testing locally before deployment):
   ```
   npm install -g vercel
   ```

## Deployment Steps

### 1. Push your code to a GitHub repository

If you haven't already, create a GitHub repository and push your code there:

```bash
git init
git add .
git commit -m "Initial commit for Vercel deployment"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Connect your repository to Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure the project with these specific settings:
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Root Directory: `/` (leave default)

### 3. Set up Environment Variables (Critical)

In the Vercel deployment interface, add these environment variables before deploying:

| Name | Value | Description |
|------|-------|-------------|
| `SMTP_HOST` | `your-smtp-host` | Your SMTP server host (e.g., smtp.gmail.com) |
| `SMTP_PORT` | `587` or `465` | Your SMTP server port |
| `SMTP_USER` | `your-email@domain.com` | Your SMTP username/email |
| `SMTP_PASS` | `your-password` | Your SMTP password/app password |
| `SMTP_FROM_EMAIL` | `noreply@numour.com` | The email address emails are sent from |
| `GOOGLE_WEBHOOK_URL` | `your-webhook-url` | Google Sheets webhook URL for form submissions |
| `VERCEL` | `1` | Indicates the app is running on Vercel |
| `NODE_ENV` | `production` | Sets the node environment |

### 4. Deploy!

Click "Deploy" and Vercel will build and deploy your application. The first build may take a few minutes.

### 5. Verifying Your Deployment

After deployment:

1. Test the affiliate registration form
2. Check if welcome emails are being sent properly
3. Verify Google Sheets integration is working
4. Test the backup email system if Google Sheets fails

## Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| Build failures | Check the Vercel build logs for specific errors |
| Emails not sending | Verify SMTP credentials and ensure your SMTP provider allows connections from Vercel's IPs |
| Google Sheets integration failing | Check your webhook URL and make sure it's correctly configured |
| 500 errors | Check your server logs in the Vercel dashboard |

## Suggested Region for Deployment

In your vercel.json file, we've configured your app to deploy in the Mumbai region (`bom1`) for better performance in India. You can change this to another region if needed:

* `sfo1` (San Francisco)
* `iad1` (Washington DC)
* `bom1` (Mumbai)
* `sin1` (Singapore)

## Updating Your Deployment

Any push to the connected GitHub repository will automatically trigger a new deployment on Vercel.

## Using a Custom Domain

To use a custom domain (e.g., affiliates.numour.com):

1. Go to your project settings in Vercel
2. Navigate to the "Domains" tab
3. Add your domain and follow the verification steps
4. Update your DNS settings as instructed by Vercel

## Security Recommendations

1. Use secure SMTP credentials
2. Consider setting up Two-Factor Authentication for your Vercel account
3. Regularly rotate your SMTP password
4. Monitor your deployment logs for any unusual activity