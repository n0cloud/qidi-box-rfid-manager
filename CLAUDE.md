# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QIDI Box RFID Manager is a React Native mobile application built with Expo for reading and writing RFID tags on QIDI Box 3D printer filament spools. The app uses NFC to communicate with FM11RF08S chips (Mifare Classic compatible) on the filament tags.

## Development Commands

### Basic Development
```bash
pnpm install          # Install dependencies
pnpm start            # Start Expo development server
pnpm lint             # Run ESLint
```

### Platform-Specific Development
```bash
pnpm android          # Run on Android device/emulator
pnpm android:build    # Build Android app
pnpm android:release  # Build Android release APK
pnpm ios              # Run on iOS device/simulator
pnpm ios:build        # Build iOS app
pnpm web              # Run web version
```

### Native Build Management
```bash
pnpm prebuild         # Generate native directories (android/, ios/)
pnpm prebuild:clean   # Clean and regenerate native directories
```

**Important**: NFC functionality requires a physical Android device with NFC support (Android 12+ / API 31+). iOS also requires a physical device. The emulator/simulator cannot test NFC features.

## Architecture

### NFC Communication Flow

The app uses a dual-authentication approach to handle both factory-default and QIDI-configured tags:

1. **Authentication**: `nfcService.ts` tries two authentication keys sequentially:
   - Primary key: `0xD3F7D3F7D3F7` (QIDI custom key)
   - Fallback key: `0xFFFFFFFFFFFF` (factory default)

2. **Data Location**: All filament data is stored in Sector 1, Block 0 (Total Block #4)

3. **Data Format**: 3-byte structure stored in the first 3 bytes of the 16-byte block:
   - Byte 0: Material code (1-50, see `constants/materials.ts`)
   - Byte 1: Color code (1-24, see `constants/colors.ts`)
   - Byte 2: Manufacturer code (always 1 for QIDI)

4. **Write Verification**: After writing, the app reads back the block to verify data integrity (`nfcService.ts:115-125`)

### State Management Pattern

The app uses `reconnect.js` outlets for cross-component state management:

- **`androidPrompt` outlet**: Controls the NFC scanning UI overlay
  - Set by both tab screens before NFC operations
  - Consumed by `components/NfcPromptAndroid.tsx` to display the scanning prompt
  - Usage: Set `visible: true` before NFC operations, `visible: false` after completion

- **`tagData` outlet**: Shares scanned tag data across tabs
  - Set by Read tab when a tag is scanned
  - Updated by Write tab after successful write operations
  - Allows Write tab to access data scanned in Read tab

### UI Workflow

The app uses a two-tab interface with a sequential workflow:

**Read Tab** (`app/(tabs)/index.tsx`):
1. User taps "Scan Tag" button
2. NFC prompt appears, user holds phone near tag
3. Tag data is read and decoded
4. Data is stored in shared `tagData` outlet and displayed in a card
5. User switches to Write tab to modify the tag

**Write Tab** (`app/(tabs)/write.tsx`):
1. Displays "No Tag Scanned" message if no data in `tagData` outlet
2. Once tag is scanned, shows current tag data and two dropdowns
3. User selects new material and color (both required, validated before write)
4. User taps "Write to Tag" button
5. Confirmation alert appears with selected values
6. Upon confirmation, NFC prompt appears and tag is written
7. After successful write, `tagData` outlet is updated with new values (optimistic update, no re-scan)

### Path Aliases

The project uses `@/*` path alias (configured in `tsconfig.json`) for all imports:
```typescript
import nfcService from "@/services/nfcService";
import { MATERIALS } from "@/constants/materials";
import type { TagData } from "@/types";
```

### Theme Integration

React Native Paper provides theming throughout the app:
- Auto-detects system dark/light mode via `app.json` (`"userInterfaceStyle": "automatic"`)
- Theme colors accessed via `useTheme()` hook
- Custom theme configuration in `constants/theme.ts`

## Key Files

- `services/nfcService.ts` - NFC read/write operations, authentication, error handling
- `app/(tabs)/index.tsx` - Read tab: scan tags and display data
- `app/(tabs)/write.tsx` - Write tab: modify material/color selections and write to tags
- `app/(tabs)/_layout.tsx` - Tab navigation layout
- `constants/materials.ts` - 50 material type definitions with lookup functions
- `constants/colors.ts` - 24 color definitions with RGB values and lookup functions
- `types/index.ts` - TypeScript interfaces for TagData, NFCReadResult, NFCWriteResult
- `components/TagDataCard.tsx` - Displays decoded tag information
- `components/NfcPromptAndroid.tsx` - Android NFC scanning overlay (controlled by outlet)

## Important Constraints

### NFC Technical Details
- **Protocol**: ISO/IEC 14443-A (13.56 MHz)
- **Block Size**: 16 bytes per block
- **Write Format**: Always write full 16-byte block (unused bytes filled with 0x00)
- **Authentication Required**: Must authenticate before every read/write operation
- **Error Handling**: Always cancel technology request in finally block to prevent NFC session leaks

### React Native Specifics
- **New Architecture Enabled**: `app.json` has `"newArchEnabled": true`
- **React Compiler**: Experimental React compiler enabled in `app.json`
- **Typed Routes**: Expo Router typed routes enabled for type-safe navigation
- **Edge-to-Edge**: Android edge-to-edge mode enabled

### Material/Color Code Gaps
Not all codes 1-50 (materials) and 1-24 (colors) are defined - some are marked as "Unknown" or commented out in the constants files. When adding new codes, ensure they match QIDI's official specification.

## Building for Production

The app requires custom native code (react-native-nfc-manager plugin), so it cannot use Expo Go. Use local builds only:

1. **Generate native directories** (if not already present):
   ```bash
   pnpm prebuild
   ```

2. **Development Build**:
   ```bash
   pnpm android          # Build and run development build on connected device
   pnpm ios              # Build and run development build on iOS device
   ```

3. **Production Build**:
   ```bash
   pnpm android:release  # Build Android release APK (outputs to android/app/build/outputs/apk/release/)
   ```

   For iOS production builds, open `ios/qidirfid.xcworkspace` in Xcode and archive for distribution.

All builds require a physical device with NFC support to test functionality.

## Reference Documentation

Official RFID specifications: https://wiki.qidi3d.com/en/QIDIBOX/RFID
