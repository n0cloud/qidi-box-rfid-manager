export interface TagData {
  materialCode: number;
  colorCode: number;
  manufacturerCode: number;
  materialName: string;
  colorName: string;
  colorRgb: string;
  rawData: number[];
  // rawHex?: string;
}

export interface Material {
  code: number;
  name: string;
}

export interface Manufacturer {
  code: number;
  name: string;
}

export interface Color {
  code: number;
  name: string;
  rgb: string;
}

export interface NFCReadResult {
  success: boolean;
  data?: TagData;
  error?: string;
}

export interface NFCWriteResult {
  success: boolean;
  error?: string;
}
