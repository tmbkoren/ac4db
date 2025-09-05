import { confirmEmail } from '@/app/confirm-email/actions';

export default function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: { token_hash: string; type: string };
}) {
  return (
    <div>
      <h1>Confirm your email</h1>
      <p>Click the button below to confirm your email address.</p>
      <form action={confirmEmail}>
        <input
          type="hidden"
          name="token_hash"
          value={searchParams.token_hash}
        />
        <input type="hidden" name="type" value={searchParams.type} />
        <button type="submit">Confirm Email</button>
      </form>
    </div>
  );
}