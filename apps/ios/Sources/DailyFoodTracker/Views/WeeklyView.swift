import SwiftUI
import Charts

struct WeeklyView: View {
    @StateObject private var viewModel = WeeklyViewModel()
    
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(spacing: 16) {
                    // Week navigation
                    WeekNavigationView(
                        startDate: viewModel.weekStartDate,
                        onPreviousWeek: { viewModel.goToPreviousWeek() },
                        onNextWeek: { viewModel.goToNextWeek() }
                    )
                    
                    if let weekData = viewModel.weekData {
                        // Weekly summary
                        WeeklySummaryView(weekData: weekData)
                        
                        // Inflammation trend chart
                        InflammationTrendChart(weekData: weekData)
                        
                        // Calorie trend chart
                        CalorieTrendChart(weekData: weekData)
                        
                        // Daily breakdown
                        DailyBreakdownView(weekData: weekData)
                    }
                }
                .padding()
            }
            .navigationTitle("Weekly Overview")
            .refreshable {
                await viewModel.loadWeekData()
            }
            .task {
                await viewModel.loadWeekData()
            }
            .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
                Button("OK") {
                    viewModel.errorMessage = nil
                }
            } message: {
                Text(viewModel.errorMessage ?? "")
            }
        }
    }
}

// MARK: - Week Navigation
struct WeekNavigationView: View {
    let startDate: Date
    let onPreviousWeek: () -> Void
    let onNextWeek: () -> Void
    
    private var endDate: Date {
        Calendar.current.date(byAdding: .day, value: 6, to: startDate) ?? startDate
    }
    
