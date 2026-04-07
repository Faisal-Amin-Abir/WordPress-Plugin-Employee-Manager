/**
 * Form Initialization Helpers
 * 
 * Utilities to generate initial form data from schema
 */

import { FormSchema } from '../types/schema';

/**
 * Generate empty form data from schema
 * Initializes all fields with appropriate empty values based on their type
 */
export const generateInitialFormData = (schema: FormSchema | null): any => {
    if (!schema) {
        return {};
    }

    return Object.entries(schema).reduce((acc, [fieldName, field]) => {
        // Set appropriate empty value based on field type
        switch (field.type) {
            case 'checkbox':
                acc[fieldName] = false;
                break;
            case 'number':
                acc[fieldName] = undefined;
                break;
            case 'select':
            case 'radio':
                acc[fieldName] = field.options?.[0]?.value || '';
                break;
            case 'media':
                acc[fieldName] = undefined;
                break;
            default:
                acc[fieldName] = '';
        }
        return acc;
    }, {} as any);
};

/**
 * Generate form data from existing record
 * Use data types from schema to ensure proper formatting
 */
export const generateFormDataFromRecord = (
    record: any,
    schema: FormSchema | null
): any => {
    if (!schema) {
        return record;
    }

    return Object.entries(schema).reduce((acc, [fieldName, field]) => {
        const value = record[fieldName];

        // Preserve null/undefined for optional fields
        if (value === null || value === undefined) {
            acc[fieldName] = field.required ? '' : undefined;
        } else {
            // Ensure value matches field type
            switch (field.type) {
                case 'number':
                    acc[fieldName] = Number(value) || 0;
                    break;
                case 'checkbox':
                    acc[fieldName] = Boolean(value);
                    break;
                default:
                    acc[fieldName] = value;
            }
        }

        return acc;
    }, {} as any);
};

/**
 * Get display label for record
 * Usually the product/employee name or similar identifying field
 */
export const getRecordLabel = (record: any, schema: FormSchema | null): string => {
    if (!schema) return String(record.id || '');

    // Try common naming fields
    const namingFields = ['full_name', 'name', 'title', 'email'];
    for (const fieldName of namingFields) {
        if (schema[fieldName] && record[fieldName]) {
            return String(record[fieldName]);
        }
    }

    return String(record.id || '');
};
