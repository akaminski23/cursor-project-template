# Daily Food Tracker - Android App

Android implementation of the Daily Food Tracker using Jetpack Compose, matching the iOS app functionality.

## Features

This Android app provides feature parity with the iOS version:

### Daily Food Log
- **Meal Cards**: Organized by Breakfast, Lunch, Dinner, Snack
- **Add/Edit Foods**: Modal with nutrition entry and food search
- **Barcode Scanner**: Stub implementation with integration points
- **Macro Totals**: Daily calories, protein, fat, carbs display
- **Inflammation Scoring**: Visual indicators for food inflammation scores

### Weekly View  
- **Trends Chart**: Inflammation score over time
- **Calorie Charts**: Daily intake visualization  
- **Weekly Averages**: Summary statistics
- **Day Navigation**: Previous/next week controls

### Technical Features
- **API Integration**: REST calls to Next.js backend
- **Error States**: Network error handling and user feedback
- **Loading States**: Progress indicators during data fetching
- **Pull to Refresh**: Swipe down to reload data
- **Offline Handling**: Graceful degradation when offline

## Technology Stack

- **Jetpack Compose**: Modern Android UI toolkit
- **Material Design 3**: Consistent design system
- **Navigation Compose**: Type-safe navigation
- **ViewModel**: State management and lifecycle
- **Retrofit**: HTTP client for API calls
- **Kotlin Coroutines**: Async programming
- **ZXing**: Barcode scanning library

## Project Structure

```
apps/android/
├── app/
│   ├── src/main/java/com/kaminskiperformance/foodtracker/
│   │   ├── ui/
│   │   │   ├── daily/          # Daily food log screens
│   │   │   ├── weekly/         # Weekly trends screens  
│   │   │   ├── add/            # Add/edit food modals
│   │   │   └── theme/          # Material Design theme
│   │   ├── data/
│   │   │   ├── api/            # API service interfaces
│   │   │   ├── models/         # Data models (matching iOS)
│   │   │   └── repository/     # Data repository pattern
│   │   └── MainActivity.kt
│   └── build.gradle
├── build.gradle
└── README.md
```

## Setup Instructions

1. **Prerequisites**:
   - Android Studio Arctic Fox or later
   - Android SDK API 24+ (Android 7.0)
   - Kotlin 1.8.20+

2. **Clone and Setup**:
   ```bash
   cd apps/android
   ./gradlew build
   ```

3. **Run Backend**: 
   Ensure the Next.js API server is running:
   ```bash
   cd ../../apps/web
   npm run dev
   ```

4. **Configure API Base URL**:
   Update the base URL in `data/api/FoodTrackingApi.kt`:
   ```kotlin
   private const val BASE_URL = "http://10.0.2.2:3000/api/food/"  // Android emulator
   // or
   private const val BASE_URL = "http://localhost:3000/api/food/"  // Physical device
   ```

5. **Build and Run**:
   ```bash
   ./gradlew assembleDebug
   ./gradlew installDebug
   ```

## Design Consistency with iOS

This Android app maintains visual and UX parity with the iOS version:

### Layout Patterns
- **Card-based UI**: Same meal section cards and food entry cards
- **Tab Navigation**: Bottom navigation matching iOS tab bar
- **Color Scheme**: Equivalent colors for inflammation scores, macros
- **Typography**: Material Design typography matching iOS font weights

### Interaction Patterns  
- **Pull to Refresh**: Same gesture as iOS
- **Modal Presentations**: Bottom sheets for add/edit food
- **Navigation**: Back button behavior matching iOS
- **Error Handling**: Same error messages and retry patterns

### Data Flow
- **Same API Endpoints**: Identical backend integration
- **Same Models**: Data structures match iOS implementation
- **Same Business Logic**: Inflammation scoring, macro calculations

## Integration Points

### Barcode Scanning
Current implementation includes stub with integration points for:
- **ZXing Library**: Ready for camera-based scanning
- **ML Kit**: Alternative barcode detection
- **Food Database**: Open Food Facts API integration

### Fitness Data
Ready for integration with:
- **Google Fit API**: Android fitness data
- **Samsung Health**: Alternative fitness platform
- **Manual Entry**: Fallback input method

## Testing

- **Unit Tests**: ViewModel and repository logic
- **UI Tests**: Compose testing for screens
- **Integration Tests**: API service testing
- **Manual Testing**: Cross-platform feature validation

## Build Variants

- **Debug**: Development with logging enabled
- **Release**: Production build with ProGuard
- **Staging**: Testing against staging backend

## Performance Considerations

- **Lazy Loading**: Efficient list rendering with LazyColumn
- **Image Caching**: Food image loading and caching
- **Memory Management**: Proper ViewModel lifecycle
- **Network Efficiency**: Request batching and caching

This Android implementation provides a native, performant alternative to the iOS app while maintaining feature parity and design consistency.