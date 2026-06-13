import 'dotenv/config';
import { connectDB } from './config/db';
import app from './app';

const PORT = process.env.PORT ?? 5000;

async function bootstrap(): Promise<void> {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`);
  });
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
