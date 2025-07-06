<?php
/**
 * Plugin Name: Vendor Dashboard Redirect
 * Description: Redirect vendors to their dashboard after login.
 * Version: 1.0
 * Author: Meer Muneeb Khan
 * Text Domain: vendor-dashboard-redirect
 */

// Hook into the 'wp_login' action to redirect users after login
function redirect_vendor_to_dashboard($user_login, $user) {
    // Check if the user has the 'seller' role (Dokan vendors)
    if (in_array('dokan_vendor', $user->roles)) {
        // Redirect the vendor to their dashboard
        wp_redirect( home_url( '/dashboard/?path=%2Fanalytics%2FOverview' ) );
        exit;
    }
}

// Add the function to the wp_login hook
add_action('wp_login', 'redirect_vendor_to_dashboard', 10, 2);

