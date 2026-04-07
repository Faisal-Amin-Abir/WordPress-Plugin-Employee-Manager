/**
 * Schema Parser Utilities
 * 
 * Provides utility functions to parse, validate, and manipulate schema
 */

import { FieldDefinition, FormSchema, FieldValidation } from '../types/schema';

/**
 * Filter schema by property value
 */
export const filterSchemaBy = (
    schema: FormSchema,
    property: keyof FieldDefinition,
    value: any
): FormSchema => {
    return Object.entries(schema).reduce((acc, [key, field]) => {
        if (field[property] === value) {
            acc[key] = field;
        }
        return acc;
    }, {} as FormSchema);
};

/**
 * Get only editable fields from schema
 */
export const getEditableFields = (schema: FormSchema): FormSchema => {
    return filterSchemaBy(schema, 'editable', true);
};

/**
 * Get only visible fields from schema
 */
export const getVisibleFields = (schema: FormSchema): FormSchema => {
    return filterSchemaBy(schema, 'visible', true);
};

/**
 * Get searchable fields from schema
 */
export const getSearchableFields = (schema: FormSchema): FormSchema => {
    return filterSchemaBy(schema, 'searchable', true);
};

/**
 * Get filterable fields from schema
 */
export const getFilterableFields = (schema: FormSchema): FormSchema => {
    return filterSchemaBy(schema, 'filterable', true);
};

/**
 * Get sortable fields from schema
 */
export const getSortableFields = (schema: FormSchema): FormSchema => {
    return filterSchemaBy(schema, 'sortable', true);
};

/**
 * Get fields ordered by specific keys
 */
export const getFieldsInOrder = (
    schema: FormSchema,
    order: string[]
): FieldDefinition[] => {
    return order.reduce((acc, key) => {
        if (schema[key]) {
            acc.push(schema[key]);
        }
        return acc;
    }, [] as FieldDefinition[]);
};

/**
 * Validate field value against field definition
 */
export const validateFieldValue = (
    value: any,
    field: FieldDefinition
): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Required check
    if (field.required && (value === null || value === undefined || value === '')) {
        errors.push(`${field.label} is required`);
    }

    if (value === null || value === undefined || value === '') {
        return { valid: errors.length === 0, errors };
    }

    const validation = field.validation || {};

    // Min/Max length
    if (validation.minLength && String(value).length < validation.minLength) {
        errors.push(`${field.label} must be at least ${validation.minLength} characters`);
    }

    if (validation.maxLength && String(value).length > validation.maxLength) {
        errors.push(`${field.label} must be at most ${validation.maxLength} characters`);
    }

    // Min/Max value
    if (validation.min !== undefined && Number(value) < validation.min) {
        errors.push(`${field.label} must be at least ${validation.min}`);
    }

    if (validation.max !== undefined && Number(value) > validation.max) {
        errors.push(`${field.label} must be at most ${validation.max}`);
    }

    // Email validation
    if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
            errors.push(`${field.label} must be a valid email address`);
        }
    }

    // Pattern validation
    if (validation.pattern) {
        const pattern = new RegExp(validation.pattern);
        if (!pattern.test(String(value))) {
            errors.push(`${field.label} format is invalid`);
        }
    }

    return { valid: errors.length === 0, errors };
};

/**
 * Validate entire form data against schema
 */
export const validateFormData = (
    data: { [key: string]: any },
    schema: FormSchema
): { valid: boolean; fieldErrors: { [key: string]: string[] } } => {
    const fieldErrors: { [key: string]: string[] } = {};

    Object.entries(schema).forEach(([fieldName, field]) => {
        const validation = validateFieldValue(data[fieldName], field);
        if (!validation.valid) {
            fieldErrors[fieldName] = validation.errors;
        }
    });

    return {
        valid: Object.keys(fieldErrors).length === 0,
        fieldErrors,
    };
};

/**
 * Get field label or name as fallback
 */
export const getFieldLabel = (field: FieldDefinition): string => {
    return field.label || field.name;
};

/**
 * Get field placeholder or generate from label
 */
export const getFieldPlaceholder = (field: FieldDefinition): string => {
    if (field.placeholder) {
        return field.placeholder;
    }
    return `Enter ${field.label.toLowerCase()}`;
};

/**
 * Check if field has options
 */
export const hasFieldOptions = (field: FieldDefinition): boolean => {
    return Array.isArray(field.options) && field.options.length > 0;
};

/**
 * Get field options with proper formatting
 */
export const getFormattedOptions = (field: FieldDefinition) => {
    if (!hasFieldOptions(field)) {
        return [];
    }

    return field.options!.map(opt => ({
        label: String(opt.label),
        value: String(opt.value),
    }));
};
