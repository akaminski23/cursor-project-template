import SwiftUI

struct DailyFoodLogView: View {
    @StateObject private var viewModel = DailyFoodLogViewModel()
    @State private var showingAddFood = false
    @State private var selectedMealType: MealType = .breakfast
    
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVStack(spacing: 16) {
                    // Date picker and navigation
                    DateNavigationView(selectedDate: $viewModel.selectedDate)
                    
                    // Daily summary cards
                    if let dayView = viewModel.dayView {
                        DailySummaryView(dayView: dayView)
                    }
                    
                    // Meal sections
                    ForEach(MealType.allCases, id: \.self) { mealType in
                        MealSectionView(
                            mealType: mealType,
                            entries: viewModel.entries(for: mealType),
                            onAddFood: {
                                selectedMealType = mealType
                                showingAddFood = true
                            },
                            onEditFood: { entry in
                                viewModel.selectedEntry = entry
                                selectedMealType = entry.mealTypeEnum
                                showingAddFood = true
                            },
                            onDeleteFood: { entry in
                                await viewModel.deleteEntry(entry.id)
                            }
                        )
                    }
                }
                .padding()
            }
            .navigationTitle("Daily Food Log")
            .refreshable {
                await viewModel.loadData()
            }
            .sheet(isPresented: $showingAddFood) {
                AddFoodView(
                    mealType: selectedMealType,
                    editingEntry: viewModel.selectedEntry,
                    onSave: { entry in
                        if let existingEntry = viewModel.selectedEntry {
                            await viewModel.updateEntry(existingEntry.id, with: entry)
                        } else {
                            await viewModel.addEntry(entry)
                        }
                        viewModel.selectedEntry = nil
                        showingAddFood = false
                    },
                    onCancel: {
                        viewModel.selectedEntry = nil
                        showingAddFood = false
                    }
                )
            }
            .task {
                await viewModel.loadData()
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

// MARK: - Date Navigation
struct DateNavigationView: View {
    @Binding var selectedDate: Date
    
    var body: some View {
        HStack {
            Button(action: { selectedDate = Calendar.current.date(byAdding: .day, value: -1, to: selectedDate)! }) {
                Image(systemName: "chevron.left")
            }
            
            Spacer()
            
            Text(selectedDate, style: .date)
                .font(.headline)
                .fontWeight(.semibold)
            
            Spacer()
            
            Button(action: { selectedDate = Calendar.current.date(byAdding: .day, value: 1, to: selectedDate)! }) {
                Image(systemName: "chevron.right")
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - Daily Summary
struct DailySummaryView: View {
    let dayView: DayView
    
    var body: some View {
        VStack(spacing: 12) {
            // Macro totals
            HStack(spacing: 16) {
                MacroCard(title: "Calories", value: Int(dayView.macroTotals.totalCalories), color: .blue)
                MacroCard(title: "Protein", value: Int(dayView.macroTotals.totalProtein), unit: "g", color: .green)
                MacroCard(title: "Fat", value: Int(dayView.macroTotals.totalFat), unit: "g", color: .orange)
                MacroCard(title: "Carbs", value: Int(dayView.macroTotals.totalCarbs), unit: "g", color: .purple)
            }
            
            // Inflammation score
            InflammationScoreView(score: dayView.inflammationMetrics.dailyScore)
            
            // Fitness metrics (if available)
            if let fitness = dayView.fitnessMetrics {
                FitnessMetricsView(fitness: fitness)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .gray.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

struct MacroCard: View {
    let title: String
    let value: Int
    var unit: String = ""
    let color: Color
    
    var body: some View {
        VStack(spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            
            Text("\(value)\(unit)")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(color)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(color.opacity(0.1))
        .cornerRadius(8)
    }
}

struct InflammationScoreView: View {
    let score: Double
    
    private var scoreColor: Color {
        if score < 30 { return .green }
        if score < 60 { return .yellow }
        return .red
    }
    
    private var scoreLevel: String {
        if score < 30 { return "Low" }
        if score < 60 { return "Moderate" }
        return "High"
    }
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Inflammation Score")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                Text("\(Int(score.rounded())) • \(scoreLevel)")
                    .font(.title2)
                    .fontWeight(.semibold)
                    .foregroundColor(scoreColor)
            }
            
            Spacer()
            
            Circle()
                .fill(scoreColor)
                .frame(width: 40, height: 40)
                .overlay(
                    Text("\(Int(score.rounded()))")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                )
        }
        .padding()
        .background(scoreColor.opacity(0.1))
        .cornerRadius(12)
    }
}

struct FitnessMetricsView: View {
    let fitness: FitnessMetrics
    
    var body: some View {
        HStack(spacing: 16) {
            if let steps = fitness.steps {
                FitnessCard(title: "Steps", value: "\(steps)", icon: "figure.walk")
            }
            
            if let calories = fitness.caloriesBurned {
                FitnessCard(title: "Burned", value: "\(Int(calories))", icon: "flame.fill")
            }
            
            if let minutes = fitness.activeMinutes {
                FitnessCard(title: "Active", value: "\(minutes)m", icon: "timer")
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct FitnessCard: View {
    let title: String
    let value: String
    let icon: String
    
    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .foregroundColor(.blue)
                .font(.title3)
            
            Text(value)
                .font(.headline)
                .fontWeight(.semibold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Meal Section
struct MealSectionView: View {
    let mealType: MealType
    let entries: [FoodEntry]
    let onAddFood: () -> Void
    let onEditFood: (FoodEntry) -> Void
    let onDeleteFood: (FoodEntry) async -> Void
    
    private var totalCalories: Double {
        entries.reduce(0) { $0 + $1.totalCalories }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Meal header
            HStack {
                HStack(spacing: 8) {
                    Text(mealType.emoji)
                        .font(.title2)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(mealType.displayName)
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        if !entries.isEmpty {
                            Text("\(Int(totalCalories.rounded())) calories")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
                
                Spacer()
                
                Button(action: onAddFood) {
                    Image(systemName: "plus.circle.fill")
                        .font(.title2)
                        .foregroundColor(.blue)
                }
            }
            
            // Food entries
            if entries.isEmpty {
                Text("No foods logged for \(mealType.displayName.lowercased())")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .italic()
                    .padding(.vertical, 8)
            } else {
                ForEach(entries) { entry in
                    FoodEntryCard(
                        entry: entry,
                        onEdit: { onEditFood(entry) },
                        onDelete: { await onDeleteFood(entry) }
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

// MARK: - Food Entry Card
struct FoodEntryCard: View {
    let entry: FoodEntry
    let onEdit: () -> Void
    let onDelete: () async -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(entry.name)
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    if let brand = entry.brand {
                        Text(brand)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    Text("\(Int(entry.totalCalories.rounded())) cal")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    Text("\(entry.quantity.formatted()) \(entry.unit)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            HStack {
                Text(entry.macroSummary)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                if let score = entry.inflammationScore {
                    InflammationBadge(score: score)
                }
                
                Menu {
                    Button("Edit", action: onEdit)
                    Button("Delete", role: .destructive) {
                        Task { await onDelete() }
                    }
                } label: {
                    Image(systemName: "ellipsis")
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(12)
        .background(Color(.systemGray6))
        .cornerRadius(8)
    }
}

struct InflammationBadge: View {
    let score: Double
    
    private var badgeColor: Color {
        if score < 30 { return .green }
        if score < 60 { return .yellow }
        return .red
    }
    
    var body: some View {
        Text("\(Int(score.rounded()))")
            .font(.caption2)
            .fontWeight(.bold)
            .foregroundColor(.white)
            .padding(.horizontal, 6)
            .padding(.vertical, 2)
            .background(badgeColor)
            .cornerRadius(4)
    }
}

#if DEBUG
struct DailyFoodLogView_Previews: PreviewProvider {
    static var previews: some View {
        DailyFoodLogView()
    }
}
#endif