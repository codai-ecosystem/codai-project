# Progressive Web App (PWA) Implementation

This document describes the Progressive Web App (PWA) features of the METU
Template, how to customize them, and best practices for PWA development.

## Overview

The template includes a complete PWA implementation with the following features:

- **Offline Support**: Functions even without an internet connection
- **Installable**: Can be added to the home screen on mobile and desktop
- **Service Worker**: Caches assets and API responses for better performance and
  offline use
- **Push Notifications**: Integration with Firebase Cloud Messaging
- **Background Sync**: Ability to queue actions when offline and execute them
  when online
- **App Update Flow**: Seamless updates when new versions are deployed

## Architecture

The PWA implementation consists of:

1. **Service Worker (`public/sw.js`)**: Intercepts network requests, manages
   caching, and enables offline functionality
2. **Web App Manifest**: Configurations provided in both formats:
   - `public/manifest.json`: Traditional manifest format
   - `public/site.webmanifest`: Format preferred by Next.js 15
3. **PWAInstaller Component**: UI to install the app and show offline status
4. **PWAProvider**: Context provider for PWA features and service worker
   registration
5. **React Hooks**: Custom hooks for PWA functionality:
   - `usePWA`: For installation and online status
   - `useServiceWorker`: For service worker control and updates
   - `usePushNotifications`: For push notification management

## Setup and Configuration

### Basic Setup

The PWA features are automatically enabled in the template. The `PWAProvider` is
included in the application's provider tree in the root layout file
(`src/app/layout.tsx`), so you don't need to add it manually.

For development, PWA features work best in a production build:

```bash
# Build the app
pnpm build

# Serve the production build
pnpm start
```

When properly set up, your application should:

