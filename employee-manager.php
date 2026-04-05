<?php
/**
 * Plugin Name:       Employee Managers
 * Plugin URI:        https://github.com/yourname/employee-manager
 * Description:       Modern employee management system using DataViews, DataForm, REST API and OOP architecture.
 * Version:           1.0.0
 * Author:            Faisal Ami Abir
 * Author Email:      faisalamin50106@gmail.com
 * Text Domain:       employee-manager
 * Requires at least: 6.4
 * Requires PHP:      7.4
 */



if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Define constants
define( 'EMPLOYEE_MANAGER_VERSION', '1.0.0' );
define( 'EMPLOYEE_MANAGER_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'EMPLOYEE_MANAGER_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Load Composer autoloader
if ( file_exists( EMPLOYEE_MANAGER_PLUGIN_DIR . 'vendor/autoload.php' ) ) {
    require_once EMPLOYEE_MANAGER_PLUGIN_DIR . 'vendor/autoload.php';
}

// Register activation hook in GLOBAL scope (this is the most reliable way)
register_activation_hook( __FILE__, function() {
    error_log( '🚀 Employee Manager: Activation hook triggered' );
    $db_manager = new \EmployeeManager\Database\Manager();
    $db_manager->create_table();
    flush_rewrite_rules();
});

// Initialize the main plugin
add_action( 'plugins_loaded', function () {
    \EmployeeManager\Core\Plugin::get_instance();
}, 5 );