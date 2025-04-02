'use client';

import { Burger, Container, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './Navbar.module.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [opened, { toggle }] = useDisclosure(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };
    // Check session whenever URL changes (including logout redirect)
    checkSession();
  }, [pathname, supabase.auth]);

  return (
    <header className={classes.header}>
      <Container
        size='md'
        className={classes.inner}
      >
        <h1 className={classes.title}>ac4db</h1>
        <Group
          gap={5}
          visibleFrom='xs'
          className={classes.linkContainer}
        >
          <Link
            href={isLoggedIn ? '/profile' : '/login'}
            className={classes.link}
          >
            {isLoggedIn ? 'Profile' : 'Login'}
          </Link>
        </Group>

        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom='xs'
          size='sm'
        />
      </Container>
    </header>
  );
}
