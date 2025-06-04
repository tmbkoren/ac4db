'use client';

import { Card, Divider, Grid, Stack, Title, Tooltip, rem } from '@mantine/core';
import { SchematicTuning } from '@/utils/types/global.types';
import React from 'react';

const tuningSections: Record<string, Array<keyof SchematicTuning>> = {
  Capacity: ['load', 'en_output', 'en_capacity', 'kp_output'],
  Attack: [
    'maneuverability',
    'firing_stability',
    'aim_precision',
    'en_weapon_skill',
  ],
  Acquisition: [
    'lock_speed',
    'missile_lock_speed',
    'radar_refresh_rate',
    'ecm_resistance',
  ],
  'Primal Armor': [
    'rectification_head',
    'rectification_core',
    'rectification_arm',
    'rectification_leg',
  ],
  Boost: [
    'horizontal_thrust_main',
    'vertical_thrust',
    'horizontal_thrust_side',
    'horizontal_thrust_back',
  ],
  'Special Boost': [
    'quick_boost_main',
    'quick_boost_back',
    'quick_boost_side',
    'quick_boost_overed',
  ],
  Control: [
    'stability_head',
    'stability_core',
    'stability_legs',
    'turning_ability',
  ],
};

const SegmentBar = ({ value, label }: { value: number; label: string }) => {
  const totalSegments = 50;
  return (
    <Tooltip
      label={`${label}: ${value}`}
      withArrow
      events={{
        hover: true,
        touch: true,
        focus: false,
      }}
    >
      <div style={{ display: 'flex', gap: 1, cursor: 'pointer' }}>
        {Array.from({ length: totalSegments }, (_, idx) => (
          <div
            key={idx}
            style={{
              width: '6.8px',
              height: rem(12),
              backgroundColor: idx < value ? '#31c936' : 'transparent',
              border: '1px solid #6f6f6f',
            }}
          />
        ))}
      </div>
    </Tooltip>
  );
};

const Section = ({
  title,
  keys,
  tuning,
}: {
  title: string;
  keys: (keyof SchematicTuning)[];
  tuning: SchematicTuning;
}) => (
  <Card
    p='sm'
    bg={'#000000'}
    style={{ width: 'fit-content', maxWidth: '100%' }}
  >
    <Title
      order={3}
      fw={600}
      c={'#979797'}
    >
      {title.toUpperCase()}
    </Title>
    <Divider my='xs' />
    <Stack gap='xs'>
      {keys.map((key) => (
        <SegmentBar
          key={key}
          value={tuning[key]}
          label={key}
        />
      ))}
    </Stack>
  </Card>
);

const SchematicTuningDisplay = ({ tuning }: { tuning: SchematicTuning }) => {
  const leftColumnSections = Object.entries(tuningSections).slice(0, 4);
  const rightColumnSections = Object.entries(tuningSections).slice(4);

  return (
    <Grid gutter='md'>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Stack gap='0'>
          {leftColumnSections.map(([title, keys]) => (
            <Section
              key={title}
              title={title}
              keys={keys}
              tuning={tuning}
            />
          ))}
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Stack gap='0'>
          {rightColumnSections.map(([title, keys]) => (
            <Section
              key={title}
              title={title}
              keys={keys}
              tuning={tuning}
            />
          ))}
        </Stack>
      </Grid.Col>
    </Grid>
  );
};

export default SchematicTuningDisplay;
