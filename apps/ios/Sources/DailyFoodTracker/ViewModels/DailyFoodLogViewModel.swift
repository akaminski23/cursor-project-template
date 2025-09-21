import Foundation
import Combine

@MainActor
class DailyFoodLogViewModel: ObservableObject {
    @Published var selectedDate = Date()
    @Published var dayView: DayView?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var selectedEntry: FoodEntry?
    
    private let service = FoodTrackingService.shared
    private let userId = "cmfszzagp00004huocrkmkbzy" // Mock user ID - in real app, get from auth
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        // Observe date changes and reload data
        $selectedDate
            .removeDuplicates()
            .sink { [weak self] _ in
                Task {
                    await self?.loadData()
                }
            }
            .store(in: &cancellables)
    }
    
    func loadData() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let dateString = DateFormatter.apiDateFormatter.string(from: selectedDate)
            let data = try await service.fetchDayView(userId: userId, date: dateString)
            dayView = data
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func addEntry(_ entry: CreateFoodEntry) async {
        do {
            _ = try await service.createFoodEntry(entry, userId: userId)
            await loadData()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func updateEntry(_ id: String, with entry: CreateFoodEntry) async {
        do {
            _ = try await service.updateFoodEntry(id, with: entry)
            await loadData()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func deleteEntry(_ id: String) async {
        do {
            try await service.deleteFoodEntry(id)
            await loadData()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
    
    func entries(for mealType: MealType) -> [FoodEntry] {
        return dayView?.foodEntries.filter { $0.mealTypeEnum == mealType } ?? []
    }
}

extension DateFormatter {
    static let apiDateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }()
}