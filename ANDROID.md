# Android Build Guide

## Prerequisites

- [Android Studio](https://developer.android.com/studio) (latest stable)
- Node.js 18+
- JDK 17+ (bundled with Android Studio)

## Project Setup (first time on a new machine)

1. Install dependencies:

```bash
npm install
```

2. Build the web app and sync to Android:

```bash
npm run build
npx cap sync
```

3. Open in Android Studio:

```bash
npx cap open android
```

4. Wait for Gradle sync to finish (happens automatically on first open).

5. Connect a device or start an emulator, then **Run > Run 'app'**.

## Development Workflow

After making changes to the web app (anything in `src/`):

```bash
npm run build && npx cap sync
```

Then rebuild from Android Studio (**Run > Run 'app'** or the green play button).

`npx cap sync` copies the built `dist/` into `android/app/src/main/assets/public` and syncs plugin configs. It does **not** touch native Java files or `AndroidManifest.xml`.

## Native Code Changes

Changes to files inside `android/` (Java, manifest, Gradle) do **not** require `npx cap sync`. Just rebuild from Android Studio.

Key native files:

| File | Purpose |
|------|---------|
| `android/app/src/main/java/.../MainActivity.java` | App entry point, WebView permission grants |
| `android/app/src/main/java/.../NativeAudioRecorderPlugin.java` | Native microphone recording (bypasses WebView getUserMedia) |
| `android/app/src/main/AndroidManifest.xml` | Permissions, activity config |
| `android/variables.gradle` | SDK versions, dependency versions |
| `android/app/build.gradle` | App-level build config |

## Building an APK

### Debug APK

From Android Studio: **Build > Generate App Bundles or APKs > Build APK(s)**

Or from the command line:

```bash
cd android
./gradlew assembleDebug
```

The APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`.

### Release APK (signed)

1. In Android Studio: **Build > Generate Signed App Bundle or APK...**
2. Create or select a keystore
3. Choose APK, select `release` build type
4. The signed APK will be in `android/app/build/outputs/apk/release/`

## Permissions

Declared in `android/app/src/main/AndroidManifest.xml`:

- `INTERNET` - required for Capacitor bridge
- `RECORD_AUDIO` - microphone access for audio recording

To add new permissions, edit the manifest directly (not managed by `cap sync`).

## Custom Capacitor Plugins

### NativeAudioRecorder

Uses Android's native `MediaRecorder` API instead of WebView's `getUserMedia` (which is unreliable on Samsung/Android WebView).

- **Java**: `NativeAudioRecorderPlugin.java` - exposes `start()` and `stop()` methods
- **JS bridge**: `useAudioRecorder.ts` - detects native vs web platform and picks the right recording path
- **Registration**: Plugin is registered in `MainActivity.onCreate()`

## Capacitor Config

`capacitor.config.ts` in the project root:

```typescript
const config: CapacitorConfig = {
  appId: 'com.cloudfrog.komunikator',
  appName: 'Komunikator',
  webDir: 'dist'
}
```

- `appId` - Android package name (must match `applicationId` in `build.gradle`)
- `webDir` - folder containing the built web app (Vite outputs to `dist`)

## Updating Capacitor

```bash
npm install @capacitor/core@latest @capacitor/android@latest
npm install -D @capacitor/cli@latest
npx cap sync
```

Then rebuild from Android Studio. Check the [Capacitor release notes](https://capacitorjs.com/docs/updating) for breaking changes.

## Updating Android Gradle Plugin (AGP)

When Android Studio shows "Project update recommended":

1. **File > Sync Project with Gradle Files** first
2. Then use the **AGP Upgrade Assistant** from the notification
3. This may also update the Gradle wrapper version

## Troubleshooting

**Gradle sync fails**: File > Invalidate Caches > Restart

**Web changes not showing**: Make sure you ran `npm run build && npx cap sync` before rebuilding

**Permission not working**: Permissions in `AndroidManifest.xml` must be edited manually. `npx cap sync` does not manage permissions.

**Microphone recording fails**: The app uses native `MediaRecorder` on Android. Check that `RECORD_AUDIO` permission is granted in the phone's app settings.
