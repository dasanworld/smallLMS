'use client';

import { useState } from 'react';
import { User, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '../hooks/useProfile';

export function ProfileSection() {
  const { profile, isLoading, error, updateProfile, isUpdating } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phoneNumber: profile?.phoneNumber || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(
      {
        name: formData.name,
        phoneNumber: formData.phoneNumber || undefined,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            프로필
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-slate-200 rounded"></div>
            <div className="h-10 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            프로필
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">프로필을 불러올 수 없습니다</p>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            프로필 수정
          </CardTitle>
          <CardDescription>개인정보를 업데이트하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">이름</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="이름 입력"
                disabled={isUpdating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                <Phone className="w-4 h-4 inline mr-2" />
                전화번호
              </label>
              <Input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="01012345678"
                disabled={isUpdating}
              />
              <p className="text-xs text-slate-500 mt-1">예: 010-1234-5678 또는 0212345678</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700">
                {isUpdating ? '저장 중...' : '저장'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ name: profile.name, phoneNumber: profile.phoneNumber || '' });
                }}
                disabled={isUpdating}
              >
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              프로필
            </CardTitle>
            <CardDescription>계정 정보</CardDescription>
          </div>
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            수정
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            이메일
          </label>
          <p className="text-slate-900 mt-1">{profile.email}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600">이름</label>
          <p className="text-slate-900 mt-1">{profile.name}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            전화번호
          </label>
          <p className="text-slate-900 mt-1">{profile.phoneNumber || '미등록'}</p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600">가입일</label>
          <p className="text-slate-900 mt-1">{new Date(profile.createdAt).toLocaleDateString('ko-KR')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
