<?php
namespace EmployeeManager\Core;

/**
 * Field Schema Definition
 * 
 * Defines all available fields for the employee manager plugin
 * This acts as a single source of truth for field configuration
 */
class FieldSchema {

    /**
     * Get all field definitions
     */
    public static function get_fields() {
        return [
            'id' => [
                'name'        => 'id',
                'label'       => 'ID',
                'type'        => 'number',
                'editable'    => false,
                'sortable'    => true,
                'searchable'  => false,
                'filterable'  => false,
                'visible'     => true,
                'required'    => false,
                'description' => 'Employee ID',
            ],
            'full_name' => [
                'name'        => 'full_name',
                'label'       => 'Full Name',
                'type'        => 'text',
                'editable'    => true,
                'sortable'    => true,
                'searchable'  => true,
                'filterable'  => false,
                'visible'     => true,
                'required'    => true,
                'placeholder' => 'Enter full name',
                'description' => 'Employee full name',
                'validation'  => [
                    'minLength' => 2,
                    'maxLength' => 255,
                ],
            ],
            'email' => [
                'name'        => 'email',
                'label'       => 'Email',
                'type'        => 'email',
                'editable'    => true,
                'sortable'    => true,
                'searchable'  => true,
                'filterable'  => false,
                'visible'     => true,
                'required'    => true,
                'placeholder' => 'Enter email address',
                'description' => 'Employee email address',
                'validation'  => [
                    'type' => 'email',
                ],
            ],
            'phone' => [
                'name'        => 'phone',
                'label'       => 'Phone',
                'type'        => 'tel',
                'editable'    => true,
                'sortable'    => false,
                'searchable'  => true,
                'filterable'  => false,
                'visible'     => true,
                'required'    => false,
                'placeholder' => 'Enter phone number',
                'description' => 'Employee phone number',
            ],
            'department' => [
                'name'        => 'department',
                'label'       => 'Department',
                'type'        => 'select',
                'editable'    => true,
                'sortable'    => true,
                'searchable'  => false,
                'filterable'  => true,
                'visible'     => true,
                'required'    => false,
                'description' => 'Department',
                'options'     => [
                    ['label' => 'HR', 'value' => 'HR'],
                    ['label' => 'Engineering', 'value' => 'Engineering'],
                    ['label' => 'Marketing', 'value' => 'Marketing'],
                    ['label' => 'Sales', 'value' => 'Sales'],
                    ['label' => 'Finance', 'value' => 'Finance'],
                    ['label' => 'Operations', 'value' => 'Operations'],
                    ['label' => 'Other', 'value' => 'Other'],
                ],
            ],
            'job_title' => [
                'name'        => 'job_title',
                'label'       => 'Job Title',
                'type'        => 'text',
                'editable'    => true,
                'sortable'    => false,
                'searchable'  => true,
                'filterable'  => false,
                'visible'     => true,
                'required'    => false,
                'placeholder' => 'Enter job title',
                'description' => 'Employee job title',
            ],
            'salary' => [
                'name'        => 'salary',
                'label'       => 'Salary',
                'type'        => 'number',
                'editable'    => true,
                'sortable'    => true,
                'searchable'  => false,
                'filterable'  => false,
                'visible'     => true,
                'required'    => false,
                'placeholder' => 'Enter salary',
                'description' => 'Annual salary',
                'validation'  => [
                    'min' => 0,
                ],
            ],
            'date_joined' => [
                'name'        => 'date_joined',
                'label'       => 'Date Joined',
                'type'        => 'date',
                'editable'    => true,
                'sortable'    => true,
                'searchable'  => false,
                'filterable'  => true,
                'visible'     => true,
                'required'    => false,
                'description' => 'Date employee joined',
            ],
            'profile_photo_id' => [
                'name'        => 'profile_photo_id',
                'label'       => 'Profile Photo',
                'type'        => 'media',
                'editable'    => true,
                'sortable'    => false,
                'searchable'  => false,
                'filterable'  => false,
                'visible'     => true,
                'required'    => false,
                'description' => 'Profile photo attachment ID',
            ],
            'status' => [
                'name'        => 'status',
                'label'       => 'Status',
                'type'        => 'select',
                'editable'    => true,
                'sortable'    => true,
                'searchable'  => false,
                'filterable'  => true,
                'visible'     => true,
                'required'    => true,
                'description' => 'Employee status (active/inactive)',
                'options'     => [
                    ['label' => 'Active', 'value' => 'active'],
                    ['label' => 'Inactive', 'value' => 'inactive'],
                ],
            ],
            'created_at' => [
                'name'        => 'created_at',
                'label'       => 'Created At',
                'type'        => 'datetime',
                'editable'    => false,
                'sortable'    => true,
                'searchable'  => false,
                'filterable'  => false,
                'visible'     => true,
                'required'    => false,
                'description' => 'Record creation date',
            ],
            'updated_at' => [
                'name'        => 'updated_at',
                'label'       => 'Updated At',
                'type'        => 'datetime',
                'editable'    => false,
                'sortable'    => true,
                'searchable'  => false,
                'filterable'  => false,
                'visible'     => true,
                'required'    => false,
                'description' => 'Record update date',
            ],
        ];
    }

    /**
     * Get specific field definition
     */
    public static function get_field( $field_name ) {
        $fields = self::get_fields();
        return $fields[ $field_name ] ?? null;
    }

    /**
     * Get only editable fields (for forms)
     */
    public static function get_editable_fields() {
        return array_filter( self::get_fields(), function( $field ) {
            return $field['editable'] === true;
        });
    }

    /**
     * Get only visible fields (for display)
     */
    public static function get_visible_fields() {
        return array_filter( self::get_fields(), function( $field ) {
            return $field['visible'] === true;
        });
    }

    /**
     * Get searchable fields
     */
    public static function get_searchable_fields() {
        return array_filter( self::get_fields(), function( $field ) {
            return $field['searchable'] === true;
        });
    }

    /**
     * Get filterable fields
     */
    public static function get_filterable_fields() {
        return array_filter( self::get_fields(), function( $field ) {
            return $field['filterable'] === true;
        });
    }

    /**
     * Get sortable fields
     */
    public static function get_sortable_fields() {
        return array_filter( self::get_fields(), function( $field ) {
            return $field['sortable'] === true;
        });
    }

    /**
     * Get field options (for select fields)
     */
    public static function get_field_options( $field_name ) {
        $field = self::get_field( $field_name );
        return $field['options'] ?? null;
    }
}
