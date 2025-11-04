'use client';

import { useCallback, useState } from 'react';

export type ProfileFormValues = {
  name: string;
  phoneNumber: string;
};

type ProfileFormProps = {
  onSubmit?: (values: ProfileFormValues) => void;
  disabled?: boolean;
};

export function ProfileForm({ onSubmit, disabled }: ProfileFormProps) {
  const [values, setValues] = useState<ProfileFormValues>({
    name: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<Partial<ProfileFormValues>>({});

  const validateField = useCallback((field: keyof ProfileFormValues, value: string) => {
    const newErrors = { ...errors };

    if (field === 'name') {
      if (!value.trim()) {
        newErrors.name = '이름은 필수입니다';
      } else if (value.trim().length < 2) {
        newErrors.name = '이름은 최소 2자 이상이어야 합니다';
      } else {
        delete newErrors.name;
      }
    }

    if (field === 'phoneNumber' && value) {
      const phoneRegex = /^\d{10,}$/;
      if (!phoneRegex.test(value.replace(/[-\s]/g, ''))) {
        newErrors.phoneNumber = '유효한 휴대폰번호를 입력해주세요';
      } else {
        delete newErrors.phoneNumber;
      }
    } else if (field === 'phoneNumber' && !value) {
      delete newErrors.phoneNumber;
    }

    setErrors(newErrors);
  }, [errors]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const field = name as keyof ProfileFormValues;
      setValues((prev) => ({ ...prev, [field]: value }));
      validateField(field, value);
    },
    [validateField]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      validateField('name', values.name);
      if (values.phoneNumber) {
        validateField('phoneNumber', values.phoneNumber);
      }

      if (!errors.name && !errors.phoneNumber && values.name.trim()) {
        onSubmit?.(values);
      }
    },
    [values, errors, validateField, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
          이름 *
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value={values.name}
          onChange={handleChange}
          disabled={disabled}
          placeholder="이름을 입력해주세요"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
          required
        />
        {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700 mb-2">
          휴대폰번호
        </label>
        <input
          id="phoneNumber"
          type="tel"
          name="phoneNumber"
          value={values.phoneNumber}
          onChange={handleChange}
          disabled={disabled}
          placeholder="휴대폰번호를 입력해주세요 (선택사항)"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
        />
        {errors.phoneNumber && <p className="mt-1 text-xs text-rose-500">{errors.phoneNumber}</p>}
      </div>

      <button
        type="submit"
        disabled={disabled || !values.name.trim()}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        다음
      </button>
    </form>
  );
}
