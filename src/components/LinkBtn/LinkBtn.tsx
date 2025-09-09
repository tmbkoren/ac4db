import { Box, Flex, Text } from '@mantine/core';
import Link from 'next/link';
import classes from './LinkBtn.module.css';

interface LinkBtnProps {
  href: string;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

const LinkBtn = ({ href, children, size = 'md' }: LinkBtnProps) => {
  const fontSizeMap = {
    sm: 'max(1.3vw, 14px)',
    md: 'max(2vw, 20px)',
    lg: 'max(2.5vw, 24px)',
  };
  return (
    <Link
      href={href}
      style={{ textDecoration: 'none' }}
    >
      <Box className={classes.outer}>
        <Flex
          className={classes.inner}
          justify='center'
          align='center'
        >
          <Text
            fw={400}
            c={'#a5a5a5'}
            style={{
              fontSize: fontSizeMap[size],
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
