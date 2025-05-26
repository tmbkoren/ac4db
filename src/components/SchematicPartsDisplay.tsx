'use client';

import {
  Accordion,
  AccordionControl,
  AccordionItem,
  AccordionPanel,
  List,
} from '@mantine/core';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SchematicPartsDisplay = ({ parts }: { parts: any[] }) => {
  if (!parts || parts.length === 0) {
    return <p>No parts available.</p>;
  }

  return (
    <Accordion defaultValue='parts'>
      <AccordionItem value='parts'>
        <AccordionControl>Show Parts</AccordionControl>
        <AccordionPanel>
          <List>
            {parts.map((part, idx) => (
              <List.Item key={idx}>
                {part.category && `${part.category} - `}
                {part.part_name || 'Unnamed part'}
              </List.Item>
            ))}
          </List>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default SchematicPartsDisplay;
