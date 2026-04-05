<?php
namespace EmployeeManager\Settings;

class Settings {

    public function __construct() {
        add_action( 'admin_menu', [ $this, 'add_settings_page' ] );
        add_action( 'admin_init', [ $this, 'register_settings' ] );
        add_action( 'rest_api_init', [ $this, 'register_settings' ] );

        // Enforce upload limit with high priority
        add_filter( 'upload_size_limit', [ $this, 'enforce_max_upload_size' ], 999 );
        add_filter( 'wp_handle_upload_prefilter', [ $this, 'validate_upload_size' ] );
    }

    public function add_settings_page() {
        add_submenu_page(
            'employee-manager',
            'Employee Manager Settings',
            'Settings',
            'manage_options',
            'employee-manager-settings',
            [ $this, 'render_settings_page' ]
        );
    }

    public function register_settings() {
        register_setting( 'employee_manager_settings', 'employee_manager_max_upload_mb', [
            'type'              => 'integer',
            'sanitize_callback' => 'absint',
            'default'           => 2,
            'show_in_rest'      => true,
        ]);

        register_setting( 'employee_manager_settings', 'employee_manager_allowed_image_types', [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => 'jpg,jpeg,png,gif',
            'show_in_rest'      => true,
        ]);

        if ( current_action() === 'admin_init' ) {
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
    }

    public function enforce_max_upload_size( $size ) {
        $max_mb = (int) get_option( 'employee_manager_max_upload_mb', 2 );
        $max_bytes = $max_mb * 1024 * 1024;
        return min( $size, $max_bytes );
    }

    public function validate_upload_size( $file ) {
        $max_mb = (int) get_option( 'employee_manager_max_upload_mb', 2 );
        $max_bytes = $max_mb * 1024 * 1024;

        if ( $file['size'] > $max_bytes ) {
            $file['error'] = sprintf( 'File is too big! Maximum allowed size is %d MB.', $max_mb );
        }
        return $file;
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