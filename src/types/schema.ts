/**
 * Schema Type Definitions
 * 
 * Defines TypeScript interfaces for field schema and validation
 */

export type FieldType = 
    | 'text' 
    | 'email' 
    | 'tel' 
    | 'number' 
    | 'date' 
    | 'datetime' 
    | 'select' 
    | 'media' 
    | 'textarea' 
    | 'checkbox' 
    | 'radio';

export interface FieldOption {
    label: string;
    value: string | number;
}

export interface FieldValidation {
    type?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
}

export interface FieldDefinition {
    name: string;
    label: string;
    type: FieldType;
    editable: boolean;
    sortable: boolean;
    searchable: boolean;
    filterable: boolean;
    visible: boolean;
    required: boolean;
    placeholder?: string;
    description?: string;
    validation?: FieldValidation;
    options?: FieldOption[];
}

export interface FormSchema {
    [fieldName: string]: FieldDefinition;
}

export interface SchemaResponse {
    success: boolean;
    data: FormSchema;
    message?: string;
}
