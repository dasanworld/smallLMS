'use client';

import { useState } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { TopNav } from '@/components/top-nav';
import { useAuthenticatedRole } from '@/features/auth/hooks/useAuthenticatedRole';
import { User, Mail, Phone, Lock, Trash2, Save } from 'lucide-react';
import { useInstructorProfileQuery } from '@/features/instructor-submissions/hooks/useInstructorProfileQuery';

export default function InstructorProfilePage() {
  const { isLoading: roleLoading } = useAuthenticatedRole('instructor');
  const { user } = useCurrentUser();
  const { data: profile, isLoading: profileLoading, error: profileError } = useInstructorProfileQuery();
  
  const [formData, setFormData] = useState({
    name: String(''),
    phoneNumber: String(''),
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  if (roleLoading) {
    return null;
  }

  // 프로필 데이터 로딩 후 초기 폼값 설정
  if (profile && formData.name === '' && formData.phoneNumber === '') {
    setFormData({
      name: String(profile.name || ''),
      phoneNumber: String(profile.phone_number || ''),
      email: user?.email || '',
    });
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/instructor/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          phoneNumber: formData.phoneNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setIsEditing(false);
      alert('프로필이 업데이트되었습니다.');
    } catch (error) {
      alert('프로필 업데이트에 실패했습니다.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
      alert('비밀번호가 변경되었습니다.');
    } catch (error) {
      alert('비밀번호 변경에 실패했습니다.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <TopNav title="프로필 설정" />
        <div className="h-6" />

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                <User className="w-6 h-6" />
                기본 정보
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  편집
                </button>
              )}
            </div>

            <div className="space-y-4">
              {profileLoading && (
                <div className="bg-slate-50 border border-slate-200 rounded p-3 text-slate-600 text-sm">
                  프로필을 불러오는 중입니다...
                </div>
              )}
              {profileError && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 text-amber-800 text-sm">
                  프로필 정보를 불러오지 못했습니다.
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">이름</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  이메일
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50"
                />
                <p className="text-xs text-slate-500 mt-1">이메일은 변경할 수 없습니다.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  전화번호
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleFormChange}
                  disabled={!isEditing}
                  placeholder="010-0000-0000"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    저장
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    취소
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6" />
              보안
            </h2>

            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                비밀번호 변경
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">현재 비밀번호</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">새 비밀번호</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">새 비밀번호 확인</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleChangePassword}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                  >
                    변경
                  </button>
                  <button
                    onClick={() => setShowPasswordForm(false)}
                    className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-red-700 mb-6 flex items-center gap-2">
              <Trash2 className="w-6 h-6" />
              위험 구역
            </h2>
            <p className="text-sm text-red-600 mb-4">
              계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
            </p>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              계정 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
