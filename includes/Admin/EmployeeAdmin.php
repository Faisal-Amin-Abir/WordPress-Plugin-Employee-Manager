<?php
namespace EmployeeManager\Admin;

use EmployeeManager\Core\Capabilities;

class EmployeeAdmin {

    public function __construct() {
        // Correct hook and method name
        add_action( 'admin_menu', [ $this, 'add_admin_menu' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
    }

    /**
     * Register Admin Menu and Submenu
     */
    public function add_admin_menu() {
        // Check if user can view (custom roles OR super admin)
        $can_view = current_user_can( Capabilities::VIEW_EMPLOYEES ) || current_user_can( 'manage_options' );
        
        if ( ! $can_view ) {
            return;
        }

        // Main Menu - Visible to HR Manager + Employee Viewer + Super Admin
        add_menu_page(
            __('Employee Manager', 'employee-manager'),
            __('Employee Manager', 'employee-manager'),
            'read',  // Use 'read' since we already checked permission above
            'employee-manager',
            [$this, 'render_admin_page'],
            'dashicons-groups',
            25
        );

        // Settings Submenu - Only HR Manager + Super Admin
        $can_manage = current_user_can( Capabilities::MANAGE_EMPLOYEES ) || current_user_can( 'manage_options' );
        
        if ( $can_manage ) {
            add_submenu_page(
                'employee-manager',
                __('Settings', 'employee-manager'),
                __('Settings', 'employee-manager'),
                'read',  // Use 'read' since we already checked permission above
                'employee-manager-settings',
                [$this, 'render_settings_page']
            );
        }
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
     * Render Settings page
     */
    public function render_settings_page() {
        // Verify user has permission (HR Manager OR Super Admin)
        if ( ! ( current_user_can( Capabilities::MANAGE_EMPLOYEES ) || current_user_can( 'manage_options' ) ) ) {
            wp_die( 'You do not have permission to access this page.' );
        }

        $max_upload_mb = get_option( 'employee_manager_max_upload_mb', 2 );
        $allowed_types = get_option( 'employee_manager_allowed_image_types', 'jpg,jpeg,png,gif' );
        $nonce = wp_create_nonce( 'employee_manager_settings_nonce' );
        ?>
        <div class="wrap">
            <h1><?php esc_html_e( 'Employee Manager Settings', 'employee-manager' ); ?></h1>
            
            <form method="post" id="employee-manager-settings-form" style="max-width: 600px;">
                <?php wp_nonce_field( 'employee_manager_settings_nonce', 'employee_manager_settings_nonce' ); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="employee_manager_max_upload_mb">
                                <?php esc_html_e( 'Maximum Upload Size (MB)', 'employee-manager' ); ?>
                            </label>
                        </th>
                        <td>
                            <input 
                                type="number" 
                                id="employee_manager_max_upload_mb"
                                name="employee_manager_max_upload_mb" 
                                value="<?php echo esc_attr( $max_upload_mb ); ?>" 
                                min="1"
                                max="100"
                            />
                            <p class="description">
                                <?php esc_html_e( 'Maximum file size allowed for profile photos.', 'employee-manager' ); ?>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="employee_manager_allowed_image_types">
                                <?php esc_html_e( 'Allowed Image Types', 'employee-manager' ); ?>
                            </label>
                        </th>
                        <td>
                            <input 
                                type="text" 
                                id="employee_manager_allowed_image_types"
                                name="employee_manager_allowed_image_types" 
                                value="<?php echo esc_attr( $allowed_types ); ?>"
                                style="width: 300px;"
                            />
                            <p class="description">
                                <?php esc_html_e( 'Comma separated (e.g. jpg,jpeg,png,gif)', 'employee-manager' ); ?>
                            </p>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button( __( 'Save Settings', 'employee-manager' ) ); ?>
            </form>
            
            <script>
                document.getElementById('employee-manager-settings-form').addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const formData = {
                        employee_manager_max_upload_mb: document.getElementById('employee_manager_max_upload_mb').value,
                        employee_manager_allowed_image_types: document.getElementById('employee_manager_allowed_image_types').value,
                        nonce: '<?php echo esc_js( $nonce ); ?>'
                    };
                    
                    fetch('<?php echo esc_url( rest_url( 'employee-manager/v1/settings' ) ); ?>', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-WP-Nonce': '<?php echo esc_js( wp_create_nonce( 'wp_rest' ) ); ?>'
                        },
                        body: JSON.stringify(formData)
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('<?php esc_html_e( 'Settings saved successfully!', 'employee-manager' ); ?>');
                            location.reload();
                        } else {
                            alert('<?php esc_html_e( 'Error saving settings', 'employee-manager' ); ?>');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('<?php esc_html_e( 'Error saving settings', 'employee-manager' ); ?>');
                    });
                });
            </script>
        </div>
        <?php
    }

    /**
     * Enqueue React + Media scripts and styles
     */
    public function enqueue_assets($hook) {
        if ('toplevel_page_employee-manager' !== $hook) {
            return;
        }

        // Load asset file to get dependencies and version
        $asset_file = EMPLOYEE_MANAGER_PLUGIN_DIR . 'build/index.asset.php';
        $asset = file_exists($asset_file) ? include_once($asset_file) : ['dependencies' => [], 'version' => '1.0.0'];
        
        $dependencies = $asset['dependencies'] ?? ['wp-element', 'wp-data', 'wp-components'];
        $version = $asset['version'] ?? EMPLOYEE_MANAGER_VERSION;

        // Register and enqueue main app script with proper dependencies
        wp_register_script(
            'employee-manager-app',
            EMPLOYEE_MANAGER_PLUGIN_URL . 'build/index.js',
            $dependencies,
            $version . '-' . time(),  // Cache busting during development
            true
        );
        
        wp_enqueue_script('employee-manager-app');

        // Media Library (needed for profile photo upload)
        wp_enqueue_media();

        // === Role-Based Permissions ===
        wp_localize_script('employee-manager-app', 'employeeManager', [
            'restUrl'     => rest_url('employee-manager/v1/'),
            'nonce'       => wp_create_nonce('wp_rest'),
            'pluginUrl'   => EMPLOYEE_MANAGER_PLUGIN_URL,
            'canManage'   => \EmployeeManager\Core\Capabilities::can_manage(),
            'canView'     => \EmployeeManager\Core\Capabilities::can_view(),
        ]);

        // Admin CSS
        wp_enqueue_style(
            'employee-manager-admin',
            EMPLOYEE_MANAGER_PLUGIN_URL . 'assets/css/admin.css',
            [],
            $version
        );
    }
}