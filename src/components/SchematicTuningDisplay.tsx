'use client';

import { Accordion, List } from '@mantine/core';

type Tuning = Record<string, number>;

const SchematicTuningDisplay = ({ tuning }: { tuning: Tuning }) => {
  if (!tuning || Object.keys(tuning).length === 0) {
    return <p>No tuning data available.</p>;
  }

  return (
    <Accordion defaultValue='tuning'>
      <Accordion.Item value='tuning'>
        <Accordion.Control>Show Tuning</Accordion.Control>
        <Accordion.Panel>
          <List>
            {Object.entries(tuning).map(([key, value]) => (
              <List.Item key={key}>
                {key.replace(/_/g, ' ')}: {value}
              </List.Item>
            ))}
          </List>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default SchematicTuningDisplay;
