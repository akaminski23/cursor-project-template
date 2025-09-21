import Foundation
import Combine

// MARK: - API Service
class FoodTrackingService: ObservableObject {
    static let shared = FoodTrackingService()
    
    private let baseURL = "http://localhost:3000/api/food"
    private let session = URLSession.shared
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()
    
    private init() {
        // Configure date formatting
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        dateFormatter.timeZone = TimeZone(abbreviation: "UTC")
        decoder.dateDecodingStrategy = .formatted(dateFormatter)
        encoder.dateEncodingStrategy = .formatted(dateFormatter)
    }
    
    // MARK: - Food Entries
    func fetchFoodEntries(
        userId: String? = nil,
        date: String? = nil,
        mealType: MealType? = nil,
        limit: Int = 50
    ) async throws -> [FoodEntry] {
        var components = URLComponents(string: "\(baseURL)/entries")!
        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "limit", value: "\(limit)")
        ]
        
        if let userId = userId {
            queryItems.append(URLQueryItem(name: "userId", value: userId))
        }
        if let date = date {
            queryItems.append(URLQueryItem(name: "date", value: date))
        }
        if let mealType = mealType {
            queryItems.append(URLQueryItem(name: "mealType", value: mealType.rawValue))
        }
        
        components.queryItems = queryItems
        
        let (data, response) = try await session.data(from: components.url!)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.serverError
        }
        
        let apiResponse = try decoder.decode(APIResponse<[FoodEntry]>.self, from: data)
        
        if apiResponse.success {
            return apiResponse.data
        } else {
            throw APIError.apiError(apiResponse.error?.message ?? "Unknown error")
        }
    }
    
    func createFoodEntry(_ entry: CreateFoodEntry, userId: String) async throws -> FoodEntry {
        let url = URL(string: "\(baseURL)/entries")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Add userId to the request body
        var body = try encoder.encode(entry)
        var dictionary = try JSONSerialization.jsonObject(with: body) as! [String: Any]
        dictionary["userId"] = userId
        body = try JSONSerialization.data(withJSONObject: dictionary)
        
        request.httpBody = body
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 201 else {
            throw APIError.serverError
        }
        
        let apiResponse = try decoder.decode(APIResponse<FoodEntry>.self, from: data)
        
        if apiResponse.success {
            return apiResponse.data
        } else {
            throw APIError.apiError(apiResponse.error?.message ?? "Unknown error")
        }
    }
    
    func updateFoodEntry(_ id: String, with entry: CreateFoodEntry) async throws -> FoodEntry {
        let url = URL(string: "\(baseURL)/entries/\(id)")!
        var request = URLRequest(url: url)
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try encoder.encode(entry)
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.serverError
        }
        
        let apiResponse = try decoder.decode(APIResponse<FoodEntry>.self, from: data)
        
        if apiResponse.success {
            return apiResponse.data
        } else {
            throw APIError.apiError(apiResponse.error?.message ?? "Unknown error")
        }
    }
    
    func deleteFoodEntry(_ id: String) async throws {
        let url = URL(string: "\(baseURL)/entries/\(id)")!
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        
        let (_, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.serverError
        }
    }
    
    // MARK: - Daily Data
    func fetchDayView(userId: String, date: String) async throws -> DayView {
        var components = URLComponents(string: "\(baseURL)/day")!
        components.queryItems = [
            URLQueryItem(name: "userId", value: userId),
            URLQueryItem(name: "date", value: date)
        ]
        
        let (data, response) = try await session.data(from: components.url!)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.serverError
        }
        
        let apiResponse = try decoder.decode(APIResponse<DayView>.self, from: data)
        
        if apiResponse.success {
            return apiResponse.data
        } else {
            throw APIError.apiError(apiResponse.error?.message ?? "Unknown error")
        }
    }
    
    // MARK: - Barcode/Food Database (Stub)
    func searchFood(_ query: String) async throws -> [FoodSearchResult] {
        // This would integrate with a food database API like:
        // - USDA FoodData Central
        // - Open Food Facts
        // - Edamam Food Database
        // For now, return mock results
        
        try await Task.sleep(nanoseconds: 500_000_000) // Simulate network delay
        
        return [
            FoodSearchResult(
                id: "mock_1",
                name: "Chicken Breast, Grilled",
                brand: nil,
                barcode: nil,
                caloriesPer100: 165,
                proteinPer100: 31.0,
                fatPer100: 3.6,
                carbsPer100: 0,
                fiberPer100: 0,
                sugarPer100: 0,
                sodiumPer100: 74
            ),
            FoodSearchResult(
                id: "mock_2",
                name: "Sweet Potato",
                brand: nil,
                barcode: nil,
                caloriesPer100: 86,
                proteinPer100: 1.6,
                fatPer100: 0.1,
                carbsPer100: 20.1,
                fiberPer100: 3.0,
                sugarPer100: 4.2,
                sodiumPer100: 54
            )
        ]
    }
    
    func lookupBarcode(_ barcode: String) async throws -> FoodSearchResult? {
        // This would integrate with Open Food Facts or similar
        // For now, return a mock result
        try await Task.sleep(nanoseconds: 500_000_000)
        
        return FoodSearchResult(
            id: "barcode_\(barcode)",
            name: "Scanned Product",
            brand: "Example Brand",
            barcode: barcode,
            caloriesPer100: 250,
            proteinPer100: 8.0,
            fatPer100: 12.0,
            carbsPer100: 30.0,
            fiberPer100: 2.0,
            sugarPer100: 15.0,
            sodiumPer100: 200
        )
    }
}

// MARK: - Supporting Types
struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let data: T
    let error: APIErrorResponse?
}

struct APIErrorResponse: Codable {
    let message: String
    let code: String?
    let field: String?
}

struct FoodSearchResult: Codable, Identifiable {
    let id: String
    let name: String
    let brand: String?
    let barcode: String?
    let caloriesPer100: Double
    let proteinPer100: Double
    let fatPer100: Double
    let carbsPer100: Double
    let fiberPer100: Double?
    let sugarPer100: Double?
    let sodiumPer100: Double?
    
    func toCreateFoodEntry(quantity: Double, unit: Unit, mealType: MealType) -> CreateFoodEntry {
        return CreateFoodEntry(
            name: name,
            brand: brand,
            barcode: barcode,
            quantity: quantity,
            unit: unit.rawValue,
            mealType: mealType.rawValue,
            consumedAt: Date(),
            caloriesPer100: caloriesPer100,
            proteinPer100: proteinPer100,
            fatPer100: fatPer100,
            carbsPer100: carbsPer100,
            fiberPer100: fiberPer100,
            sugarPer100: sugarPer100,
            sodiumPer100: sodiumPer100
        )
    }
}

enum APIError: LocalizedError {
    case networkError
    case serverError
    case apiError(String)
    case decodingError
    
    var errorDescription: String? {
        switch self {
        case .networkError:
            return "Network connection error"
        case .serverError:
            return "Server error occurred"
        case .apiError(let message):
            return message
        case .decodingError:
            return "Data parsing error"
        }
    }
}