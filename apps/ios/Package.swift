// swift-tools-version: 5.8
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "DailyFoodTracker",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "DailyFoodTracker",
            targets: ["DailyFoodTracker"]),
    ],
    dependencies: [
        // Add external dependencies here
        // For barcode scanning, you might use:
        // .package(url: "https://github.com/twostraws/CodeScanner", from: "2.0.0"),
    ],
    targets: [
        .target(
            name: "DailyFoodTracker",
            dependencies: []),
        .testTarget(
            name: "DailyFoodTrackerTests",
            dependencies: ["DailyFoodTracker"]),
    ]
)