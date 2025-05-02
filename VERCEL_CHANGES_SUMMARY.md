# Vercel Deployment Changes Summary

## Deployment Structure
- **API Functions**: Using standalone JavaScript files in the `/api` folder
- **Static Content**: HTML, CSS, and assets in the `/public` folder
- **Build Process**: Bypassed traditional build process with a custom script

## Key Files
- `/api/health.js` - Health check endpoint
- `/api/index.js` - Default API route
- `/api/affiliates.js` - Affiliate registration handler
- `/public/index.html` - Main landing page
- `/public/verification.html` - Deployment verification page
- `/vercel.json` - Deployment configuration
- `/vercel-build.sh` - Custom build script

## How It Works
1. The API endpoints are implemented as individual serverless functions
2. Each function is completely self-contained with no external dependencies
3. Static files are served directly from the `/public` directory
4. The build process is intentionally bypassed to avoid Node.js compilation issues

## Verification Process
1. After deployment, visit `/verify` to check if static files are being served
2. Click "Test API" to verify API health check is working
3. If both work, the full application should be functioning correctly

## Troubleshooting
If deployment fails:
1. Check Vercel logs for specific error messages
2. Confirm environment variables are set correctly
3. Verify file paths in vercel.json match actual file structure

## Environment Variables Required
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `SMTP_FROM_EMAIL` - Sender email address
- `GOOGLE_WEBHOOK_URL` - Google Sheets integration webhook