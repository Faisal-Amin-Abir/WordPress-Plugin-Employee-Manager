<?php
namespace EmployeeManager\Core;

use EmployeeManager\Database\Manager as DatabaseManager;

class Plugin {
    private static $instance = null;
    public $db_manager;
    public $rest_api;
    public $schema;
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
        error_log( 'Employee Manager: Activation hook STARTED' );

        // Create database table
        error_log( '→ Creating database table...' );
        DatabaseManager::create_table();
        error_log( '→ Database table creation completed.' );

        // Create custom roles
        error_log( '→ Creating custom roles...' );
        try {
            Capabilities::create_roles();
            error_log( '✓ Custom roles created successfully.' );
        } catch ( \Exception $e ) {
            error_log( 'ERROR: Failed to create roles: ' . $e->getMessage() );
        }

        // Flush rewrite rules
        flush_rewrite_rules();

        error_log( 'Employee Manager: Activation hook FINISHED' );
    }

    public static function deactivate() {
        // Remove custom roles on deactivation
        error_log( 'Employee Manager: Plugin deactivation started. Removing custom roles...' );
        try {
            Capabilities::remove_roles();
            error_log( '✓ Custom roles removed successfully' );
        } catch ( \Exception $e ) {
            error_log( 'ERROR: Failed to remove roles: ' . $e->getMessage() );
        }
        
        flush_rewrite_rules();
        error_log( 'Employee Manager: Plugin deactivated' );
    }

    public function load_components() {
        $this->db_manager = new DatabaseManager();
        $this->rest_api   = new \EmployeeManager\API\RestController();
        $this->schema     = new \EmployeeManager\API\SchemaController();
        $this->admin      = new \EmployeeManager\Admin\EmployeeAdmin();
        $this->settings   = new \EmployeeManager\Settings\Settings();   

        // Ensure roles exist (in case activation hook didn't fire properly)
        self::ensure_roles_exist();

        // Update existing HR Manager role with new capabilities if needed
        self::update_existing_roles();

        // Register media permissions for HR Manager role
        Capabilities::register_media_permissions();

        error_log( 'Employee Manager: Plugin components loaded' );
    }

    /**
     * Ensure custom roles exist (fallback if activation hook fails)
     */
    public static function ensure_roles_exist() {
        if ( ! get_role( 'hr_manager' ) || ! get_role( 'employee_viewer' ) ) {
            error_log( 'Employee Manager: Roles missing, recreating them...' );
            Capabilities::create_roles();
        }
    }

    /**
     * Update existing HR Manager role with new media capabilities
     */
    public static function update_existing_roles() {
        $hr_manager_role = get_role( 'hr_manager' );
        
        if ( $hr_manager_role ) {
            // Add media capabilities if they don't exist
            $required_caps = [
                'upload_files',
                'edit_posts',
                'read_private_posts',
                'edit_private_posts',
                'delete_posts',
            ];
            
            foreach ( $required_caps as $cap ) {
                if ( ! $hr_manager_role->has_cap( $cap ) ) {
                    $hr_manager_role->add_cap( $cap );
                    error_log( "Employee Manager: Added '$cap' capability to hr_manager role" );
                }
            }
        }
    }
}