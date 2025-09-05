'use client';

import { useSearchParams } from 'next/navigation';
import { confirmEmail } from '@/app/confirm-email/actions';

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  return (
    <div>
      <h1>Confirm your email</h1>
      <p>Click the button below to confirm your email address.</p>
      <form action={confirmEmail}>
        <input type="hidden" name="token_hash" value={token_hash ?? ''} />
        <input type="hidden" name="type" value={type ?? ''} />
        <button type="submit">Confirm Email</button>
      </form>
    </div>
  );
}