1. Be installable (you'll see an install prompt or button)
2. Work offline (with cached assets)
3. Show offline status indicators when the connection is lost
4. Update automatically when a new version is deployed

### PWA Management Scripts

The template includes specialized scripts to help manage PWA assets:

#### Manifest Synchronization

```bash
# Synchronize manifest.json with site.webmanifest
pnpm pwa:sync-manifests

# Validate manifests without synchronizing
pnpm pwa:sync-manifests -- --validate-only

# Fix common issues in manifests
pnpm pwa:sync-manifests -- --fix

# Create missing manifest files
pnpm pwa:sync-manifests -- --create-missing
```

This ensures that both manifest formats are kept in sync, as browsers look for
either `manifest.json` or `site.webmanifest`.

#### Icon Generation

```bash
# Generate all required PWA icons from SVG templates
pnpm pwa:icons

# Generate icons with a custom color
pnpm pwa:icons -- --color=#3b82f6

# Generate icons with background color
pnpm pwa:icons -- --background=#ffffff

# Force overwrite existing icons
pnpm pwa:icons -- --force

# Use placeholder icons (if ImageMagick is not available)
pnpm pwa:icons -- --use-fallback
```

## Customization

### Manifest Configuration

To customize the app's appearance when installed, edit the manifest files:

```json
{
  "name": "Your App Name",
  "short_name": "App",
  "description": "Your app description",
  "theme_color": "#your-color-code",
  "background_color": "#your-color-code",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "shortcuts": [
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "Go to dashboard",
      "url": "/dashboard"
    }
  ]
}
```

> **Important**: After editing manifests, run `pnpm pwa:sync-manifests` to
> ensure both files stay synchronized.

### Key Manifest Properties

- **name**: Full name of the application (displayed on install screen)
- **short_name**: Short name for app launchers and home screens
- **description**: Description of what the app does
- **start_url**: URL to load when the app is launched
- **display**: Display mode (`standalone`, `fullscreen`, `minimal-ui`,
  `browser`)
- **background_color**: Background color during splash screen
- **theme_color**: Theme color for browser UI elements
- **icons**: Array of app icons in different sizes
- **shortcuts**: Quick actions for the app (e.g., from context menu)
- **scope**: Navigation scope that remains in the PWA context

### Icons

The template requires several icon sizes for different devices and platforms.
Two SVG template icons are provided (`icon-192x192.svg` and `icon-512x512.svg`),
and these are used to generate PNG files in various sizes.

To generate all required icons:

```bash
# Generate all icons from SVG templates using ImageMagick
pnpm pwa:icons
```

The generated icons will be:

- `icon-72x72.png` (72×72)
- `icon-96x96.png` (96×96)
- `icon-128x128.png` (128×128)
- `icon-144x144.png` (144×144)
- `icon-152x152.png` (152×152)
- `icon-192x192.png` (192×192)
- `icon-384x384.png` (384×384)
- `icon-512x512.png` (512×512)

> **Note**: For best results, install ImageMagick on your system. The script
> will automatically detect and use it for high-quality icon generation. If
> ImageMagick is not available, the script will create simple placeholder icons.

### Service Worker

The service worker (`public/sw.js`) can be customized to change caching
strategies and behavior:

```javascript
// Resources to cache immediately
const STATIC_CACHE_URLS = [
  // Add URLs to cache on install
];

// Resources to cache on first access
const RUNTIME_CACHE_URLS = [
  // Add URLs to cache when accessed
];
```

### Using PWA Features in Components

#### Installation Banner

The PWA installation banner appears automatically when the app is eligible for
installation. You can also manually trigger it:

```tsx
import { usePWA } from '@/hooks/usePWA';

function MyComponent() {
  const { canInstall, install, isInstalling } = usePWA();

  if (canInstall) {
    return (
      <button onClick={() => void install()} disabled={isInstalling}>
        {isInstalling ? 'Installing...' : 'Install App'}
      </button>
    );
  }

  return null;
}
```

#### Push Notifications

You can request permission and subscribe to push notifications:

```tsx
import { usePushNotifications } from '@/hooks/usePWA';

function PushNotificationButton() {
  const { requestPermission, permission } = usePushNotifications();

  return (
    <button
      onClick={() => void requestPermission()}
      disabled={permission === 'granted'}
    >
      {permission === 'granted'
        ? 'Notifications Enabled'
        : 'Enable Notifications'}
    </button>
  );
}
```

## Testing

To test PWA features:

1. **Build the application**: `pnpm build`
2. **Serve the production build**: `pnpm start`
3. **Verify installation**: Open Chrome DevTools > Application > Manifest
4. **Test service worker**: Open Chrome DevTools > Application > Service Workers
5. **Test offline**: Disable network in DevTools and reload

## Troubleshooting

### Installation Banner Not Showing

- App must be served over HTTPS (except for localhost)
- App must have a valid web app manifest
- Service worker must be registered
- App must meet engagement heuristics (user interaction)

### Service Worker Not Registering

- Check browser console for errors
- Ensure sw.js is in the correct location
- Verify the scope is correct

### Offline Support Not Working

- Check that the service worker is properly caching assets
- Ensure the offline fallback page (`offline.html`) is properly configured
- Verify that the Cache API is being used correctly
- Check the Network tab in DevTools to see what requests are failing

## Advanced PWA Features

### Custom PWA Install Experience

You can create a custom installation UI by using the `usePWA` hook:

```tsx
import { Button } from '@/components/ui';
import { usePWA } from '@/hooks/usePWA';

export function CustomInstaller() {
  const { canInstall, install, isInstalling } = usePWA();

  if (!canInstall) {
    return null;
  }

  return (
    <div className="bg-primary text-primary-foreground rounded-lg p-4 shadow-lg">
      <h3 className="mb-2 text-lg font-bold">Install Our App</h3>
      <p className="mb-4">
        Install this app on your device for the best experience.
      </p>
      <Button
        onClick={() => void install()}
        disabled={isInstalling}
        variant="secondary"
        size="lg"
      >
        {isInstalling ? 'Installing...' : 'Install Now'}
      </Button>
    </div>
  );
}
```

### Service Worker Lifecycle Management

The `ServiceWorkerProvider` manages updates automatically. When a new service
worker is available:

1. A notification is shown to the user
2. The user can choose to update now or later
3. When updated, the new version is activated

To customize this behavior, you can modify the `ServiceWorkerProvider`
component.

### Background Sync

The service worker includes background sync functionality. This allows your app
to queue actions when offline and execute them when the connection is restored:

```typescript
// In your client-side code
if ('serviceWorker' in navigator && 'SyncManager' in window) {
  navigator.serviceWorker.ready.then(registration => {
    // Store data to be sent in IndexedDB
    saveToOfflineStore(data).then(() => {
      // Register for background sync
      return registration.sync.register('background-sync');
    });
  });
}
```

### Push Notifications

To implement push notifications:

1. Request permission using the `usePushNotifications` hook
2. Subscribe the user to push notifications
3. Store the subscription on your server
4. Send notifications from your server using the Firebase Cloud Messaging API

```tsx
import { usePushNotifications } from '@/hooks/usePWA';

function NotificationToggle() {
  const { isSupported, permission, requestPermission, subscribe, unsubscribe } =
    usePushNotifications();

  if (!isSupported) {
    return <p>Push notifications are not supported on this device.</p>;
  }

  const handleToggle = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (granted) {
        const subscription = await subscribe();
        // Send subscription to your server
        await saveSubscription(subscription);
      }
    } else {
      await unsubscribe();
      // Remove subscription from your server
      await removeSubscription();
    }
  };

  return (
    <Button onClick={handleToggle}>
      {permission === 'granted'
        ? 'Disable Notifications'
        : 'Enable Notifications'}
    </Button>
  );
}
```

## Best Practices

1. **Regular Testing**: Regularly test your PWA in production mode using
   Lighthouse in Chrome DevTools
2. **Offline Experience**: Design with offline-first principles
3. **Performance**: Keep the service worker lightweight
4. **Update Flow**: Implement a clear update mechanism for users
5. **App Shell**: Use an app shell architecture for faster loading
6. **Responsive Design**: Ensure your PWA works well on all screen sizes
7. **Cross-Browser Testing**: Test on multiple browsers and devices

## Resources

- [MDN Web Docs: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Documentation](https://web.dev/progressive-web-apps/)
- [Workbox](https://developers.google.com/web/tools/workbox/) - Libraries for
  adding offline support
- [PWA Builder](https://www.pwabuilder.com/) - Tool to build and validate PWAs
