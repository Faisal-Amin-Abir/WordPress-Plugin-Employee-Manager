<?php
namespace EmployeeManager\Core;

use EmployeeManager\Database\Manager as DatabaseManager;

class Plugin {
    private static $instance = null;
    public $db_manager;
    public $rest_api;
    public $admin;
    public $settings;

    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->init();
    }

    private function init() {
        register_activation_hook( EMPLOYEE_MANAGER_PLUGIN_FILE, [ __CLASS__, 'activate' ] );
        register_deactivation_hook( EMPLOYEE_MANAGER_PLUGIN_FILE, [ __CLASS__, 'deactivate' ] );

        add_action( 'plugins_loaded', [ $this, 'load_components' ] );
    }

    /**
     * Plugin Activation Hook with detailed logging
     */
    public static function activate() {
        error_log( '🚀 Employee Manager: Activation hook STARTED' );

        // Create database table
        error_log( '→ Creating database table...' );
        DatabaseManager::create_table();
        error_log( '→ Database table creation completed.' );

        // Create custom roles
        error_log( '→ Loading Capabilities class...' );
        
        if ( class_exists( '\\EmployeeManager\\Core\\Capabilities' ) ) {
            error_log( '✅ Capabilities class found. Creating roles...' );
            \EmployeeManager\Core\Capabilities::create_roles();
            error_log( '✅ Roles creation completed.' );
        } else {
            error_log( '❌ ERROR: Capabilities class NOT found during activation!' );
        }

        // Flush rewrite rules
        flush_rewrite_rules();

        error_log( '🎉 Employee Manager: Activation hook FINISHED' );
    }

    public static function deactivate() {
        flush_rewrite_rules();
        error_log( 'Employee Manager: Deactivation hook triggered' );
    }

    public function load_components() {
        $this->db_manager = new DatabaseManager();
        $this->rest_api   = new \EmployeeManager\API\RestController();
        $this->admin      = new \EmployeeManager\Admin\EmployeeAdmin();
        $this->settings   = new \EmployeeManager\Settings\Settings();   

        error_log( 'Employee Manager: Plugin components loaded' );
    }
}