import { Stack } from '@mantine/core';
import { loginWithDiscord, loginAnonymously } from './actions';

export default function LoginPage() {
  return (
    <form>
      <Stack>
        <button formAction={loginWithDiscord}>Login with Discord</button>
        <button formAction={loginAnonymously}>Continue as Guest</button>
      </Stack>
    </form>
  );
}
