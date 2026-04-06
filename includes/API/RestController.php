<?php
namespace EmployeeManager\API;

use EmployeeManager\Models\Employee;
use EmployeeManager\Core\Capabilities;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

class RestController {

    private $employee_model;

    public function __construct() {
        $this->employee_model = new Employee();

        add_action( 'rest_api_init', [ $this, 'register_routes' ] );
    }

    /**
     * Register all REST routes
     */
    public function register_routes() {
        $namespace = 'employee-manager/v1';

        // GET /employees - List with pagination, search, filters
        register_rest_route( $namespace, '/employees', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_employees' ],
                'permission_callback' => [ $this, 'check_permission' ],
                'args'                => $this->get_collection_params(),
            ]
        ]);

        // POST /employees - Create new employee
        register_rest_route( $namespace, '/employees', [
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'create_employee' ],
                'permission_callback' => [ $this, 'check_permission' ],
            ]
        ]);

        // GET /employees/{id} - Get single employee
        register_rest_route( $namespace, '/employees/(?P<id>\d+)', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_employee' ],
                'permission_callback' => [ $this, 'check_permission' ],
            ]
        ]);

        // PUT /employees/{id} - Update employee
        register_rest_route( $namespace, '/employees/(?P<id>\d+)', [
            [
                'methods'             => 'PUT',
                'callback'            => [ $this, 'update_employee' ],
                'permission_callback' => [ $this, 'check_permission' ],
            ]
        ]);

        // DELETE /employees/{id} - Delete employee
        register_rest_route( $namespace, '/employees/(?P<id>\d+)', [
            [
                'methods'             => 'DELETE',
                'callback'            => [ $this, 'delete_employee' ],
                'permission_callback' => [ $this, 'check_permission' ],
            ]
        ]);

        // Bulk actions
        register_rest_route( $namespace, '/employees/bulk', [
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'bulk_action' ],
                'permission_callback' => [ $this, 'check_permission' ],
            ]
        ]);
    }

    /**
     * Permission check (Admin + HR Manager can manage, others view only)
     */
    public function check_permission( $request ) {
        $method = $request->get_method();

        if ( in_array( $method, ['GET'], true ) ) {
            return current_user_can( 'read' ); // Anyone logged in can view
        }

        // Create, Update, Delete require higher permission
        return current_user_can( 'manage_options' ) || current_user_can( Capabilities::MANAGE_EMPLOYEES );
    }

    /**
     * GET /employees - List employees
     */
    public function get_employees( WP_REST_Request $request ) {
        $params = [
            'per_page'   => $request->get_param( 'per_page' ) ?? 20,
            'page'       => $request->get_param( 'page' ) ?? 1,
            'search'     => $request->get_param( 'search' ) ?? '',
            'department' => $request->get_param( 'department' ) ?? '',
            'status'     => $request->get_param( 'status' ) ?? '',
            'orderby'    => $request->get_param( 'orderby' ) ?? 'id',
            'order'      => strtoupper( $request->get_param( 'order' ) ?? 'DESC' ),
        ];

        $result = $this->employee_model->get_all( $params );

        return new WP_REST_Response( [
            'success' => true,
            'data'    => $result['items'],
            'total'   => $result['total'],
            'pages'   => $result['total_pages'],
            'per_page'=> $result['per_page'],
            'page'    => $result['page'],
        ], 200 );
    }

    /**
     * POST /employees - Create employee
     */
    public function create_employee( WP_REST_Request $request ) {
        $data = $request->get_json_params();

        if ( empty( $data['full_name'] ) || empty( $data['email'] ) ) {
            return new WP_REST_Response( [
                'success' => false,
                'message' => 'Full name and email are required.'
            ], 400 );
        }

        $result = $this->employee_model->create( $data );

        if ( ! $result ) {
            return new WP_REST_Response( [
                'success' => false,
                'message' => 'Failed to create employee. Please check your data.'
            ], 400 );
        }

        $employee = $this->employee_model->get_by_id( $result );

        return new WP_REST_Response( [
            'success' => true,
            'message' => 'Employee created successfully.',
            'data'    => $employee
        ], 201 );
    }

    /**
     * GET /employees/{id}
     */
    public function get_employee( WP_REST_Request $request ) {
        $id = (int) $request['id'];
        $employee = $this->employee_model->get_by_id( $id );

        if ( ! $employee ) {
            return new WP_REST_Response( [
                'success' => false,
                'message' => 'Employee not found.'
            ], 404 );
        }

        return new WP_REST_Response( [
            'success' => true,
            'data'    => $employee
        ], 200 );
    }

    /**
     * PUT /employees/{id}
     */
    public function update_employee( WP_REST_Request $request ) {
        $id   = (int) $request['id'];
        $data = $request->get_json_params();

        // Verify employee exists
        $existing = $this->employee_model->get_by_id( $id );
        if ( ! $existing ) {
            return new WP_REST_Response( [
                'success' => false,
                'message' => 'Employee not found.'
            ], 404 );
        }

        $result = $this->employee_model->update( $id, $data );

        if ( ! $result ) {
            return new WP_REST_Response( [
                'success' => false,
                'message' => 'Failed to update employee.'
            ], 400 );
        }

        $employee = $this->employee_model->get_by_id( $id );

        return new WP_REST_Response( [
            'success' => true,
            'message' => 'Employee updated successfully.',
            'data'    => $employee
        ], 200 );
    }

    /**
     * DELETE /employees/{id}
     */
    public function delete_employee( WP_REST_Request $request ) {
        $id = (int) $request['id'];

        $result = $this->employee_model->delete( $id );

        if ( ! $result ) {
            return new WP_REST_Response( [
                'success' => false,
                'message' => 'Failed to delete employee.'
            ], 400 );
        }

        return new WP_REST_Response( [
            'success' => true,
            'message' => 'Employee deleted successfully.'
        ], 200 );
    }

    /**
     * Collection parameters for DataViews
     */
    private function get_collection_params() {
        return [
            'per_page' => [
                'default'           => 20,
                'sanitize_callback' => 'absint',
            ],
            'page' => [
                'default'           => 1,
                'sanitize_callback' => 'absint',
            ],
            'search' => [
                'default'           => '',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'department' => [
                'default'           => '',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'status' => [
                'default'           => '',
                'sanitize_callback' => 'sanitize_text_field',
            ],
        ];
    }

    /**
     * Bulk actions (DELETE or change status)
     */
    public function bulk_action( WP_REST_Request $request ) {
        $data = $request->get_json_params();

        if ( empty( $data['action'] ) || empty( $data['ids'] ) || ! is_array( $data['ids'] ) ) {
            return new WP_REST_Response( [
                'success' => false,
                'message' => 'Invalid bulk action data.'
            ], 400 );
        }

        $employee_model = new \EmployeeManager\Models\Employee();
        $action = sanitize_text_field( $data['action'] );
        $ids = array_map( 'absint', $data['ids'] );

        $success = false;

        if ( $action === 'delete' ) {
            $success = $employee_model->bulk_action( $ids, 'delete' );
        } elseif ( $action === 'status' && ! empty( $data['status'] ) ) {
            $status = sanitize_text_field( $data['status'] );
            $success = $employee_model->bulk_action( $ids, 'status', $status );
        }

        if ( $success ) {
            return new WP_REST_Response( [
                'success' => true,
                'message' => 'Bulk action completed successfully.'
            ], 200 );
        }

        return new WP_REST_Response( [
            'success' => false,
            'message' => 'Bulk action failed.'
        ], 400 );
    }
}