import SwiftUI

// The main library file that exposes the key views
// This allows the iOS app to import DailyFoodTracker and use these views

@available(iOS 15.0, *)
public struct FoodTrackingApp: View {
    public init() {}
    
    public var body: some View {
        TabView {
            DailyFoodLogView()
                .tabItem {
                    Image(systemName: "calendar.day.timeline.trailing")
                    Text("Today")
                }
            
            WeeklyView()
                .tabItem {
                    Image(systemName: "calendar")
                    Text("Weekly")
                }
        }
    }
}

// Public exports for use in apps
public typealias FoodEntry = DailyFoodTracker.FoodEntry
public typealias MealType = DailyFoodTracker.MealType
public typealias CreateFoodEntry = DailyFoodTracker.CreateFoodEntry
public typealias DayView = DailyFoodTracker.DayView
public typealias MacroTotals = DailyFoodTracker.MacroTotals
public typealias InflammationMetrics = DailyFoodTracker.InflammationMetrics
public typealias FitnessMetrics = DailyFoodTracker.FitnessMetrics
public typealias FoodTrackingService = DailyFoodTracker.FoodTrackingService

#if DEBUG
public struct FoodTrackingApp_Previews: PreviewProvider {
    public static var previews: some View {
        if #available(iOS 15.0, *) {
            FoodTrackingApp()
        } else {
            Text("Requires iOS 15.0+")
        }
    }
}
#endif