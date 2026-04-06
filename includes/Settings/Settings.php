<?php
namespace EmployeeManager\Settings;

class Settings {

    public function __construct() {
        add_action( 'admin_menu', [ $this, 'add_settings_page' ] );
        add_action( 'admin_init', [ $this, 'register_settings' ] );
        add_action( 'rest_api_init', [ $this, 'register_rest_settings' ] );

        // Very aggressive enforcement
        add_filter( 'upload_size_limit', [ $this, 'enforce_max_upload_size' ], 9999 );
        add_filter( 'wp_handle_upload_prefilter', [ $this, 'validate_upload_size' ], 9999 );
        add_filter( 'plupload_default_params', [ $this, 'update_plupload_limit' ], 9999 );
        add_filter( 'pre_option_upload_max_filesize', [ $this, 'force_upload_max_filesize' ] );
    }

    public function add_settings_page() {
        // Settings page is already added by EmployeeAdmin, so we don't add it again here
        // This method is kept empty to avoid duplicate menus
    }

    public function register_settings() {
        register_setting( 'employee_manager_settings', 'employee_manager_max_upload_mb', [
            'type'              => 'integer',
            'sanitize_callback' => 'absint',
            'default'           => 2,
            'show_in_rest'      => false,  // Don't expose via standard REST
        ]);

        register_setting( 'employee_manager_settings', 'employee_manager_allowed_image_types', [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => 'jpg,jpeg,png,gif',
            'show_in_rest'      => false,  // Don't expose via standard REST
        ]);

        add_settings_section( 'employee_manager_main', 'General Settings', null, 'employee-manager-settings' );

        add_settings_field(
            'employee_manager_max_upload_mb',
            'Maximum Upload Size (MB)',
            [$this, 'render_max_upload_field'],
            'employee-manager-settings',
            'employee_manager_main'
        );

        add_settings_field(
            'employee_manager_allowed_image_types',
            'Allowed Image Types',
            [$this, 'render_allowed_types_field'],
            'employee-manager-settings',
            'employee_manager_main'
        );
    }

    /**
     * Register custom REST endpoint for employee manager settings
     * This endpoint has proper permission checks for HR Manager role
     */
    public function register_rest_settings() {
        register_rest_route( 'employee-manager/v1', '/settings', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_settings' ],
                'permission_callback' => [ $this, 'check_settings_permission' ],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'update_settings' ],
                'permission_callback' => [ $this, 'check_settings_permission' ],
            ],
        ]);
    }

    /**
     * Check if current user can access settings
     * Allow super admin and HR Manager role
     */
    public function check_settings_permission() {
        return current_user_can( 'manage_options' ) || current_user_can( 'manage_employee_manager' );
    }

    /**
     * GET /employee-manager/v1/settings
     */
    public function get_settings() {
        return new \WP_REST_Response( [
            'success' => true,
            'data'    => [
                'employee_manager_max_upload_mb'   => (int) get_option( 'employee_manager_max_upload_mb', 2 ),
                'employee_manager_allowed_image_types' => get_option( 'employee_manager_allowed_image_types', 'jpg,jpeg,png,gif' ),
            ]
        ], 200 );
    }

    /**
     * POST /employee-manager/v1/settings
     */
    public function update_settings( \WP_REST_Request $request ) {
        $data = $request->get_json_params();

        if ( isset( $data['employee_manager_max_upload_mb'] ) ) {
            update_option( 'employee_manager_max_upload_mb', absint( $data['employee_manager_max_upload_mb'] ) );
        }

        if ( isset( $data['employee_manager_allowed_image_types'] ) ) {
            update_option( 'employee_manager_allowed_image_types', sanitize_text_field( $data['employee_manager_allowed_image_types'] ) );
        }

        return new \WP_REST_Response( [
            'success' => true,
            'message' => 'Settings updated successfully.',
            'data'    => [
                'employee_manager_max_upload_mb'   => (int) get_option( 'employee_manager_max_upload_mb', 2 ),
                'employee_manager_allowed_image_types' => get_option( 'employee_manager_allowed_image_types', 'jpg,jpeg,png,gif' ),
            ]
        ], 200 );
    }

    public function enforce_max_upload_size( $size ) {
        $max_mb = (int) get_option( 'employee_manager_max_upload_mb', 2 );
        $max_bytes = $max_mb * 1024 * 1024;
        return $max_bytes;   // Force our limit
    }

    public function validate_upload_size( $file ) {
        $max_mb = (int) get_option( 'employee_manager_max_upload_mb', 2 );
        $max_bytes = $max_mb * 1024 * 1024;

        if ( $file['size'] > $max_bytes ) {
            $file['error'] = sprintf( 'File is too big! Maximum allowed size is %d MB.', $max_mb );
        }
        return $file;
    }

    public function update_plupload_limit( $params ) {
        $max_mb = (int) get_option( 'employee_manager_max_upload_mb', 2 );
        $max_bytes = $max_mb * 1024 * 1024;
        $params['max_file_size'] = $max_bytes;
        return $params;
    }

    public function force_upload_max_filesize( $value ) {
        $max_mb = (int) get_option( 'employee_manager_max_upload_mb', 2 );
        return $max_mb * 1024 * 1024;
    }

    public function render_max_upload_field() {
        $value = get_option('employee_manager_max_upload_mb', 2);
        echo '<input type="number" name="employee_manager_max_upload_mb" value="' . esc_attr($value) . '" min="1" style="width: 100px;" /> MB';
        echo '<p class="description">Maximum file size allowed for profile photos.</p>';
    }

    public function render_allowed_types_field() {
        $value = get_option('employee_manager_allowed_image_types', 'jpg,jpeg,png,gif');
        echo '<input type="text" name="employee_manager_allowed_image_types" value="' . esc_attr($value) . '" style="width: 300px;" />';
        echo '<p class="description">Comma separated (e.g. jpg,jpeg,png,gif)</p>';
    }

    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1>Employee Manager Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields( 'employee_manager_settings' );
                do_settings_sections( 'employee-manager-settings' );
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }
}