'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountSecurityRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/profile/security');
  }, [router]);

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center text-xs text-stone-500">
      Redirecting to Security Center...
    </div>
  );
}
