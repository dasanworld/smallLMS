'use client';

import { useState } from 'react';
import {
  useMetadataQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateDifficultyMutation,
  useUpdateDifficultyMutation,
  useDeleteDifficultyMutation,
} from '../hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * 메타데이터 관리 컴포넌트
 * 카테고리와 난이도를 관리합니다 (생성, 수정, 삭제).
 */
export function MetadataManagement() {
  const { data, isLoading, error } = useMetadataQuery();
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();
  const createDifficultyMutation = useCreateDifficultyMutation();
  const updateDifficultyMutation = useUpdateDifficultyMutation();
  const deleteDifficultyMutation = useDeleteDifficultyMutation();
  const { toast } = useToast();

  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editingDifficulty, setEditingDifficulty] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newDifficultyName, setNewDifficultyName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editDifficultyName, setEditDifficultyName] = useState('');

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      await createCategoryMutation.mutateAsync(newCategoryName);
      setNewCategoryName('');
      toast({
        title: '성공',
        description: '카테고리가 추가되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '카테고리 추가 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCategory = async (categoryId: number) => {
    if (!editCategoryName.trim()) return;

    try {
      await updateCategoryMutation.mutateAsync({ categoryId, name: editCategoryName });
      setEditingCategory(null);
      setEditCategoryName('');
      toast({
        title: '성공',
        description: '카테고리가 수정되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '카테고리 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('정말 이 카테고리를 삭제하시겠습니까?')) return;

    try {
      await deleteCategoryMutation.mutateAsync(categoryId);
      toast({
        title: '성공',
        description: '카테고리가 삭제되었습니다.',
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.status === 409
          ? '사용 중인 카테고리는 삭제할 수 없습니다.'
          : '카테고리 삭제 중 오류가 발생했습니다.';
      toast({
        title: '오류',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleCreateDifficulty = async () => {
    if (!newDifficultyName.trim()) return;

    try {
      await createDifficultyMutation.mutateAsync(newDifficultyName);
      setNewDifficultyName('');
      toast({
        title: '성공',
        description: '난이도가 추가되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '난이도 추가 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateDifficulty = async (difficultyId: number) => {
    if (!editDifficultyName.trim()) return;

    try {
      await updateDifficultyMutation.mutateAsync({ difficultyId, name: editDifficultyName });
      setEditingDifficulty(null);
      setEditDifficultyName('');
      toast({
        title: '성공',
        description: '난이도가 수정되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류',
        description: '난이도 수정 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDifficulty = async (difficultyId: number) => {
    if (!confirm('정말 이 난이도를 삭제하시겠습니까?')) return;

    try {
      await deleteDifficultyMutation.mutateAsync(difficultyId);
      toast({
        title: '성공',
        description: '난이도가 삭제되었습니다.',
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.status === 409
          ? '사용 중인 난이도는 삭제할 수 없습니다.'
          : '난이도 삭제 중 오류가 발생했습니다.';
      toast({
        title: '오류',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <p>메타데이터를 불러오는 중 오류가 발생했습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 카테고리 관리 */}
      <Card>
        <CardHeader>
          <CardTitle>카테고리 관리</CardTitle>
          <CardDescription>코스 카테고리를 관리하세요</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 새 카테고리 추가 */}
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="새 카테고리 이름"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateCategory();
                }
              }}
            />
            <Button
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* 카테고리 목록 */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-slate-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {data?.categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-2 border rounded hover:bg-slate-50"
                >
                  {editingCategory === category.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateCategory(category.id);
                          }
                          if (e.key === 'Escape') {
                            setEditingCategory(null);
                            setEditCategoryName('');
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleUpdateCategory(category.id)}
                        disabled={updateCategoryMutation.isPending}
                      >
                        저장
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingCategory(null);
                          setEditCategoryName('');
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span>{category.name}</span>
                        {category.usageCount > 0 && (
                          <Badge variant="secondary">{category.usageCount}개 사용 중</Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCategory(category.id);
                            setEditCategoryName(category.name);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={deleteCategoryMutation.isPending || category.usageCount > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 난이도 관리 */}
      <Card>
        <CardHeader>
          <CardTitle>난이도 관리</CardTitle>
          <CardDescription>코스 난이도를 관리하세요</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 새 난이도 추가 */}
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="새 난이도 이름"
              value={newDifficultyName}
              onChange={(e) => setNewDifficultyName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateDifficulty();
                }
              }}
            />
            <Button
              onClick={handleCreateDifficulty}
              disabled={!newDifficultyName.trim() || createDifficultyMutation.isPending}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* 난이도 목록 */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-slate-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {data?.difficulties.map((difficulty) => (
                <div
                  key={difficulty.id}
                  className="flex items-center justify-between p-2 border rounded hover:bg-slate-50"
                >
                  {editingDifficulty === difficulty.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editDifficultyName}
                        onChange={(e) => setEditDifficultyName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateDifficulty(difficulty.id);
                          }
                          if (e.key === 'Escape') {
                            setEditingDifficulty(null);
                            setEditDifficultyName('');
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleUpdateDifficulty(difficulty.id)}
                        disabled={updateDifficultyMutation.isPending}
                      >
                        저장
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingDifficulty(null);
                          setEditDifficultyName('');
                        }}
                      >
                        취소
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span>{difficulty.name}</span>
                        {difficulty.usageCount > 0 && (
                          <Badge variant="secondary">{difficulty.usageCount}개 사용 중</Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingDifficulty(difficulty.id);
                            setEditDifficultyName(difficulty.name);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteDifficulty(difficulty.id)}
                          disabled={deleteDifficultyMutation.isPending || difficulty.usageCount > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



