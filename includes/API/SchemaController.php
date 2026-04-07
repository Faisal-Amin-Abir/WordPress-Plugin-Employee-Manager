<?php
namespace EmployeeManager\API;

use EmployeeManager\Core\FieldSchema;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Schema REST Controller
 * 
 * Exposes field definitions via REST API
 * Allows frontend to consume schema dynamically
 */
class SchemaController {

    public function __construct() {
        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    /**
     * Register schema routes
     */
    public function register_routes() {
        $namespace = 'employee-manager/v1';

        // GET /employee-manager/v1/schema - Get all fields
        register_rest_route( $namespace, '/schema', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_schema' ],
                'permission_callback' => [ $this, 'check_read_permission' ],
            ]
        ]);

        // GET /employee-manager/v1/schema/editable - Get only editable fields
        register_rest_route( $namespace, '/schema/editable', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_editable_schema' ],
                'permission_callback' => [ $this, 'check_read_permission' ],
            ]
        ]);

        // GET /employee-manager/v1/schema/fields/{field_name} - Get specific field
        register_rest_route( $namespace, '/schema/fields/(?P<field_name>[a-z_]+)', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_field_schema' ],
                'permission_callback' => [ $this, 'check_read_permission' ],
            ]
        ]);
    }

    /**
     * Permission check for read access
     */
    public function check_read_permission() {
        return current_user_can( 'read' ); // Anyone logged in can view schema
    }

    /**
     * GET /schema - Get all field definitions
     */
    public function get_schema() {
        return new WP_REST_Response( [
            'success' => true,
            'data'    => FieldSchema::get_fields()
        ], 200 );
    }

    /**
     * GET /schema/editable - Get only editable fields
     */
    public function get_editable_schema() {
        return new WP_REST_Response( [
            'success' => true,
            'data'    => FieldSchema::get_editable_fields()
        ], 200 );
    }

    /**
     * GET /schema/fields/{field_name} - Get specific field
     */
    public function get_field_schema( WP_REST_Request $request ) {
        $field_name = sanitize_text_field( $request['field_name'] );
        $field = FieldSchema::get_field( $field_name );

        if ( ! $field ) {
            return new WP_REST_Response( [
                'success' => false,
                'message' => 'Field not found.'
            ], 404 );
        }

        return new WP_REST_Response( [
            'success' => true,
            'data'    => $field
        ], 200 );
    }
}
