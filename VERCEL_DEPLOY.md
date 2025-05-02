# Deploying to Vercel

This guide will help you deploy your Numour Affiliate Registration application to Vercel.

## Prerequisites

1. [Create a Vercel account](https://vercel.com/signup) if you don't have one already
2. Install the Vercel CLI (optional, but useful for testing):
   ```
   npm install -g vercel
   ```

## Deployment Steps

### 1. Push your code to a GitHub repository

If you haven't already, push your code to a GitHub repository.

### 2. Connect your repository to Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure the project:
   - Framework Preset: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 3. Set up Environment Variables

Add the following environment variables in the Vercel dashboard:

- `SMTP_HOST`: Your SMTP server host
- `SMTP_PORT`: Your SMTP server port (usually 587 or 465)
- `SMTP_USER`: Your SMTP username/email
- `SMTP_PASS`: Your SMTP password
- `SMTP_FROM_EMAIL`: The email address to send from
- `GOOGLE_WEBHOOK_URL`: Your Google Sheets webhook URL
- `VERCEL`: Set to "1" to indicate running on Vercel

### 4. Deploy!

Click "Deploy" and Vercel will build and deploy your application.

## Troubleshooting

If you encounter any issues:

1. Check the Vercel build logs for errors
2. Verify all environment variables are correctly set
3. Make sure your SMTP settings are correct and the server allows connections from Vercel's IPs
4. Check that your Google Sheets webhook is accessible from Vercel

## Updating Your Deployment

Any push to your connected GitHub repository will automatically trigger a new deployment on Vercel.

## Custom Domain

To use a custom domain with your Vercel deployment:

1. Go to your project settings in Vercel
2. Navigate to the "Domains" tab
3. Add your domain and follow the verification steps