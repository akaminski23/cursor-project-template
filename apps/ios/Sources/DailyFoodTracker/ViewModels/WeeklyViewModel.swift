import Foundation
import Combine

// MARK: - Week Data Models
struct WeekData: Codable {
    let startDate: String
    let endDate: String
    let days: [DayData]
    let averages: WeeklyAverages
}

struct DayData: Codable {
    let date: String
    let dayOfWeek: String
    let totalCalories: Double
    let inflammationScore: Double
    let foodCount: Int
}

struct WeeklyAverages: Codable {
    let avgCalories: Double
    let avgInflammationScore: Double
    let avgSteps: Double?
}

// MARK: - Weekly ViewModel
@MainActor
class WeeklyViewModel: ObservableObject {
    @Published var weekStartDate = Calendar.current.startOfWeek(for: Date())
    @Published var weekData: WeekData?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let service = FoodTrackingService.shared
    private let userId = "cmfszzagp00004huocrkmkbzy" // Mock user ID - in real app, get from auth
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        // Observe week changes and reload data
        $weekStartDate
            .removeDuplicates()
            .sink { [weak self] _ in
                Task {
                    await self?.loadWeekData()
                }
            }
            .store(in: &cancellables)
    }
    
    func loadWeekData() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let endDate = Calendar.current.date(byAdding: .day, value: 6, to: weekStartDate) ?? weekStartDate
            
            // Generate dates for the week
            var dates: [Date] = []
            var currentDate = weekStartDate
            while currentDate <= endDate {
                dates.append(currentDate)
                currentDate = Calendar.current.date(byAdding: .day, value: 1, to: currentDate) ?? currentDate
            }
            
            // Fetch data for each day
            var dayDataArray: [DayData] = []
            
            for date in dates {
                let dateString = DateFormatter.apiDateFormatter.string(from: date)
                
                do {
                    let dayView = try await service.fetchDayView(userId: userId, date: dateString)
                    
                    let dayOfWeek = DateFormatter.dayOfWeekFormatter.string(from: date)
                    
                    let dayData = DayData(
                        date: dateString,
                        dayOfWeek: dayOfWeek,
                        totalCalories: dayView.macroTotals.totalCalories,
                        inflammationScore: dayView.inflammationMetrics.dailyScore,
                        foodCount: dayView.inflammationMetrics.foodCount
                    )
                    
                    dayDataArray.append(dayData)
                } catch {
                    // If no data for this day, create empty day data
                    let dayOfWeek = DateFormatter.dayOfWeekFormatter.string(from: date)
                    
                    let dayData = DayData(
                        date: dateString,
                        dayOfWeek: dayOfWeek,
                        totalCalories: 0,
                        inflammationScore: 50, // neutral score
                        foodCount: 0
                    )
                    
                    dayDataArray.append(dayData)
                }
            }
            
            // Calculate weekly averages
            let daysWithData = dayDataArray.filter { $0.foodCount > 0 }
            
            let avgCalories = daysWithData.isEmpty ? 0 : 
                daysWithData.reduce(0) { $0 + $1.totalCalories } / Double(daysWithData.count)
            
            let avgInflammationScore = daysWithData.isEmpty ? 50 : 
                daysWithData.reduce(0) { $0 + $1.inflammationScore } / Double(daysWithData.count)
            
            let averages = WeeklyAverages(
                avgCalories: avgCalories,
                avgInflammationScore: avgInflammationScore,
                avgSteps: nil // TODO: Fetch fitness data if available
            )
            
            // Create week data
            self.weekData = WeekData(
                startDate: DateFormatter.apiDateFormatter.string(from: weekStartDate),
                endDate: DateFormatter.apiDateFormatter.string(from: endDate),
                days: dayDataArray,
                averages: averages
            )
            
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func goToPreviousWeek() {
        weekStartDate = Calendar.current.date(byAdding: .weekOfYear, value: -1, to: weekStartDate) ?? weekStartDate
    }
    
    func goToNextWeek() {
        let nextWeek = Calendar.current.date(byAdding: .weekOfYear, value: 1, to: weekStartDate) ?? weekStartDate
        let currentWeekStart = Calendar.current.startOfWeek(for: Date())
        
        // Don't allow going to future weeks
        if nextWeek <= currentWeekStart {
            weekStartDate = nextWeek
        }
    }
}

extension DateFormatter {
    static let dayOfWeekFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE" // Full day name
        return formatter
    }()
}