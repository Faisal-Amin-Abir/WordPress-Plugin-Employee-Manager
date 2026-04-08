<?php
namespace EmployeeManager\Models;

class Employee {

    private $wpdb;
    private $table_name;

    public function __construct() {
        global $wpdb;
        $this->wpdb = $wpdb;
        $this->table_name = $wpdb->prefix . 'employee_manager';   // Fixed: Direct table name
    }

    /**
     * Get all employees with pagination and filtering
     * 
     * @param array|int $per_page Array of params or number of items per page (for backward compatibility)
     * @param int $page Page number (ignored if first param is array)
     */
    public function get_all( $per_page = 20, $page = 1 ) {
        $search = '';
        $department = '';
        $status = '';
        $sort_by = 'id';
        $sort_order = 'DESC';

        // Handle array parameter (modern approach)
        if ( is_array( $per_page ) ) {
            $params = $per_page;
            $per_page = (int) ( $params['per_page'] ?? 20 );
            $page = (int) ( $params['page'] ?? 1 );
            $search = sanitize_text_field( $params['search'] ?? '' );
            $department = sanitize_text_field( $params['department'] ?? '' );
            $status = sanitize_text_field( $params['status'] ?? '' );
            $sort_by = sanitize_key( $params['sort_by'] ?? 'id' );
            $sort_order = strtoupper( sanitize_key( $params['sort_order'] ?? 'DESC' ) );
            
            // Validate sort_by to prevent SQL injection
            $allowed_cols = ['id', 'full_name', 'email', 'department', 'date_joined', 'status', 'created_at'];
            if ( ! in_array( $sort_by, $allowed_cols, true ) ) {
                $sort_by = 'id';
            }
            
            // Validate sort_order
            if ( ! in_array( $sort_order, ['ASC', 'DESC'], true ) ) {
                $sort_order = 'DESC';
            }
        } else {
            // Handle individual parameters (backward compatibility)
            $per_page = (int) $per_page;
            $page = (int) $page;
        }

        $offset = ( $page - 1 ) * $per_page;
        $where_clauses = [];
        $where_values = [];

        // Build WHERE clause for filters
        if ( ! empty( $search ) ) {
            $where_clauses[] = "(full_name LIKE %s OR email LIKE %s)";
            $search_term = '%' . $this->wpdb->esc_like( $search ) . '%';
            $where_values[] = $search_term;
            $where_values[] = $search_term;
        }

        if ( ! empty( $department ) ) {
            $where_clauses[] = "department = %s";
            $where_values[] = $department;
        }

        if ( ! empty( $status ) ) {
            $where_clauses[] = "status = %s";
            $where_values[] = $status;
        }

        $where_sql = ! empty( $where_clauses ) ? 'WHERE ' . implode( ' AND ', $where_clauses ) : '';

        // Get results - use dynamic sorting
        $query = "SELECT * FROM {$this->table_name} {$where_sql} ORDER BY {$sort_by} {$sort_order} LIMIT %d OFFSET %d";
        $prepared_query = $this->wpdb->prepare( $query, array_merge( $where_values, [ $per_page, $offset ] ) );
        $results = $this->wpdb->get_results( $prepared_query );

        // Add profile photo URL for frontend
        foreach ( $results as $employee ) {
            if ( ! empty( $employee->profile_photo_id ) ) {
                $employee->profile_photo_url = wp_get_attachment_url( $employee->profile_photo_id );
            } else {
                $employee->profile_photo_url = null;
            }
        }

        // Get total count with filters (filtered count)
        $count_query = "SELECT COUNT(*) FROM {$this->table_name} {$where_sql}";
        $total = (int) $this->wpdb->get_var( $this->wpdb->prepare( $count_query, $where_values ) );

        // Get total count without filters (total in database)
        $total_database_query = "SELECT COUNT(*) FROM {$this->table_name}";
        $total_database = (int) $this->wpdb->get_var( $total_database_query );

        return [
            'items'           => $results,
            'total'           => $total,
            'total_database'  => $total_database,
            'per_page'        => $per_page,
            'page'            => $page,
            'total_pages'     => ceil( $total / $per_page ),
            'sort_by'         => $sort_by,
            'sort_order'      => $sort_order
        ];
    }

    /**
     * Get single employee by ID
     */
    public function get_by_id( $id ) {
        $employee = $this->wpdb->get_row( $this->wpdb->prepare(
            "SELECT * FROM {$this->table_name} WHERE id = %d",
            $id
        ) );

        if ( $employee && ! empty( $employee->profile_photo_id ) ) {
            $employee->profile_photo_url = wp_get_attachment_url( $employee->profile_photo_id );
        }

        return $employee;
    }

    /**
     * Create new employee
     */
    public function create( $data ) {
        $result = $this->wpdb->insert( $this->table_name, [
            'full_name'       => sanitize_text_field( $data['full_name'] ?? '' ),
            'email'           => sanitize_email( $data['email'] ?? '' ),
            'phone'           => sanitize_text_field( $data['phone'] ?? '' ),
            'department'      => sanitize_text_field( $data['department'] ?? null ),
            'job_title'       => sanitize_text_field( $data['job_title'] ?? '' ),
            'salary'          => isset( $data['salary'] ) ? floatval( $data['salary'] ) : null,
            'date_joined'     => sanitize_text_field( $data['date_joined'] ?? null ),
            'profile_photo_id'=> isset( $data['profile_photo_id'] ) ? intval( $data['profile_photo_id'] ) : null,
            'status'          => sanitize_text_field( $data['status'] ?? 'active' ),
        ] );

        return $result ? $this->wpdb->insert_id : false;
    }

    /**
     * Update employee
     */
    public function update( $id, $data ) {
        $result = $this->wpdb->update( $this->table_name, [
            'full_name'       => sanitize_text_field( $data['full_name'] ?? '' ),
            'email'           => sanitize_email( $data['email'] ?? '' ),
            'phone'           => sanitize_text_field( $data['phone'] ?? '' ),
            'department'      => sanitize_text_field( $data['department'] ?? null ),
            'job_title'       => sanitize_text_field( $data['job_title'] ?? '' ),
            'salary'          => isset( $data['salary'] ) ? floatval( $data['salary'] ) : null,
            'date_joined'     => sanitize_text_field( $data['date_joined'] ?? null ),
            'profile_photo_id'=> isset( $data['profile_photo_id'] ) ? intval( $data['profile_photo_id'] ) : null,
            'status'          => sanitize_text_field( $data['status'] ?? 'active' ),
        ], [ 'id' => $id ] );

        return $result !== false;
    }

    /**
     * Delete employee
     */
    public function delete( $id ) {
        return $this->wpdb->delete( $this->table_name, [ 'id' => $id ] );
    }

    /**
     * Bulk actions (delete or status change)
     */
    public function bulk_action( $ids, $action, $status = null ) {
        if ( empty( $ids ) ) {
            return false;
        }

        if ( $action === 'delete' ) {
            $placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
            return $this->wpdb->query( $this->wpdb->prepare(
                "DELETE FROM {$this->table_name} WHERE id IN ($placeholders)",
                ...$ids
            ) );
        } elseif ( $action === 'status' && $status ) {
            $placeholders = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
            $prepare_args = array_merge( [ $status ], $ids );
            return $this->wpdb->query( $this->wpdb->prepare(
                "UPDATE {$this->table_name} SET status = %s WHERE id IN ($placeholders)",
                ...$prepare_args
            ) );
        }

        return false;
    }
}