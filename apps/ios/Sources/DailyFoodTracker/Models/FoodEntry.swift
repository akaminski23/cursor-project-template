import Foundation

// MARK: - Core Models
struct FoodEntry: Codable, Identifiable, Equatable {
    let id: String
    let name: String
    let brand: String?
    let barcode: String?
    let quantity: Double
    let unit: String
    let mealType: MealType
    let consumedAt: Date
    
    // Per 100g/ml values
    let caloriesPer100: Double
    let proteinPer100: Double
    let fatPer100: Double
    let carbsPer100: Double
    let fiberPer100: Double?
    let sugarPer100: Double?
    let sodiumPer100: Double?
    
    // Calculated totals
    let totalCalories: Double
    let totalProtein: Double
    let totalFat: Double
    let totalCarbs: Double
    let totalFiber: Double?
    let totalSugar: Double?
    let totalSodium: Double?
    
    let inflammationScore: Double?
    let createdAt: Date
    let updatedAt: Date
}

enum MealType: String, CaseIterable, Codable {
    case breakfast = "breakfast"
    case lunch = "lunch"
    case dinner = "dinner"
    case snack = "snack"
    
    var displayName: String {
        switch self {
        case .breakfast: return "Breakfast"
        case .lunch: return "Lunch"
        case .dinner: return "Dinner"
        case .snack: return "Snack"
        }
    }
    
    var emoji: String {
        switch self {
        case .breakfast: return "🌅"
        case .lunch: return "☀️"
        case .dinner: return "🌙"
        case .snack: return "🍎"
        }
    }
}

enum Unit: String, CaseIterable, Codable {
    case g = "g"
    case ml = "ml"
    case cup = "cup"
    case piece = "piece"
    case oz = "oz"
    case tbsp = "tbsp"
    case tsp = "tsp"
    
    var displayName: String {
        switch self {
        case .g: return "grams"
        case .ml: return "milliliters"
        case .cup: return "cup(s)"
        case .piece: return "piece(s)"
        case .oz: return "ounce(s)"
        case .tbsp: return "tablespoon(s)"
        case .tsp: return "teaspoon(s)"
        }
    }
}

// MARK: - Create/Update Models
struct CreateFoodEntry: Codable {
    let name: String
    let brand: String?
    let barcode: String?
    let quantity: Double
    let unit: String
    let mealType: String
    let consumedAt: Date?
    
    // Per 100g/ml values
    let caloriesPer100: Double
    let proteinPer100: Double
    let fatPer100: Double
    let carbsPer100: Double
    let fiberPer100: Double?
    let sugarPer100: Double?
    let sodiumPer100: Double?
    
    // Calculated nutrition totals
    var totalCalories: Double { (quantity / 100) * caloriesPer100 }
    var totalProtein: Double { (quantity / 100) * proteinPer100 }
    var totalFat: Double { (quantity / 100) * fatPer100 }
    var totalCarbs: Double { (quantity / 100) * carbsPer100 }
    var totalFiber: Double? { 
        guard let fiber = fiberPer100 else { return nil }
        return (quantity / 100) * fiber 
    }
    var totalSugar: Double? { 
        guard let sugar = sugarPer100 else { return nil }
        return (quantity / 100) * sugar 
    }
    var totalSodium: Double? { 
        guard let sodium = sodiumPer100 else { return nil }
        return (quantity / 100) * sodium 
    }
}

// MARK: - Daily Summary Models
struct MacroTotals: Codable {
    let totalCalories: Double
    let totalProtein: Double
    let totalFat: Double
    let totalCarbs: Double
    let totalFiber: Double
    let totalSugar: Double
    let totalSodium: Double
    let breakfastCalories: Double
    let lunchCalories: Double
    let dinnerCalories: Double
    let snackCalories: Double
}

struct InflammationMetrics: Codable {
    let dailyScore: Double
    let foodCount: Int
    let mealScores: MealScores
    
    struct MealScores: Codable {
        let breakfast: Double?
        let lunch: Double?
        let dinner: Double?
        let snack: Double?
    }
}

struct FitnessMetrics: Codable {
    let steps: Int?
    let caloriesBurned: Double?
    let activeMinutes: Int?
    let source: String?
}

struct DayView: Codable {
    let date: String
    let foodEntries: [FoodEntry]
    let macroTotals: MacroTotals
    let inflammationMetrics: InflammationMetrics
    let fitnessMetrics: FitnessMetrics?
}

// MARK: - Helper Extensions
extension FoodEntry {
    var mealTypeEnum: MealType {
        MealType(rawValue: mealType.rawValue) ?? .breakfast
    }
    
    var inflammationScoreColor: String {
        guard let score = inflammationScore else { return "gray" }
        if score < 30 { return "green" }
        if score < 60 { return "yellow" }
        return "red"
    }
    
    var macroSummary: String {
        let protein = Int(totalProtein.rounded())
        let fat = Int(totalFat.rounded())
        let carbs = Int(totalCarbs.rounded())
        return "\(protein)g • \(fat)g • \(carbs)g"
    }
}