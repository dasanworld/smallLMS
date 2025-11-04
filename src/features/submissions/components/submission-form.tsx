'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { submissionFormSchema, type SubmissionFormInput } from '@/lib/shared/submission-validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface SubmissionFormProps {
  isLoading?: boolean;
  isSubmitting?: boolean;
  onSubmit: (data: SubmissionFormInput) => void | Promise<void>;
  disabled?: boolean;
  submitButtonText?: string;
}

export function SubmissionForm({
  isLoading = false,
  isSubmitting = false,
  onSubmit,
  disabled = false,
  submitButtonText = '제출',
}: SubmissionFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubmissionFormInput>({
    resolver: zodResolver(submissionFormSchema),
    mode: 'onChange',
  });

  const isProcessing = isLoading || isSubmitting;

  const handleFormSubmit = async (data: SubmissionFormInput) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="contentText" className="block text-sm font-medium text-slate-700">
          과제 내용 <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="contentText"
          placeholder="과제 내용을 입력하세요..."
          disabled={disabled || isProcessing}
          rows={8}
          className="resize-none"
          {...register('contentText')}
        />
        {errors.contentText && (
          <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errors.contentText.message}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="contentLink" className="block text-sm font-medium text-slate-700">
          첨부 링크 <span className="text-slate-400 text-xs">(선택사항)</span>
        </label>
        <Input
          id="contentLink"
          type="url"
          placeholder="https://example.com"
          disabled={disabled || isProcessing}
          {...register('contentLink')}
        />
        {errors.contentLink && (
          <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errors.contentLink.message}</span>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={disabled || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            처리 중...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            {submitButtonText}
          </>
        )}
      </Button>
    </form>
  );
}
