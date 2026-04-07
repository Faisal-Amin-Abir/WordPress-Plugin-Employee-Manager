<?php
namespace EmployeeManager\Database;

class Manager {

    /**
     * Create table during plugin activation
     * Made static for activation hook
     */
    public static function create_table() {
        global $wpdb;

        $table_name = $wpdb->prefix . 'employee_manager';
        
        error_log( "Employee Manager: Starting table creation..." );
        error_log( "Employee Manager: Table name: {$table_name}" );

        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS {$table_name} (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
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
            KEY department (department),
            KEY status (status),
            KEY date_joined (date_joined)
        ) {$charset_collate};";

        error_log( "Employee Manager: Executing SQL: " . substr( $sql, 0, 150 ) . "..." );

        // Execute the SQL
        $result = $wpdb->query( $sql );
        
        error_log( "Employee Manager: Query result: " . ( $result === false ? 'FALSE' : $result ) );
        
        if ( $result === false ) {
            error_log( "Employee Manager: SQL Error - " . $wpdb->last_error );
            return false;
        }

        // Verify table was created
        $table_check = $wpdb->get_var( "SHOW TABLES LIKE '{$table_name}'" );
        
        if ( $table_check === $table_name ) {
            error_log( "Employee Manager: ✓ Table {$table_name} created successfully!" );
            return true;
        } else {
            error_log( "Employee Manager: ✗ Table verification failed. Table not found in database." );
            return false;
        }
    }

    /**
     * Check if the employee table exists
     * Made static
     */
    public static function table_exists() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'employee_manager';

        $result = $wpdb->get_var( "SHOW TABLES LIKE '{$table_name}'" );

        return $result === $table_name;
    }
}