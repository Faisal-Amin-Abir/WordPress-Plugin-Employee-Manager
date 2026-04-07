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
        if ( ! get_role( 'hr_manager' ) ) {
            $role = add_role(
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
            
            if ( $role ) {
                error_log( 'Employee Manager: HR Manager role created successfully' );
            } else {
                error_log( 'Employee Manager: Failed to create HR Manager role' );
            }
        } else {
            error_log( 'Employee Manager: HR Manager role already exists' );
        }

        // Employee Viewer - View only
        if ( ! get_role( 'employee_viewer' ) ) {
            $role = add_role(
                'employee_viewer',
                'Employee Viewer',
                [
                    self::VIEW_EMPLOYEES => true,
                    'read'               => true,
                ]
            );
            
            if ( $role ) {
                error_log( 'Employee Manager: Employee Viewer role created successfully' );
            } else {
                error_log( 'Employee Manager: Failed to create Employee Viewer role' );
            }
        } else {
            error_log( 'Employee Manager: Employee Viewer role already exists' );
        }

        // Grant HR Manager capabilities to Administrator
        self::grant_capabilities_to_admin();
    }

    /**
     * Remove roles on plugin deactivation
     * This ensures users with these roles cannot access WordPress while plugin is deactivated
     */
    public static function remove_roles() {
        error_log( 'Employee Manager: Attempting to remove custom roles...' );
        
        // Remove HR Manager role
        if ( get_role( 'hr_manager' ) ) {
            remove_role( 'hr_manager' );
            error_log( 'Employee Manager: HR Manager role removed' );
        } else {
            error_log( 'Employee Manager: HR Manager role not found (already removed)' );
        }
        
        // Remove Employee Viewer role
        if ( get_role( 'employee_viewer' ) ) {
            remove_role( 'employee_viewer' );
            error_log( 'Employee Manager: Employee Viewer role removed' );
        } else {
            error_log( 'Employee Manager: Employee Viewer role not found (already removed)' );
        }
        
        error_log( 'Employee Manager: Role removal process completed' );
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

    /**
     * Grant HR Manager capabilities to Administrator role
     */
    public static function grant_capabilities_to_admin() {
        $admin_role = get_role( 'administrator' );
        
        if ( $admin_role ) {
            // Grant custom capabilities
            $admin_role->add_cap( self::MANAGE_EMPLOYEES );
            $admin_role->add_cap( self::VIEW_EMPLOYEES );
            
            // Grant media-related capabilities if not already present
            if ( ! $admin_role->has_cap( 'upload_files' ) ) {
                $admin_role->add_cap( 'upload_files' );
            }
            if ( ! $admin_role->has_cap( 'edit_posts' ) ) {
                $admin_role->add_cap( 'edit_posts' );
            }
            if ( ! $admin_role->has_cap( 'read_private_posts' ) ) {
                $admin_role->add_cap( 'read_private_posts' );
            }
            if ( ! $admin_role->has_cap( 'edit_private_posts' ) ) {
                $admin_role->add_cap( 'edit_private_posts' );
            }
            if ( ! $admin_role->has_cap( 'delete_posts' ) ) {
                $admin_role->add_cap( 'delete_posts' );
            }
            
            error_log( 'Employee Manager: Capabilities granted to Administrator role' );
        } else {
            error_log( 'Employee Manager: Administrator role not found' );
        }
    }
}