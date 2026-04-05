<?php
namespace EmployeeManager\Admin;

class EmployeeAdmin {

    public function __construct() {
        add_action( 'admin_menu', [ $this, 'add_menu_page' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
    }

    /**
     * Add Employee Manager menu in WordPress admin
     */
    public function add_menu_page() {
        add_menu_page(
            __( 'Employee Manager', 'employee-manager' ),
            __( 'Employees', 'employee-manager' ),
            'manage_options',
            'employee-manager',
            [ $this, 'render_admin_page' ],
            'dashicons-groups',
            30
        );
    }

    /**
     * Render the main admin page (React container)
     */
    public function render_admin_page() {
        ?>
        <div class="wrap">
            <h1 class="wp-heading-inline"><?php esc_html_e( 'Employee Manager', 'employee-manager' ); ?></h1>
            <hr class="wp-header-end">
            
            <div id="employee-manager-app" style="margin-top: 20px;">
                <!-- React App will be mounted here -->
                <div style="text-align:center; padding: 100px 20px;">
                    <div class="spinner is-active" style="float: none; margin: 0 auto;"></div>
                    <p>Loading Employee Manager...</p>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Enqueue React + DataViews scripts and styles
     */
    public function enqueue_assets( $hook ) {
        if ( 'toplevel_page_employee-manager' !== $hook ) {
            return;
        }

        // Enqueue WordPress core packages
        wp_enqueue_script( 'wp-element' );
        wp_enqueue_script( 'wp-data' );
        wp_enqueue_script( 'wp-components' );
        wp_enqueue_script( 'wp-i18n' );
        wp_enqueue_script( 'wp-api-fetch' );

        // IMPORTANT: Load WordPress Media Library (for profile photo upload)
        wp_enqueue_media();
        wp_enqueue_script( 'media-upload' );

        // Our React build
        wp_enqueue_script(
            'employee-manager-app',
            EMPLOYEE_MANAGER_PLUGIN_URL . 'build/index.js',
            [ 
                'wp-element', 
                'wp-data', 
                'wp-components', 
                'wp-api-fetch', 
                'media-upload' 
            ],
            EMPLOYEE_MANAGER_VERSION,
            true
        );

        // Localize data for React (REST URL + nonce)
        wp_localize_script( 'employee-manager-app', 'employeeManager', [
            'restUrl'   => rest_url( 'employee-manager/v1/' ),
            'nonce'     => wp_create_nonce( 'wp_rest' ),
            'pluginUrl' => EMPLOYEE_MANAGER_PLUGIN_URL,
        ] );

        // Basic admin styles
        wp_enqueue_style(
            'employee-manager-admin',
            EMPLOYEE_MANAGER_PLUGIN_URL . 'assets/css/admin.css',
            [],
            EMPLOYEE_MANAGER_VERSION
        );
    }

}