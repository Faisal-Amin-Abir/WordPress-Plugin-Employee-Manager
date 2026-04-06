<?php
namespace EmployeeManager\Database;

class Manager {

    /**
     * Create table only if it doesn't exist
     * Made static for activation hook
     */
    public static function create_table() {
        global $wpdb;

        $table_name = $wpdb->prefix . 'employee_manager';

        // Check if table already exists
        if ( self::table_exists() ) {
            error_log( "Employee Manager: Table {$table_name} already exists. Skipping creation." );
            return;
        }

        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            full_name VARCHAR(255) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            phone VARCHAR(50) DEFAULT NULL,
            department ENUM('HR', 'Engineering', 'Marketing', 'Sales', 'Finance', 'Operations', 'Other') DEFAULT NULL,
            job_title VARCHAR(150) DEFAULT NULL,
            salary DECIMAL(15,2) DEFAULT NULL,
            date_joined DATE DEFAULT NULL,
            profile_photo_id BIGINT(20) UNSIGNED DEFAULT NULL,
            status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY email (email),
            KEY department (department),
            KEY status (status),
            KEY date_joined (date_joined)
        ) $charset_collate;";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql );

        // Final verification
        if ( self::table_exists() ) {
            error_log( "Employee Manager: Table {$table_name} created successfully." );
        } else {
            error_log( "Employee Manager: Failed to create table {$table_name}." );
        }
    }

    /**
     * Check if the employee table exists
     * Made static
     */
    public static function table_exists() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'employee_manager';

        $result = $wpdb->get_var( $wpdb->prepare(
            "SHOW TABLES LIKE %s", 
            $table_name
        ) );

        return $result === $table_name;
    }
}