'use client';

import { UserRole } from '@/lib/shared/user-types';

type RoleSelectorProps = {
  value: UserRole.Learner | UserRole.Instructor | '';
  onChange: (role: UserRole.Learner | UserRole.Instructor) => void;
  disabled?: boolean;
};

export function RoleSelector({ value, onChange, disabled }: RoleSelectorProps) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="text-sm font-medium text-slate-700">역할 선택 *</legend>
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="role"
            value={UserRole.Learner}
            checked={value === UserRole.Learner}
            onChange={(e) => onChange(e.target.value as UserRole.Learner)}
            disabled={disabled}
            className="h-4 w-4 cursor-pointer"
            aria-label="학습자 역할 선택"
          />
          <div className="flex-1">
            <div className="font-medium text-slate-700">학습자</div>
            <div className="text-xs text-slate-500">코스를 수강하고 과제를 제출합니다</div>
          </div>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            name="role"
            value={UserRole.Instructor}
            checked={value === UserRole.Instructor}
            onChange={(e) => onChange(e.target.value as UserRole.Instructor)}
            disabled={disabled}
            className="h-4 w-4 cursor-pointer"
            aria-label="강사 역할 선택"
          />
          <div className="flex-1">
            <div className="font-medium text-slate-700">강사</div>
            <div className="text-xs text-slate-500">코스를 개설하고 과제를 채점합니다</div>
          </div>
        </label>
      </div>
    </fieldset>
  );
}
