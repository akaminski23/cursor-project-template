package com.kaminskiperformance.foodtracker.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Today
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.kaminskiperformance.foodtracker.ui.daily.DailyFoodLogScreen
import com.kaminskiperformance.foodtracker.ui.weekly.WeeklyScreen

/**
 * Main Food Tracking App Composable
 * 
 * Provides the same features as iOS version:
 * - Tab-based navigation (Today/Weekly)
 * - Daily food log with meal cards
 * - Weekly trends and charts
 * - Consistent UX patterns with iOS
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FoodTrackingApp() {
    val navController = rememberNavController()
    
    Scaffold(
        bottomBar = {
            NavigationBar {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentDestination = navBackStackEntry?.destination
                
                bottomNavItems.forEach { item ->
                    NavigationBarItem(
                        icon = {
                            Icon(
                                imageVector = item.icon,
                                contentDescription = item.label
                            )
                        },
                        label = { Text(item.label) },
                        selected = currentDestination?.hierarchy?.any { it.route == item.route } == true,
                        onClick = {
                            navController.navigate(item.route) {
                                // Pop up to the start destination of the graph to
                                // avoid building up a large stack of destinations
                                // on the back stack as users select items
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                // Avoid multiple copies of the same destination when
                                // reselecting the same item
                                launchSingleTop = true
                                // Restore state when reselecting a previously selected item
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController,
            startDestination = Screen.Daily.route,
            Modifier.padding(innerPadding)
        ) {
            composable(Screen.Daily.route) {
                DailyFoodLogScreen()
            }
            composable(Screen.Weekly.route) {
                WeeklyScreen()
            }
        }
    }
}

// Navigation setup
sealed class Screen(val route: String, val label: String, val icon: ImageVector) {
    object Daily : Screen("daily", "Today", Icons.Default.Today)
    object Weekly : Screen("weekly", "Weekly", Icons.Default.CalendarToday)
}

private val bottomNavItems = listOf(
    Screen.Daily,
    Screen.Weekly,
)