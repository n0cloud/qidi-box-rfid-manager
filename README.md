# QIDI Box RFID Manager

A React Native mobile application for reading and writing RFID tags for QIDI Box 3D printer filaments.

## Features

- **Read RFID Tags**: Scan and decode QIDI Box filament RFID tags
- **Display Tag Information**: View material type, color, manufacturer, and raw data
- **Write to Tags**: Select material and color from dropdowns and write to tags
- **Material Support**: All 50 QIDI filament types (PLA, ABS, PETG, TPU, PA, etc.)
- **Color Support**: All 24 color codes with visual previews
- **Dark Mode**: Automatic system theme detection
- **Authentication**: Supports both primary and fallback authentication keys

## Technical Details

### RFID Specifications
- **Chip**: FM11RF08S (Mifare Classic compatible)
- **Protocol**: ISO/IEC 14443-A
- **Frequency**: 13.56 MHz
- **Data Location**: Sector 1, Block 0 (Total Block #4)
- **Data Format**: 3 bytes (Material Code, Color Code, Manufacturer Code)

### Authentication Keys
- Primary: `0xD3F7D3F7D3F7`
- Fallback: `0xFFFFFFFFFFFF` (factory default)

## Prerequisites

- Node.js 18+ and pnpm
- Android device with NFC support (Android 12+ / API 31+)
- Physical device required (NFC cannot be tested on emulator)

## Installation

Currently working on uploading the app to the Google Play Store.


## Usage

### Reading a Tag
1. Tap "Scan Tag" button
2. Hold your phone near the RFID tag
3. View the decoded tag information

### Writing to a Tag
1. First, scan a tag to read its current data
2. Select the desired material type from the dropdown
3. Select the desired color from the dropdown (with color preview)
4. Tap "Write to Tag" button
5. Hold your phone near the RFID tag to write

## Technologies

- **Expo** - React Native framework
- **react-native-nfc-manager** - NFC functionality
- **React Native Paper** - Material Design UI components
- **TypeScript** - Type safety
- **Expo Router** - File-based routing

## Build for Production

```bash
pnpm android:release
```

## Development

### Local Development
```bash
pnpm android          # Run on connected device using local build
```

### Development Build (EAS Cloud)
```bash
pnpm android:build    # Build development APK using EAS Build
```

### Platform-Specific Commands
```bash
pnpm prebuild         # Generate native directories
pnpm prebuild:clean   # Clean and regenerate native directories
pnpm lint             # Run ESLint
```

## License

GPL-3.0

## Credits

Based on QIDI Box RFID specifications from [QIDI Wiki](https://wiki.qidi3d.com/en/QIDIBOX/RFID)
