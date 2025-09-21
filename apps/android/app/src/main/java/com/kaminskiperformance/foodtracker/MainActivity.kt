package com.kaminskiperformance.foodtracker

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.kaminskiperformance.foodtracker.ui.FoodTrackingApp
import com.kaminskiperformance.foodtracker.ui.theme.FoodTrackerTheme

/**
 * Main Activity for the Daily Food Tracker Android app
 * 
 * This app provides the same functionality as the iOS version:
 * - Daily food logging with meal cards
 * - Add/edit food entries with nutrition details  
 * - Barcode scanning stub
 * - Weekly view with inflammation trends
 * - Macro totals and summaries
 * 
 * Key features matching iOS:
 * - Same UX flows and visual design
 * - API integration with backend
 * - Inflammation scoring display
 * - Error states and loading indicators
 * - Pull-to-refresh and navigation
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            FoodTrackerTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    FoodTrackingApp()
                }
            }
        }
    }
}