import type { Request, Response, NextFunction } from 'express';
import { WorkerService } from '../service/WorkerService.js';
import { UnauthorizedException } from '../exception/AppException.js';

const workerService = new WorkerService();

export interface AuthenticatedRequest extends Request {
  workerId?: number;
}

export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication required');
    }
    const token = header.slice(7);
    const { workerId } = workerService.verifyToken(token);
    req.workerId = workerId;
    next();
  } catch (err) {
    next(err);
  }
}
