'use client';

import { Paper, Text, Box, Divider, Flex, Center } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import classes from './SchematicCard.module.css';

interface SchematicCardProps {
  schematicId: string;
  schematicName: string;
  authorName: string;
  imageUrl: string | null;
  createdAt: string;
  isSelected?: boolean;
}

const SchematicCard = ({
  schematicId,
  schematicName,
  authorName,
  imageUrl,
  createdAt,
}: SchematicCardProps) => {
  console.log('createdAt:', createdAt);
  const date = new Date(createdAt);

  // Helper to pad single digits with a leading zero
  const pad = (n: number) => n.toString().padStart(2, '0');

  const formatted = `${pad(date.getFullYear() % 100)}/${pad(
    date.getMonth() + 1
  )}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}:${pad(date.getSeconds())}`;

  return (
    <Link
      href={`/schematics/${schematicId}`}
      style={{ textDecoration: 'none' }}
    >
      <Box className={classes.outer}>
        <Box className={classes.inner}>
          <Flex
            direction={{
              base: 'column',
              md: 'row',
            }}
          >
            <Center className={classes.imageContainer}>
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={schematicName}
                  width={260}
                  height={130}
                />
              ) : (
                <Paper
                  withBorder
                  className={classes.placeholderImage}
                >
                  No Image
                </Paper>
              )}
            </Center>
            <Divider
              orientation='vertical'
              color='#808080'
            />
            <Flex
              direction='column'
              align='space-between'
              className={classes.textContainer}
            >
              <Flex
                align={'center'}
                className={classes.dateTimeContainer}
              >
                <Text
                  fw={400}
                  c={'gray'}
                  style={{
                    fontSize: 'max(2.3vw, 24px)',
                  }}
                >
                  {formatted}
                </Text>
              </Flex>
              <Divider color='#808080' />
              <Flex
                direction='row'
                justify='space-between'
                align='center'
                className={classes.namesContainer}
              >
                <Flex
                  align={'center'}
                  className={classes.titleContainer}
                >
                  <Text
                    fw={400}
                    c={'gray'}
                    style={{
                      fontSize: 'max(2.3vw, 24px)',
                    }}
                  >
                    {authorName}
                  </Text>
                </Flex>
                <Divider
                  orientation='vertical'
                  color='#808080'
                />
                <Flex
                  align={'center'}
                  className={classes.titleContainer}
                  style={{
                    marginLeft: '30px',
                  }}
                >
                  <Text
                    fw={400}
                    c={'gray'}
                    style={{
                      fontSize: 'max(2.3vw, 24px)',
                    }}
                  >
                    {schematicName}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Link>
  );
};

export default SchematicCard;
