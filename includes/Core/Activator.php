<?php
namespace EmployeeManager\Core;

use EmployeeManager\Database\Manager as DatabaseManager;

class Activator {

    public static function activate() {
        error_log( 'Employee Manager Activation Hook Triggered' );

        $db_manager = new DatabaseManager();
        $db_manager->create_table();

        flush_rewrite_rules();
    }
}