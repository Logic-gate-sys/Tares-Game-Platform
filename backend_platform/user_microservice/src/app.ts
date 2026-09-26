import express from 'express';
import authRoutes from '#routes/auth';
import { docsMiddleware } from '#routes/docs';
import { errorHandler } from '#middlewares/error-handler';
import userRoutes from '#routes/users';
import { leaderboard } from '#controllers/users';

const app = express();

app.use((request, response, next) => {
  const origin = request.headers.origin;
  if (origin === 'http://localhost:5173' || origin === 'http://127.0.0.1:5173') {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  }
  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/auth', authRoutes);
app.use('/users', authRoutes);
app.use('/api/v1/users', userRoutes);
app.get('/api/v1/leaderboard', leaderboard);
app.use('/docs', ...docsMiddleware);
app.use(errorHandler);

export { app };
