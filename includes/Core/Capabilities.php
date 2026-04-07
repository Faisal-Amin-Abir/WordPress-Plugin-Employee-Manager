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
                    self::MANAGE_EMPLOYEES  => true,
                    self::VIEW_EMPLOYEES    => true,
                    'read'                  => true,
                    'upload_files'          => true,
                    'edit_posts'            => true,
                    'read_private_posts'    => true,
                    'edit_private_posts'    => true,
                    'delete_posts'          => true,
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

    /**
     * Register media access hooks for HR Manager
     */
    public static function register_media_permissions() {
        // Allow HR Manager to read/access media/attachments via REST API
        add_filter( 'rest_check_read_post_type_posts_permission_for_context', [ __CLASS__, 'allow_media_library_access' ], 10, 3 );
        add_filter( 'rest_prepare_attachment', [ __CLASS__, 'allow_attachment_access' ], 10, 3 );
        
        // Allow HR Manager to query and see all media items in the media library
        add_filter( 'posts_where', [ __CLASS__, 'allow_media_posts_query' ], 10, 2 );
    }

    /**
     * Allow HR Manager to read attachment posts
     */
    public static function allow_media_library_access( $allowed, $post_type, $context ) {
        if ( 'attachment' === $post_type && 'view' === $context ) {
            if ( self::can_manage() || current_user_can( 'upload_files' ) ) {
                return true;
            }
        }
        return $allowed;
    }

    /**
     * Allow HR Manager to see attachment data
     */
    public static function allow_attachment_access( $response, $attachment, $request ) {
        if ( self::can_manage() || current_user_can( 'upload_files' ) ) {
            return $response;
        }
        return $response;
    }

    /**
     * Modify SQL query to allow HR Manager to see all media items
     */
    public static function allow_media_posts_query( $where, $query ) {
        global $wpdb;
        
        // Only apply to attachment queries in the admin
        if ( is_admin() && isset( $query->query_vars['post_type'] ) ) {
            if ( 'attachment' === $query->query_vars['post_type'] ) {
                if ( self::can_manage() && ! current_user_can( 'manage_options' ) ) {
                    // HR Manager - show all media items regardless of author
                    // Remove the "post_author = current_user_id" restriction
                    $user_id = get_current_user_id();
                    $where = str_replace( 
                        $wpdb->prepare( "AND {$wpdb->posts}.post_author = %d", $user_id ),
                        "",
                        $where
                    );
                }
            }
        }
        
        return $where;
    }
}