    var body: some View {
        HStack {
            Button(action: onPreviousWeek) {
                Image(systemName: "chevron.left")
            }
            
            Spacer()
            
            VStack(spacing: 2) {
                Text("Week of")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Text("\(startDate, formatter: weekFormatter) - \(endDate, formatter: weekFormatter)")
                    .font(.headline)
                    .fontWeight(.semibold)
            }
            
            Spacer()
            
            Button(action: onNextWeek) {
                Image(systemName: "chevron.right")
            }
            .disabled(startDate >= Calendar.current.startOfWeek(for: Date()))
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - Weekly Summary
struct WeeklySummaryView: View {
    let weekData: WeekData
    
    var body: some View {
        VStack(spacing: 12) {
            Text("Weekly Averages")
                .font(.headline)
                .fontWeight(.semibold)
            
            HStack(spacing: 16) {
                WeeklySummaryCard(
                    title: "Avg Calories",
                    value: Int(weekData.averages.avgCalories),
                    color: .blue
                )
                WeeklySummaryCard(
                    title: "Avg Inflammation",
                    value: Int(weekData.averages.avgInflammationScore),
                    color: .orange
                )
                if let avgSteps = weekData.averages.avgSteps {
                    WeeklySummaryCard(
                        title: "Avg Steps",
                        value: Int(avgSteps),
                        color: .green
                    )
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .gray.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

struct WeeklySummaryCard: View {
    let title: String
    let value: Int
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Text("\(value)")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(color)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(color.opacity(0.1))
        .cornerRadius(8)
    }
}

// MARK: - Charts
struct InflammationTrendChart: View {
    let weekData: WeekData
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Inflammation Score Trend")
                .font(.headline)
                .fontWeight(.semibold)
            
            if #available(iOS 16.0, *) {
                Chart(weekData.days) { day in
                    LineMark(
                        x: .value("Day", day.dayOfWeek),
                        y: .value("Score", day.inflammationScore)
                    )
                    .foregroundStyle(Color.orange)
                    
                    PointMark(
                        x: .value("Day", day.dayOfWeek),
                        y: .value("Score", day.inflammationScore)
                    )
                    .foregroundStyle(Color.orange)
                }
                .frame(height: 200)
                .chartYScale(domain: 0...100)
            } else {
                // Fallback for iOS < 16
                SimpleLineChart(data: weekData.days.map { ($0.dayOfWeek, $0.inflammationScore) })
                    .frame(height: 200)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .gray.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

struct CalorieTrendChart: View {
    let weekData: WeekData
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Daily Calorie Intake")
                .font(.headline)
                .fontWeight(.semibold)
            
            if #available(iOS 16.0, *) {
                Chart(weekData.days) { day in
                    BarMark(
                        x: .value("Day", day.dayOfWeek),
                        y: .value("Calories", day.totalCalories)
                    )
                    .foregroundStyle(Color.blue)
                }
                .frame(height: 200)
            } else {
                // Fallback for iOS < 16
                SimpleBarChart(data: weekData.days.map { ($0.dayOfWeek, $0.totalCalories) })
                    .frame(height: 200)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .gray.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

// MARK: - Daily Breakdown
struct DailyBreakdownView: View {
    let weekData: WeekData
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Daily Breakdown")
                .font(.headline)
                .fontWeight(.semibold)
            
            ForEach(weekData.days, id: \.date) { day in
                DailyBreakdownCard(day: day)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .gray.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

struct DailyBreakdownCard: View {
    let day: DayData
    
    private var inflammationColor: Color {
        if day.inflammationScore < 30 { return .green }
        if day.inflammationScore < 60 { return .yellow }
        return .red
    }
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(day.dayOfWeek)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text("\(day.foodCount) foods logged")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            HStack(spacing: 16) {
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(Int(day.totalCalories))")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    
                    Text("calories")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(Int(day.inflammationScore))")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(inflammationColor)
                    
                    Text("inflammation")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(12)
        .background(Color(.systemGray6))
        .cornerRadius(8)
    }
}

// MARK: - Fallback Charts for iOS < 16
struct SimpleLineChart: View {
    let data: [(String, Double)]
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Grid lines
                ForEach(0..<5) { i in
                    let y = geometry.size.height * CGFloat(i) / 4
                    Path { path in
                        path.move(to: CGPoint(x: 0, y: y))
                        path.addLine(to: CGPoint(x: geometry.size.width, y: y))
                    }
                    .stroke(Color.gray.opacity(0.3), lineWidth: 0.5)
                }
                
                // Line
                if !data.isEmpty {
                    Path { path in
                        let maxValue = data.map(\.1).max() ?? 100
                        let minValue = data.map(\.1).min() ?? 0
                        let range = maxValue - minValue
                        
                        for (index, (_, value)) in data.enumerated() {
                            let x = geometry.size.width * CGFloat(index) / CGFloat(data.count - 1)
                            let normalizedValue = range > 0 ? (value - minValue) / range : 0.5
                            let y = geometry.size.height * (1 - normalizedValue)
                            
                            if index == 0 {
                                path.move(to: CGPoint(x: x, y: y))
                            } else {
                                path.addLine(to: CGPoint(x: x, y: y))
                            }
                        }
                    }
                    .stroke(Color.orange, lineWidth: 2)
                }
            }
        }
    }
}

struct SimpleBarChart: View {
    let data: [(String, Double)]
    
    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            ForEach(Array(data.enumerated()), id: \.offset) { index, (day, value) in
                VStack {
                    Spacer()
                    
                    Rectangle()
                        .fill(Color.blue)
                        .frame(height: max(4, value / (data.map(\.1).max() ?? 1) * 150))
                    
                    Text(String(day.prefix(3)))
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
        }
    }
}

// MARK: - Extensions
private let weekFormatter: DateFormatter = {
    let formatter = DateFormatter()
    formatter.dateFormat = "MMM d"
    return formatter
}()

extension Calendar {
    func startOfWeek(for date: Date) -> Date {
        let components = dateComponents([.yearForWeekOfYear, .weekOfYear], from: date)
        return self.date(from: components) ?? date
    }
}

#if DEBUG
struct WeeklyView_Previews: PreviewProvider {
    static var previews: some View {
        WeeklyView()
    }
}
#endif