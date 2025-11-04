import { submissionFormSchema } from '@/lib/shared/submission-validation';
import type { ValidationRequestAgent, ValidationRequestResult } from './types';

export const createValidationRequestAgent = (): ValidationRequestAgent => ({
  async validate(request: {
    contentText: string;
    contentLink?: string;
  }): Promise<ValidationRequestResult> {
    console.log(`[ValidationRequestAgent] Validating submission request`);

    try {
      const trimmedRequest = {
        contentText: request.contentText?.trim() || '',
        contentLink: request.contentLink?.trim() || '',
      };

      const result = submissionFormSchema.safeParse({
        contentText: trimmedRequest.contentText,
        contentLink: trimmedRequest.contentLink || undefined,
      });

      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });

        console.log(`[ValidationRequestAgent] Validation failed:`, errors);
        return {
          isValid: false,
          errors,
        };
      }

      console.log(`[ValidationRequestAgent] Validation passed`);
      return {
        isValid: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[ValidationRequestAgent] Validation error:`, errorMessage);
      return {
        isValid: false,
        errors: {
          general: `Validation error: ${errorMessage}`,
        },
      };
    }
  },
});
