# Wenze Tii Ndaku 🏠

A marketplace mobile app built with Expo and React Native for connecting buyers and sellers in the DRC (Democratic Republic of Congo).

## Features

- 🛒 **Shopping Cart** - Add products, manage quantities
- 💳 **Checkout Flow** - Shipping, payment, and order confirmation
- 🔐 **Authentication** - Email and Google OAuth sign-in
- 🏪 **Stores & Categories** - Browse stores and product categories
- 🔍 **Search** - Find products easily

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Routing**: Expo Router (file-based)
- **State Management**: Zustand with AsyncStorage persistence
- **API Client**: TanStack React Query
- **TypeScript**: Full type safety
- **Styling**: React Native StyleSheet

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wenzetiindaku-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your values:
   ```dotenv
   EXPO_PUBLIC_API_BASE_URL=https://your-api-url.com/v1
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
   EXPO_PUBLIC_ENABLE_MOCK_DATA=true  # Set to false for production
   EXPO_PUBLIC_ENABLE_DEBUG_LOGS=true # Set to false for production
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

## Production Build

### EAS Build (Recommended)

1. **Configure EAS**
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```

2. **Set production environment variables in EAS**
   ```bash
   eas secret:create --name EXPO_PUBLIC_API_BASE_URL --value "https://api.wenzetiindaku.com/v1"
   # ... add all other secrets
   ```

3. **Build for production**
   ```bash
   # Android
   eas build --platform android --profile production
   
   # iOS
   eas build --platform ios --profile production
   ```

### Production Checklist

- [ ] Set `EXPO_PUBLIC_ENABLE_MOCK_DATA=false`
- [ ] Set `EXPO_PUBLIC_ENABLE_DEBUG_LOGS=false`
- [ ] Configure real API endpoint
- [ ] Set up Google OAuth credentials for production
- [ ] Update `app.json` version numbers
- [ ] Test on physical devices

## Project Structure

```
├── app/                    # File-based routing screens
│   ├── (tabs)/            # Tab navigation
│   ├── checkout/          # Checkout flow screens
│   └── ...
├── assets/                # Images, fonts, etc.
├── components/            # Reusable UI components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── src/
│   ├── api/              # API client and React Query hooks
│   ├── components/       # Screen-specific components
│   ├── config/           # Centralized configuration
│   └── theme/            # Design tokens and styles
└── ...
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_API_BASE_URL` | Backend API URL | Yes |
| `EXPO_PUBLIC_API_TIMEOUT` | Request timeout in ms | No (default: 30000) |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Web Client ID | Yes |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google OAuth iOS Client ID | Yes |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Google OAuth Android Client ID | Yes |
| `EXPO_PUBLIC_ENABLE_MOCK_DATA` | Use mock data instead of API | No (default: false) |
| `EXPO_PUBLIC_ENABLE_DEBUG_LOGS` | Enable debug logging | No (default: false) |
| `EXPO_PUBLIC_APP_ENV` | Environment: development/staging/production | No |

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npx tsc --noEmit` to check for type errors
4. Submit a pull request

## License

© 2024 Ccubenetvix Tech. All rights reserved.
