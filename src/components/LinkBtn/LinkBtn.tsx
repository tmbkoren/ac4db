import { Box, Flex, Text } from '@mantine/core';
import Link from 'next/link';
import classes from './LinkBtn.module.css';

interface LinkBtnProps {
  href: string;
  children?: React.ReactNode;
}

const LinkBtn = ({ href, children }: LinkBtnProps) => {
  return (
    <Link
      href={href}
      style={{ textDecoration: 'none' }}
    >
      <Box className={classes.outer}>
        <Flex className={classes.inner} justify="center" align="center">
          <Text
            fw={400}
            c={'#a5a5a5'}
            style={{
              fontSize: 'max(2vw, 20px)',
            }}
          >
            {children || 'LinkBtn'}
          </Text>
        </Flex>
      </Box>
    </Link>
  );
};

export default LinkBtn;
