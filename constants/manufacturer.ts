import type { Manufacturer } from '@/types';

/**
 * Manufacturer codes for QIDI RFID tags
 * Based on official QIDI Wiki: https://wiki.qidi3d.com/en/QIDIBOX/RFID
 * 
 * The manufacturer code is stored in bit[2] of the RFID data
 * Default value from factory is 1 (QIDI)
 * Supports values 0-255 (1 byte)
 */
export const MANUFACTURERS: Manufacturer[] = [
  // { code: 0, name: "Unknown/Reserved" },
  { code: 1, name: "QIDI" },
  { code: 2, name: "Generic" },
];

export const getManufacturerByCode = (code: number): Manufacturer | undefined => {
  return MANUFACTURERS.find((m: Manufacturer) => m.code === code);
};

export const getManufacturerName = (code: number): string => {
  const manufacturer = getManufacturerByCode(code);
  return manufacturer ? manufacturer.name : `Unknown (${code})`;
};
