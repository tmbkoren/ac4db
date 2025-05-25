'use client';

import { Accordion, List } from '@mantine/core';

const SchematicPartsDisplay = ({ parts }: { parts: any[] }) => {
  if (!parts || parts.length === 0) {
    return <p>No parts available.</p>;
  }

  return (
    <Accordion defaultValue='parts'>
      <Accordion.Item value='parts'>
        <Accordion.Control>Show Parts</Accordion.Control>
        <Accordion.Panel>
          <List>
            {parts.map((part, idx) => (
              <List.Item key={idx}>
                {part.category && `${part.category} - `}
                {part.part_name || 'Unnamed part'}
              </List.Item>
            ))}
          </List>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default SchematicPartsDisplay;
