<?php
/**
 * Plugin Name:       Employee Manager
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
define( 'EMPLOYEE_MANAGER_PLUGIN_FILE', __FILE__ );
define( 'EMPLOYEE_MANAGER_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'EMPLOYEE_MANAGER_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Load Composer autoloader if exists
if ( file_exists( EMPLOYEE_MANAGER_PLUGIN_DIR . 'vendor/autoload.php' ) ) {
    require_once EMPLOYEE_MANAGER_PLUGIN_DIR . 'vendor/autoload.php';
}

// Load the main Plugin class
require_once EMPLOYEE_MANAGER_PLUGIN_DIR . 'includes/Core/Plugin.php';

// Register activation and deactivation hooks BEFORE plugins_loaded
register_activation_hook( __FILE__, function() {
    error_log( 'Employee Manager: ACTIVATION HOOK FIRED' );
    require_once EMPLOYEE_MANAGER_PLUGIN_DIR . 'includes/Database/Manager.php';
    require_once EMPLOYEE_MANAGER_PLUGIN_DIR . 'includes/Core/Capabilities.php';
    
    error_log( 'Employee Manager: → Creating database table...' );
    \EmployeeManager\Database\Manager::create_table();
    error_log( 'Employee Manager: → Database table creation completed.' );
    
    error_log( 'Employee Manager: → Creating custom roles...' );
    try {
        \EmployeeManager\Core\Capabilities::create_roles();
        error_log( 'Employee Manager: ✓ Custom roles created successfully.' );
    } catch ( \Exception $e ) {
        error_log( 'Employee Manager: ERROR: Failed to create roles: ' . $e->getMessage() );
    }
    
    flush_rewrite_rules();
    error_log( 'Employee Manager: ACTIVATION COMPLETE' );
} );

register_deactivation_hook( __FILE__, function() {
    error_log( 'Employee Manager: DEACTIVATION HOOK FIRED' );
    require_once EMPLOYEE_MANAGER_PLUGIN_DIR . 'includes/Core/Capabilities.php';
    
    try {
        \EmployeeManager\Core\Capabilities::remove_roles();
        error_log( 'Employee Manager: ✓ Custom roles removed successfully' );
    } catch ( \Exception $e ) {
        error_log( 'Employee Manager: ERROR: Failed to remove roles: ' . $e->getMessage() );
    }
    
    flush_rewrite_rules();
    error_log( 'Employee Manager: DEACTIVATION COMPLETE' );
} );

// Initialize the plugin
add_action( 'plugins_loaded', function() {
    \EmployeeManager\Core\Plugin::get_instance();
}, 5 );