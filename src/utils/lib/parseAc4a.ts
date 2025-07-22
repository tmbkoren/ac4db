import { Buffer } from 'buffer';

export type Part = {
  slot_name: string;
  part_id: string;
  part_name: string;
};

export type Tuning = Record<string, number>;

export type ParsedSchematic = {
  name: string;
  designer: string;
  timestamp: number;
  category: number;
  parts: Part[];
  tuning: Tuning;
};

const BLOCK_SIZE = 24280;
const NAME_SIZE = 96;

function readUtf16String(
  buffer: Buffer,
  offset: number,
  length: number
): string {
  const slice = buffer.subarray(offset, offset + length);
  const decoded = Buffer.from(slice).toString('utf16le');

  const nullTerminated = decoded.split('\0')[0];
  const match = nullTerminated.match(/^[A-Za-z0-9 _\-\.]+/);
  return match ? match[0].trim() : '<Invalid UTF-16 Encoding>';
}

export function parseSchematicHeader(
  buffer: Buffer
): { name: string; designer: string } {
  if (buffer.length < 1 + NAME_SIZE * 2) {
    throw new Error('Invalid .ac4a file: header is too small.');
  }
  const name = readUtf16String(buffer, 1, NAME_SIZE);
  const designer = readUtf16String(buffer, 1 + NAME_SIZE, NAME_SIZE);
  return { name, designer };
}

function readTimestamp(buffer: Buffer, offset: number): bigint {
  return buffer.readBigUInt64BE(offset);
}

function extractParts(
  buffer: Buffer,
  partMap: Record<string, Record<string, string>>
): Part[] {
  const LOCAL_PARTS_OFFSET = 0xd8;
  const PART_ENTRY_SIZE = 2;

  const lookupKeys = [
    'Head',
    'Core',
    'Arms',
    'Legs',
    'FCS',
    'Generator',
    'Main Booster',
    'Back Booster',
    'Side Booster',
    'Overed Booster',
    'Arm Unit',
    'Arm Unit',
    'Back Unit',
    'Back Unit',
    'Shoulder Unit',
  ];

  const displayLabels = [
    'Head',
    'Core',
    'Arms',
    'Legs',
    'FCS',
    'Generator',
    'Main Booster',
    'Back Booster',
    'Side Booster',
    'Overed Booster',
    'Right Arm Unit',
    'Left Arm Unit',
    'Right Back Unit',
    'Left Back Unit',
    'Shoulder Unit',
  ];

  return displayLabels.map((label, i) => {
    const offset = LOCAL_PARTS_OFFSET + i * PART_ENTRY_SIZE;
    const partId = buffer.readUInt16BE(offset).toString().padStart(4, '0');
    const category = lookupKeys[i];
    const partName = partMap?.[category]?.[partId] ?? `Unknown ID ${partId}`;
    return { slot_name: label, part_id: partId, part_name: partName };
  });
}

function extractTuning(buffer: Buffer): Tuning {
  const LOCAL_TUNING_OFFSET = 0x126;
  const tuningLabels = [
    'en_output',
    'en_capacity',
    'kp_output',
    'load',
    'en_weapon_skill',
    'maneuverability',
    'firing_stability',
    'aim_precision',
    'lock_speed',
    'missile_lock_speed',
    'radar_refresh_rate',
    'ecm_resistance',
    'rectification_head',
    'rectification_core',
    'rectification_arm',
    'rectification_leg',
    'horizontal_thrust_main',
    'vertical_thrust',
    'horizontal_thrust_side',
    'horizontal_thrust_back',
    'quick_boost_main',
    'quick_boost_side',
    'quick_boost_back',
    'quick_boost_overed',
    'turning_ability',
    'stability_head',
    'stability_core',
    'stability_legs',
  ];

  const tuning: Tuning = {};
  tuningLabels.forEach((label, i) => {
    tuning[label] = buffer[LOCAL_TUNING_OFFSET + i];
  });

  return tuning;
}

export function parseAc4aFile(
  buffer: Buffer,
  partMap: Record<string, Record<string, string>>
): ParsedSchematic {
  if (buffer.length < BLOCK_SIZE) {
    throw new Error('Invalid .ac4a file: too small.');
  }

  const { name, designer } = parseSchematicHeader(buffer);
  const timestamp = readTimestamp(buffer, 192);
  const categoryByte = buffer[200];
  const category = (categoryByte & 0b01111111) + 1;

  const parts = extractParts(buffer, partMap);
  const tuning = extractTuning(buffer);

  return {
    name,
    designer,
    timestamp: Number(timestamp),
    category,
    parts,
    tuning,
  };
}

