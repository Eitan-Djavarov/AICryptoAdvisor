import express, { Application } from 'express';
import cors, { type CorsOptions } from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://ai-crypto-advisor-client.vercel.app',
  process.env.CLIENT_URL,
].filter((origin): origin is string => Boolean(origin));

function isAllowedCorsOrigin(origin: string | undefined): boolean {
  if (!origin) {
    return true;
  }

  if (ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  if (origin.includes('localhost')) {
    return true;
  }

  if (origin.includes('vercel.app')) {
    return true;
  }

  return false;
}

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (isAllowedCorsOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use(errorHandler);

export default app;
