import { Button } from '@mantine/core';
import { signOut } from './actions';

export default function ProfilePage() {
  return (
    <div>
      <h1>Profile</h1>
      <p>This is the profile page.</p>
      <form action={signOut}>
        <Button type='submit'>Logout</Button>
      </form>
    </div>
  );
}
