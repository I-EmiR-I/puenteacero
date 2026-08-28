import { Suspense } from 'react';
import { getCachedLoggedInUserClaims } from '@/rsc-data/supabase';
import { connection } from 'next/server';
import { UpdatePassword } from './UpdatePassword';

async function UpdatePasswordContent() {
  await connection();
  await getCachedLoggedInUserClaims();
  return <UpdatePassword />;
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdatePasswordContent />
    </Suspense>
  );
}
