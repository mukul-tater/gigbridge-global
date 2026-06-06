import type { Response, NextFunction } from 'express';
import { WorkerOnboardingService } from '../service/WorkerOnboardingService.js';
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  onboardingStep3Schema,
  formatZodErrors,
} from '../validation/onboardingValidation.js';
import { ValidationException } from '../exception/AppException.js';
import type { ApiSuccessResponseDto } from '../dto/WorkerDto.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const onboardingService = new WorkerOnboardingService();

export class WorkerOnboardingController {
  getOnboarding = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const data = onboardingService.getOnboarding(req.workerId!);
      const body: ApiSuccessResponseDto<typeof data> = { success: true, data };
      res.json(body);
    } catch (err) {
      next(err);
    }
  };

  saveStep = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const step = Number(req.body?.step);
      if (step === 1) {
        const parsed = onboardingStep1Schema.safeParse(req.body);
        if (!parsed.success) throw new ValidationException(formatZodErrors(parsed.error));
        const data = onboardingService.saveStep(req.workerId!, parsed.data);
        res.json({ success: true, data, message: 'Step 1 saved' } satisfies ApiSuccessResponseDto<typeof data>);
        return;
      }
      if (step === 2) {
        const parsed = onboardingStep2Schema.safeParse(req.body);
        if (!parsed.success) throw new ValidationException(formatZodErrors(parsed.error));
        const data = onboardingService.saveStep(req.workerId!, parsed.data);
        res.json({ success: true, data, message: 'Step 2 saved' } satisfies ApiSuccessResponseDto<typeof data>);
        return;
      }
      throw new ValidationException({ step: ['Step must be 1 or 2. Use complete endpoint for step 3.'] });
    } catch (err) {
      next(err);
    }
  };

  complete = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const parsed = onboardingStep3Schema.safeParse({ ...req.body, step: 3 });
      if (!parsed.success) throw new ValidationException(formatZodErrors(parsed.error));

      const result = onboardingService.complete(req.workerId!, parsed.data);
      const body: ApiSuccessResponseDto<typeof result> = {
        success: true,
        data: result,
        message: 'Onboarding completed successfully',
      };
      res.json(body);
    } catch (err) {
      next(err);
    }
  };
}

export const workerOnboardingController = new WorkerOnboardingController();
