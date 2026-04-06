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

// Initialize the plugin
add_action( 'plugins_loaded', function() {
    \EmployeeManager\Core\Plugin::get_instance();
}, 5 );