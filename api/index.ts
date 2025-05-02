// Vercel serverless function entry point
import express from 'express';
import { registerRoutes } from '../server/routes';
import { serveStatic } from '../server/vite';

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Log request and response
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// Set up routes and error handling
let isSetupComplete = false;

// Initialize once
async function setup() {
  if (isSetupComplete) return;
  
  try {
    await registerRoutes(app);
    
    // Serve static files in production
    if (process.env.NODE_ENV === 'production') {
      serveStatic(app);
    }
    
    // Error handler
    app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });
    
    isSetupComplete = true;
  } catch (error) {
    console.error('Error setting up Express app:', error);
    throw error;
  }
}

// Handler for Vercel serverless function
const handler = async (req: any, res: any) => {
  await setup();
  return app(req, res);
};

export default handler;