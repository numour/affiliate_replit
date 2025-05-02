// Default API handler for Vercel
export default function handler(req, res) {
  res.status(200).json({
    message: 'Numour Affiliate API is running',
    endpoints: {
      health: '/api/health',
      affiliates: '/api/affiliates'
    },
    timestamp: new Date().toISOString()
  });
}