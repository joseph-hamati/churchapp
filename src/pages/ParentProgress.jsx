import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { useChurch } from '@/lib/churchContext';

export default function ParentProgress() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Progress" subtitle="Track your child's growth" />
      <div className="text-center py-16 text-muted-foreground px-5">
        <p className="text-4xl mb-3">📊</p>
        <p className="font-semibold">Progress tracking</p>
        <p className="text-sm mt-1">View your child's journey on the home page.</p>
      </div>
    </div>
  );
}