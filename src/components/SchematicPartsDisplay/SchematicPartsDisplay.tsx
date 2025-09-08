'use client';

import { SchematicParts } from '@/utils/types/global.types';
import {
  Accordion,
  AccordionControl,
  AccordionItem,
  AccordionPanel,
  List,
} from '@mantine/core';

const SchematicPartsDisplay = ({
  parts,
}: {
  parts: SchematicParts;
}) => {
  if (!parts || parts.length === 0) {
    return <p>No parts available.</p>;
  }

  return (
    <Accordion>
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
