import express from 'express';
import cors from 'cors';
import { workerController } from './controller/WorkerController.js';
import { workerOnboardingController } from './controller/WorkerOnboardingController.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import { errorHandler } from './exception/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, status: 'ok' });
  });

  app.get('/api/workers/reference-data', workerController.getReferenceData);
  app.get('/api/workers/districts/:stateId', workerController.getDistricts);
  app.post('/api/workers/register', workerController.register);
  app.post('/api/workers/login', workerController.login);
  app.get('/api/workers/profile/:id', workerController.getProfile);

  app.get('/api/workers/onboarding', authMiddleware, workerOnboardingController.getOnboarding);
  app.put('/api/workers/onboarding/step', authMiddleware, workerOnboardingController.saveStep);
  app.post('/api/workers/onboarding/complete', authMiddleware, workerOnboardingController.complete);

  app.use(errorHandler);

  return app;
}
