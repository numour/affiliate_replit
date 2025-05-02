// Simple health check API endpoint for Vercel
export default function handler(req, res) {
  res.status(200).json({
    status: 'OK',
    environment: 'Vercel',
    timestamp: new Date().toISOString()
  });
}