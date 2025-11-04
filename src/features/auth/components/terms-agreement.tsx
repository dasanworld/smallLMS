'use client';

import { useState } from 'react';

type TermsAgreementProps = {
  onSubmit?: (agreed: boolean) => void;
  disabled?: boolean;
};

export function TermsAgreement({ onSubmit, disabled }: TermsAgreementProps) {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgreed(e.target.checked);
    if (e.target.checked) {
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      setError('약관에 동의해야 합니다');
      return;
    }

    onSubmit?.(true);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-slate-700">약관 동의</h3>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4 max-h-48 overflow-y-auto">
          <p className="text-xs text-slate-600 leading-relaxed">
            본 이용약관은 서비스 이용에 필요한 기본 규칙을 정하고 있습니다. 
            본 서비스를 이용함으로써 다음 약관에 동의하는 것으로 간주됩니다.
            <br />
            <br />
            1. 사용자는 본 서비스를 학습 목적으로만 이용해야 합니다.
            <br />
            2. 사용자는 타인의 저작권을 침해하는 콘텐츠를 업로드할 수 없습니다.
            <br />
            3. 본 서비스 운영자는 사용자의 행동으로 인한 피해에 책임을 지지 않습니다.
            <br />
            4. 운영자는 필요 시 서비스를 중단할 수 있으며, 사용자는 이에 동의합니다.
          </p>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={handleChange}
          disabled={disabled}
          className="h-4 w-4 cursor-pointer"
          aria-label="약관에 동의합니다"
        />
        <span className="text-sm text-slate-700">위 약관에 동의합니다 *</span>
      </label>

      {error && <p className="text-xs text-rose-500">{error}</p>}

      <button
        type="submit"
        disabled={disabled || !agreed}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        가입 완료
      </button>
    </form>
  );
}
