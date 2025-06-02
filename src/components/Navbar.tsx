'use client';

import { Burger, Container, Drawer, Group, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './Navbar.module.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkSession();
  }, [pathname, supabase.auth]);

  return (
    <nav className={classes.header}>
      <Container
        size='md'
        className={classes.inner}
      >
        <Link href='/'>
          <h1 className={classes.title}>ac4db</h1>
        </Link>

        {/* Desktop Links */}
        <Group
          gap={5}
          visibleFrom='xs'
          className={classes.linkContainer}
        >
          {isLoggedIn && (
            <Link
              href='/upload'
              className={classes.link}
            >
              Upload
            </Link>
          )}
          <Link
            href={isLoggedIn ? '/profile' : '/login'}
            className={classes.link}
          >
            {isLoggedIn ? 'Profile' : 'Login'}
          </Link>
        </Group>

        {/* Burger for mobile */}
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom='xs'
          size='sm'
        />
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        position='top'
        opened={opened}
        onClose={close}
        title='ac4db'
        padding='md'
        size='xs'
        hiddenFrom='xs'
        zIndex={1001}
      >
        <Stack>
          {isLoggedIn && (
            <Link
              href='/upload'
              className={classes.link}
              onClick={close}
            >
              Upload
            </Link>
          )}
          <Link
            href={isLoggedIn ? '/profile' : '/login'}
            className={classes.link}
            onClick={close}
          >
            {isLoggedIn ? 'Profile' : 'Login'}
          </Link>
        </Stack>
      </Drawer>
    </nav>
  );
}
