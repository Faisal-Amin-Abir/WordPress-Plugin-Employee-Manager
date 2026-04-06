<?php
namespace EmployeeManager\Core;

class Capabilities {

    /**
     * Custom capabilities for the plugin
     */
    public const MANAGE_EMPLOYEES = 'manage_employee_manager';
    public const VIEW_EMPLOYEES   = 'view_employee_manager';

    /**
     * Create custom roles during plugin activation
     */
    public static function create_roles() {
        // HR Manager - Full access
        if (!get_role('hr_manager')) {
            add_role(
                'hr_manager',
                'HR Manager',
                [
                    self::MANAGE_EMPLOYEES => true,
                    self::VIEW_EMPLOYEES   => true,
                    'read'                 => true,
                ]
            );
        }

        // Employee Viewer - View only
        if (!get_role('employee_viewer')) {
            add_role(
                'employee_viewer',
                'Employee Viewer',
                [
                    self::VIEW_EMPLOYEES => true,
                    'read'               => true,
                ]
            );
        }
    }

    /**
     * Remove roles on plugin deactivation (optional)
     */
    public static function remove_roles() {
        remove_role('hr_manager');
        remove_role('employee_viewer');
    }

    /**
     * Check if current user has full management rights
     */
    public static function can_manage() {
        return current_user_can(self::MANAGE_EMPLOYEES);
    }

    /**
     * Check if current user can at least view
     */
    public static function can_view() {
        return current_user_can(self::VIEW_EMPLOYEES);
    }
}