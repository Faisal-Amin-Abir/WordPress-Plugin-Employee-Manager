<?php
namespace EmployeeManager\Models;

use EmployeeManager\Database\Manager as DatabaseManager;

class Employee {

    private $db;
    private $table_name;

    public function __construct() {
        global $wpdb;
        $this->db         = $wpdb;
        $this->table_name = (new DatabaseManager())->get_table_name();
    }

    /**
     * Create new employee
     */
    public function create( array $data ) {
        $defaults = [
            'full_name'        => '',
            'email'            => '',
            'phone'            => '',
            'department'       => null,
            'job_title'        => '',
            'salary'           => null,
            'date_joined'      => null,
            'profile_photo_id' => 0,
            'status'           => 'active'
        ];

        $data = wp_parse_args( $data, $defaults );

        // Validation
        if ( empty( $data['full_name'] ) || empty( $data['email'] ) ) {
            return new \WP_Error( 'missing_required', 'Full Name and Email are required.' );
        }

        if ( ! is_email( $data['email'] ) ) {
            return new \WP_Error( 'invalid_email', 'Please provide a valid email address.' );
        }

        $insert_data = [
            'full_name'        => sanitize_text_field( $data['full_name'] ),
            'email'            => sanitize_email( $data['email'] ),
            'phone'            => sanitize_text_field( $data['phone'] ),
            'department'       => sanitize_text_field( $data['department'] ),
            'job_title'        => sanitize_text_field( $data['job_title'] ),
            'salary'           => is_numeric( $data['salary'] ) ? floatval( $data['salary'] ) : null,
            'date_joined'      => ! empty( $data['date_joined'] ) ? sanitize_text_field( $data['date_joined'] ) : null,
            'profile_photo_id' => absint( $data['profile_photo_id'] ),
            'status'           => in_array( $data['status'], ['active', 'inactive'], true ) ? $data['status'] : 'active',
        ];

        $formats = [ '%s', '%s', '%s', '%s', '%s', '%f', '%s', '%d', '%s' ];

        $result = $this->db->insert( $this->table_name, $insert_data, $formats );

        if ( $result ) {
            return $this->db->insert_id;
        }

        return new \WP_Error( 'insert_failed', 'Failed to create employee record.' );
    }

    /**
     * Get single employee by ID
     */
    public function get_by_id( int $id ) {
        $id = absint( $id );
        $row = $this->db->get_row( $this->db->prepare(
            "SELECT * FROM {$this->table_name} WHERE id = %d",
            $id
        ) );

        if ( $row && $row->profile_photo_id ) {
            $row->profile_photo_url = wp_get_attachment_url( $row->profile_photo_id );
        }

        return $row;
    }

    /**
     * Get employees with search, filter, sort & pagination
     */
    public function get_all( array $args = [] ) {
        $defaults = [
            'per_page'   => 20,
            'page'       => 1,
            'search'     => '',
            'department' => '',
            'status'     => '',
            'orderby'    => 'id',
            'order'      => 'DESC'
        ];

        $args   = wp_parse_args( $args, $defaults );
        $offset = ( $args['page'] - 1 ) * $args['per_page'];

        $where  = [];
        $params = [];

        if ( ! empty( $args['search'] ) ) {
            $search = '%' . $this->db->esc_like( $args['search'] ) . '%';
            $where[] = "(full_name LIKE %s OR email LIKE %s)";
            $params[] = $search;
            $params[] = $search;
        }

        if ( ! empty( $args['department'] ) ) {
            $where[] = "department = %s";
            $params[] = sanitize_text_field( $args['department'] );
        }

        if ( ! empty( $args['status'] ) ) {
            $where[] = "status = %s";
            $params[] = sanitize_text_field( $args['status'] );
        }

        $where_sql = ! empty( $where ) ? 'WHERE ' . implode( ' AND ', $where ) : '';

        // Get total count
        $count_sql = "SELECT COUNT(*) FROM {$this->table_name} {$where_sql}";
        $total     = $this->db->get_var( ! empty( $params ) ? $this->db->prepare( $count_sql, $params ) : $count_sql );

        // Main query
        $sql = "SELECT * FROM {$this->table_name} {$where_sql}
                ORDER BY {$args['orderby']} {$args['order']}
                LIMIT %d OFFSET %d";

        $query_params   = $params;
        $query_params[] = absint( $args['per_page'] );
        $query_params[] = absint( $offset );

        $results = $this->db->get_results( $this->db->prepare( $sql, $query_params ) );

        // Add full image URL for each employee
        foreach ( $results as $row ) {
            if ( ! empty( $row->profile_photo_id ) ) {
                $row->profile_photo_url = wp_get_attachment_url( $row->profile_photo_id );
            } else {
                $row->profile_photo_url = null;
            }
        }

        return [
            'items'       => $results ?: [],
            'total'       => (int) $total,
            'per_page'    => (int) $args['per_page'],
            'page'        => (int) $args['page'],
            'total_pages' => $total > 0 ? ceil( $total / $args['per_page'] ) : 0,
        ];
    }

    /**
     * Update employee
     */
    public function update( int $id, array $data ) {
        $id = absint( $id );

        $update_data = [];
        $formats     = [];

        $allowed = ['full_name', 'email', 'phone', 'department', 'job_title', 'salary', 'date_joined', 'profile_photo_id', 'status'];

        foreach ( $allowed as $field ) {
            if ( isset( $data[$field] ) ) {
                switch ( $field ) {
                    case 'email':
                        if ( ! is_email( $data[$field] ) ) {
                            return new \WP_Error( 'invalid_email', 'Invalid email address.' );
                        }
                        $update_data[$field] = sanitize_email( $data[$field] );
                        $formats[] = '%s';
                        break;

                    case 'salary':
                        $update_data[$field] = is_numeric( $data[$field] ) ? floatval( $data[$field] ) : null;
                        $formats[] = '%f';
                        break;

                    case 'profile_photo_id':
                        $update_data[$field] = absint( $data[$field] );
                        $formats[] = '%d';
                        break;

                    case 'status':
                        $status = $data[$field];
                        $update_data[$field] = in_array( $status, ['active', 'inactive'] ) ? $status : 'active';
                        $formats[] = '%s';
                        break;

                    default:
                        $update_data[$field] = sanitize_text_field( $data[$field] );
                        $formats[] = '%s';
                }
            }
        }

        if ( empty( $update_data ) ) {
            return new \WP_Error( 'no_data', 'No data provided to update.' );
        }

        $result = $this->db->update(
            $this->table_name,
            $update_data,
            ['id' => $id],
            $formats,
            ['%d']
        );

        return $result !== false ? true : new \WP_Error( 'update_failed', 'Failed to update employee.' );
    }

    /**
     * Delete single employee
     */
    public function delete( int $id ) {
        $id = absint( $id );
        return (bool) $this->db->delete( $this->table_name, ['id' => $id], ['%d'] );
    }

    /**
     * Bulk actions (delete or change status)
     */
    public function bulk_action( array $ids, string $action, string $value = null ) {
        $ids = array_map( 'absint', $ids );
        $success = true;

        if ( $action === 'delete' ) {
            foreach ( $ids as $id ) {
                if ( ! $this->delete( $id ) ) {
                    $success = false;
                }
            }
        } elseif ( $action === 'status' && in_array( $value, ['active', 'inactive'] ) ) {
            foreach ( $ids as $id ) {
                if ( ! $this->update( $id, ['status' => $value] ) ) {
                    $success = false;
                }
            }
        }

        return $success;
    }

}