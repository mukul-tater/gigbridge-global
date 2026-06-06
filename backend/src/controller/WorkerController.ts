import type { Request, Response, NextFunction } from 'express';
import { WorkerService } from '../service/WorkerService.js';
import {
  workerRegisterSchema,
  workerLoginSchema,
  formatZodErrors,
} from '../validation/workerValidation.js';
import { ValidationException } from '../exception/AppException.js';
import type { ApiSuccessResponseDto } from '../dto/WorkerDto.js';

const workerService = new WorkerService();

export class WorkerController {
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = workerRegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationException(formatZodErrors(parsed.error));
      }

      const result = await workerService.register(parsed.data);
      const body: ApiSuccessResponseDto<typeof result> = {
        success: true,
        data: result,
        message: 'Registration successful',
      };
      res.status(201).json(body);
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = workerLoginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationException(formatZodErrors(parsed.error));
      }

      const result = await workerService.login(parsed.data);
      const body: ApiSuccessResponseDto<typeof result> = {
        success: true,
        data: result,
        message: 'Login successful',
      };
      res.json(body);
    } catch (err) {
      next(err);
    }
  };

  getProfile = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        throw new ValidationException({ id: ['Invalid worker id'] });
      }

      const profile = workerService.getProfile(id);
      const body: ApiSuccessResponseDto<typeof profile> = {
        success: true,
        data: profile,
      };
      res.json(body);
    } catch (err) {
      next(err);
    }
  };

  getReferenceData = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = workerService.getReferenceData();
      const body: ApiSuccessResponseDto<typeof data> = {
        success: true,
        data,
      };
      res.json(body);
    } catch (err) {
      next(err);
    }
  };

  getDistricts = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const stateId = Number(req.params.stateId);
      if (Number.isNaN(stateId)) {
        throw new ValidationException({ stateId: ['Invalid state id'] });
      }

      const districts = workerService.getDistrictsByState(stateId);
      const body: ApiSuccessResponseDto<typeof districts> = {
        success: true,
        data: districts,
      };
      res.json(body);
    } catch (err) {
      next(err);
    }
  };
}

export const workerController = new WorkerController();
