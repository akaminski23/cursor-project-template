-- CreateTable
CREATE TABLE "FoodEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "barcode" TEXT,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "consumedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "caloriesPer100" REAL NOT NULL,
    "proteinPer100" REAL NOT NULL,
    "fatPer100" REAL NOT NULL,
    "carbsPer100" REAL NOT NULL,
    "fiberPer100" REAL,
    "sugarPer100" REAL,
    "sodiumPer100" REAL,
    "totalCalories" REAL NOT NULL,
    "totalProtein" REAL NOT NULL,
    "totalFat" REAL NOT NULL,
    "totalCarbs" REAL NOT NULL,
    "totalFiber" REAL,
    "totalSugar" REAL,
    "totalSodium" REAL,
    "inflammationScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FoodEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MacroTotals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "totalCalories" REAL NOT NULL DEFAULT 0,
    "totalProtein" REAL NOT NULL DEFAULT 0,
    "totalFat" REAL NOT NULL DEFAULT 0,
    "totalCarbs" REAL NOT NULL DEFAULT 0,
    "totalFiber" REAL NOT NULL DEFAULT 0,
    "totalSugar" REAL NOT NULL DEFAULT 0,
    "totalSodium" REAL NOT NULL DEFAULT 0,
    "breakfastCalories" REAL NOT NULL DEFAULT 0,
    "lunchCalories" REAL NOT NULL DEFAULT 0,
    "dinnerCalories" REAL NOT NULL DEFAULT 0,
    "snackCalories" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MacroTotals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InflammationScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "dailyScore" REAL NOT NULL,
    "foodCount" INTEGER NOT NULL DEFAULT 0,
    "breakfastScore" REAL,
    "lunchScore" REAL,
    "dinnerScore" REAL,
    "snackScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InflammationScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FitnessData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "steps" INTEGER,
    "caloriesBurned" REAL,
    "activeMinutes" INTEGER,
    "source" TEXT,
    "syncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FitnessData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "FoodEntry_userId_consumedAt_idx" ON "FoodEntry"("userId", "consumedAt");

-- CreateIndex
CREATE INDEX "FoodEntry_userId_mealType_idx" ON "FoodEntry"("userId", "mealType");

-- CreateIndex
CREATE INDEX "MacroTotals_userId_date_idx" ON "MacroTotals"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MacroTotals_userId_date_key" ON "MacroTotals"("userId", "date");

-- CreateIndex
CREATE INDEX "InflammationScore_userId_date_idx" ON "InflammationScore"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "InflammationScore_userId_date_key" ON "InflammationScore"("userId", "date");

-- CreateIndex
CREATE INDEX "FitnessData_userId_date_idx" ON "FitnessData"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "FitnessData_userId_date_source_key" ON "FitnessData"("userId", "date", "source");
