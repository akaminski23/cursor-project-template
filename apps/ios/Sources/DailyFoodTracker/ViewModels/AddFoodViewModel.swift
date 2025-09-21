import Foundation
import Combine

@MainActor
class AddFoodViewModel: ObservableObject {
    // Search
    @Published var searchQuery = ""
    @Published var searchResults: [FoodSearchResult] = []
    
    // Food details
    @Published var foodName = ""
    @Published var brand = ""
    @Published var quantity: Double = 100
    @Published var selectedUnit: Unit = .g
    
    // Nutrition per 100g/100ml
    @Published var caloriesPer100: Double = 0
    @Published var proteinPer100: Double = 0
    @Published var fatPer100: Double = 0
    @Published var carbsPer100: Double = 0
    @Published var fiberPer100: Double = 0
    @Published var sugarPer100: Double = 0
    @Published var sodiumPer100: Double = 0
    
    @Published var errorMessage: String?
    
    private let service = FoodTrackingService.shared
    
    var isValidEntry: Bool {
        !foodName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
        quantity > 0 &&
        caloriesPer100 >= 0 &&
        proteinPer100 >= 0 &&
        fatPer100 >= 0 &&
        carbsPer100 >= 0
    }
    
    // Calculated totals based on quantity
    var totalCalories: Double {
        (quantity / 100) * caloriesPer100
    }
    
    var totalProtein: Double {
        (quantity / 100) * proteinPer100
    }
    
    var totalFat: Double {
        (quantity / 100) * fatPer100
    }
    
    var totalCarbs: Double {
        (quantity / 100) * carbsPer100
    }
    
    var totalFiber: Double {
        (quantity / 100) * fiberPer100
    }
    
    var totalSugar: Double {
        (quantity / 100) * sugarPer100
    }
    
    var totalSodium: Double {
        (quantity / 100) * sodiumPer100
    }
    
    func searchFood() async {
        guard !searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            searchResults = []
            return
        }
        
        do {
            let results = try await service.searchFood(searchQuery)
            searchResults = results
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func lookupBarcode(_ barcode: String) async {
        do {
            if let result = try await service.lookupBarcode(barcode) {
                selectSearchResult(result)
            } else {
                errorMessage = "No product found for this barcode"
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func selectSearchResult(_ result: FoodSearchResult) {
        foodName = result.name
        brand = result.brand ?? ""
        caloriesPer100 = result.caloriesPer100
        proteinPer100 = result.proteinPer100
        fatPer100 = result.fatPer100
        carbsPer100 = result.carbsPer100
        fiberPer100 = result.fiberPer100 ?? 0
        sugarPer100 = result.sugarPer100 ?? 0
        sodiumPer100 = result.sodiumPer100 ?? 0
        
        // Clear search results after selection
        searchResults = []
        searchQuery = ""
    }
    
    func loadFromEntry(_ entry: FoodEntry) {
        foodName = entry.name
        brand = entry.brand ?? ""
        quantity = entry.quantity
        selectedUnit = Unit(rawValue: entry.unit) ?? .g
        caloriesPer100 = entry.caloriesPer100
        proteinPer100 = entry.proteinPer100
        fatPer100 = entry.fatPer100
        carbsPer100 = entry.carbsPer100
        fiberPer100 = entry.fiberPer100 ?? 0
        sugarPer100 = entry.sugarPer100 ?? 0
        sodiumPer100 = entry.sodiumPer100 ?? 0
    }
    
    func createEntry() -> CreateFoodEntry? {
        guard isValidEntry else { return nil }
        
        return CreateFoodEntry(
            name: foodName.trimmingCharacters(in: .whitespacesAndNewlines),
            brand: brand.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? nil : brand.trimmingCharacters(in: .whitespacesAndNewlines),
            barcode: nil, // TODO: Add barcode field if needed
            quantity: quantity,
            unit: selectedUnit.rawValue,
            mealType: "", // This will be set by the calling view
            consumedAt: Date(),
            caloriesPer100: caloriesPer100,
            proteinPer100: proteinPer100,
            fatPer100: fatPer100,
            carbsPer100: carbsPer100,
            fiberPer100: fiberPer100 == 0 ? nil : fiberPer100,
            sugarPer100: sugarPer100 == 0 ? nil : sugarPer100,
            sodiumPer100: sodiumPer100 == 0 ? nil : sodiumPer100
        )
    }
}