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
        add_action( 'plugins_loaded', [ $this, 'load_components' ] );
    }

    public function load_components() {
        $this->db_manager = new DatabaseManager();
        $this->rest_api   = new \EmployeeManager\API\RestController();
        $this->admin      = new \EmployeeManager\Admin\EmployeeAdmin();
        $this->settings   = new \EmployeeManager\Settings\Settings();   

        error_log( 'Employee Manager: Admin UI loaded' );
    }
}