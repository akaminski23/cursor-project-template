import SwiftUI

struct AddFoodView: View {
    let mealType: MealType
    let editingEntry: FoodEntry?
    let onSave: (CreateFoodEntry) -> Void
    let onCancel: () -> Void
    
    @StateObject private var viewModel = AddFoodViewModel()
    @Environment(\.dismiss) private var dismiss
    
    var isEditing: Bool { editingEntry != nil }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Search/Scan Section
                    if !isEditing {
                        FoodSearchSection(viewModel: viewModel)
                    }
                    
                    // Food Details Form
                    FoodDetailsForm(viewModel: viewModel, mealType: mealType)
                    
                    // Nutrition Preview
                    if viewModel.isValidEntry {
                        NutritionPreview(viewModel: viewModel)
                    }
                }
                .padding()
            }
            .navigationTitle(isEditing ? "Edit Food" : "Add Food")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        onCancel()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        if let entry = viewModel.createEntry() {
                            onSave(entry)
                        }
                    }
                    .disabled(!viewModel.isValidEntry)
                }
            }
            .task {
                if let entry = editingEntry {
                    viewModel.loadFromEntry(entry)
                }
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

// MARK: - Food Search Section
struct FoodSearchSection: View {
    @ObservedObject var viewModel: AddFoodViewModel
    @State private var showingBarcodeScanner = false
    
    var body: some View {
        VStack(spacing: 16) {
            // Search bar
            HStack {
                TextField("Search for food...", text: $viewModel.searchQuery)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .onSubmit {
                        Task {
                            await viewModel.searchFood()
                        }
                    }
                
                Button(action: { showingBarcodeScanner = true }) {
                    Image(systemName: "barcode.viewfinder")
                        .font(.title2)
                        .foregroundColor(.blue)
                }
            }
            
            // Search results
            if !viewModel.searchResults.isEmpty {
                LazyVStack(spacing: 8) {
                    ForEach(viewModel.searchResults) { result in
                        FoodSearchResultRow(result: result) {
                            viewModel.selectSearchResult(result)
                        }
                    }
                }
                .frame(maxHeight: 200)
            }
        }
        .sheet(isPresented: $showingBarcodeScanner) {
            // Barcode scanner stub
            BarcodeScannerView { barcode in
                showingBarcodeScanner = false
                Task {
                    await viewModel.lookupBarcode(barcode)
                }
            } onCancel: {
                showingBarcodeScanner = false
            }
        }
    }
}

struct FoodSearchResultRow: View {
    let result: FoodSearchResult
    let onSelect: () -> Void
    
    var body: some View {
        Button(action: onSelect) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(result.name)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.primary)
                    
                    if let brand = result.brand {
                        Text(brand)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                Spacer()
                
                Text("\(Int(result.caloriesPer100)) cal/100g")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(8)
        }
    }
}

// MARK: - Food Details Form
struct FoodDetailsForm: View {
    @ObservedObject var viewModel: AddFoodViewModel
    let mealType: MealType
    
    var body: some View {
        VStack(spacing: 16) {
            Text(mealType.emoji + " " + mealType.displayName)
                .font(.title2)
                .fontWeight(.semibold)
            
            Group {
                TextField("Food name", text: $viewModel.foodName)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                TextField("Brand (optional)", text: $viewModel.brand)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                
                HStack {
                    TextField("Quantity", value: $viewModel.quantity, format: .number)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .keyboardType(.decimalPad)
                    
                    Picker("Unit", selection: $viewModel.selectedUnit) {
                        ForEach(Unit.allCases, id: \.self) { unit in
                            Text(unit.rawValue).tag(unit)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                }
            }
            
            Text("Nutrition per 100g/100ml:")
                .font(.headline)
                .padding(.top)
            
            Group {
                TextField("Calories", value: $viewModel.caloriesPer100, format: .number)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.decimalPad)
                
                HStack {
                    TextField("Protein (g)", value: $viewModel.proteinPer100, format: .number)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .keyboardType(.decimalPad)
                    
                    TextField("Fat (g)", value: $viewModel.fatPer100, format: .number)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .keyboardType(.decimalPad)
                }
                
                TextField("Carbs (g)", value: $viewModel.carbsPer100, format: .number)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.decimalPad)
                
                Text("Optional:")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                HStack {
                    TextField("Fiber (g)", value: $viewModel.fiberPer100, format: .number)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .keyboardType(.decimalPad)
                    
                    TextField("Sugar (g)", value: $viewModel.sugarPer100, format: .number)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .keyboardType(.decimalPad)
                }
                
                TextField("Sodium (mg)", value: $viewModel.sodiumPer100, format: .number)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.decimalPad)
            }
        }
    }
}

// MARK: - Nutrition Preview
struct NutritionPreview: View {
    @ObservedObject var viewModel: AddFoodViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Nutrition Summary")
                .font(.headline)
            
            HStack {
                MacroPreviewCard(
                    title: "Calories", 
                    value: Int(viewModel.totalCalories), 
                    color: .blue
                )
                MacroPreviewCard(
                    title: "Protein", 
                    value: Int(viewModel.totalProtein), 
                    unit: "g",
                    color: .green
                )
                MacroPreviewCard(
                    title: "Fat", 
                    value: Int(viewModel.totalFat), 
                    unit: "g",
                    color: .orange
                )
                MacroPreviewCard(
                    title: "Carbs", 
                    value: Int(viewModel.totalCarbs), 
                    unit: "g",
                    color: .purple
                )
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct MacroPreviewCard: View {
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
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(color)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Barcode Scanner Stub
struct BarcodeScannerView: View {
    let onScan: (String) -> Void
    let onCancel: () -> Void
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Image(systemName: "barcode.viewfinder")
                    .font(.system(size: 80))
                    .foregroundColor(.gray)
                
                Text("Barcode Scanner")
                    .font(.title)
                    .fontWeight(.semibold)
                
                Text("This is a placeholder for barcode scanning functionality.")
                    .multilineTextAlignment(.center)
                    .foregroundColor(.secondary)
                
                Text("In a real implementation, you would integrate with:")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .padding(.top)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("• AVFoundation for camera access")
                    Text("• Vision framework for barcode detection")
                    Text("• Third-party libraries like CodeScanner")
                }
                .font(.caption)
                .foregroundColor(.secondary)
                
                Button("Simulate Scan (Mock Barcode)") {
                    onScan("1234567890123")
                }
                .buttonStyle(.borderedProminent)
                .padding(.top)
            }
            .padding()
            .navigationTitle("Scan Barcode")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel", action: onCancel)
                }
            }
        }
    }
}

#if DEBUG
struct AddFoodView_Previews: PreviewProvider {
    static var previews: some View {
        AddFoodView(
            mealType: .breakfast,
            editingEntry: nil,
            onSave: { _ in },
            onCancel: { }
        )
    }
}
#endif