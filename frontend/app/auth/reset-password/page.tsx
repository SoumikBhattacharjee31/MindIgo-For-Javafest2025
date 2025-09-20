import { Suspense } from 'react';
import ResetPasswordClient from '@/app/auth/reset-password/components/ResetPasswordClient';

// A simple loading component to show as a fallback
const LoadingFallback = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div>Loading...</div>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordClient />
    </Suspense>
  );
};

export default ResetPasswordPage;