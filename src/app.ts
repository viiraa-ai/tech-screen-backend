import express from 'express';
import healthRouter from './routes/health.js';
import messagesRouter from './routes/messages.js';

export const app = express();
app.use(express.json());

app.use(healthRouter);
app.use(messagesRouter);
