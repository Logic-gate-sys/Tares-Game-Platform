import express from 'express';
import authRoutes from '#routes/auth';
import { docsMiddleware } from '#routes/docs';
import { errorHandler } from '#middlewares/error-handler';
import userRoutes from '#routes/users';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/docs', ...docsMiddleware);
app.use(errorHandler);

export { app };
