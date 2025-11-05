'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CourseDetailComponent } from '@/features/courses/components/course-detail';
import { EnrollmentButton } from '@/features/enrollments/components/enrollment-button';
import { useCourseQuery } from '@/features/courses/hooks/useCourses';
import { useEnrollmentStatusQuery, useCreateEnrollmentMutation, useCancelEnrollmentMutation } from '@/features/enrollments/hooks/useEnrollments';

type CourseDetailPageProps = {
  params: Promise<{ courseId: string }>;
};

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const router = useRouter();
  const [courseId, setCourseId] = useState(0);

  useEffect(() => {
    params.then((p) => {
      setCourseId(parseInt(p.courseId, 10) || 0);
    });
  }, [params]);

  const { data: course, isLoading: courseLoading } = useCourseQuery(courseId);
  const { data: enrollmentStatus } = useEnrollmentStatusQuery(courseId, courseId > 0);
  const { mutateAsync: createEnrollment } = useCreateEnrollmentMutation({
    onSuccess: () => {
      router.refresh();
    },
  });
  const { mutateAsync: cancelEnrollment } = useCancelEnrollmentMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const handleEnroll = async () => {
    try {
      await createEnrollment(courseId);
    } catch (error) {
      throw error instanceof Error ? error : new Error('수강신청에 실패했습니다');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelEnrollment(courseId);
    } catch (error) {
      throw error instanceof Error ? error : new Error('수강취소에 실패했습니다');
    }
  };

  if (courseLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="h-64 bg-slate-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-center text-slate-600">코스를 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <nav className="mb-6">
        <Link
          href="/courses"
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          ← 코스 목록으로 돌아가기
        </Link>
      </nav>

      <CourseDetailComponent course={course}>
        <EnrollmentButton
          courseId={courseId}
          isEnrolled={enrollmentStatus?.isEnrolled || false}
          onEnroll={handleEnroll}
          onCancel={handleCancel}
        />
      </CourseDetailComponent>
    </div>
  );
}
