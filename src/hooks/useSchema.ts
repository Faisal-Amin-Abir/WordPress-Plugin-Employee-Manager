/**
 * useSchema Hook
 * 
 * Custom hook to fetch and manage form schema
 * Handles loading, caching, and error states
 */

import { useState, useEffect, useCallback } from 'react';
import apiFetch from '@wordpress/api-fetch';
import { FormSchema, SchemaResponse } from '../types/schema';

interface UseSchemaResult {
    schema: FormSchema | null;
    editableSchema: FormSchema | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Fetch schema from API
 */
export const useSchema = (): UseSchemaResult => {
    const [schema, setSchema] = useState<FormSchema | null>(null);
    const [editableSchema, setEditableSchema] = useState<FormSchema | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSchema = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Fetch complete schema
            const schemaResponse = await apiFetch({
                path: 'employee-manager/v1/schema',
            }) as SchemaResponse;

            if (!schemaResponse.success) {
                throw new Error(schemaResponse.message || 'Failed to fetch schema');
            }

            setSchema(schemaResponse.data);

            // Fetch editable schema for forms
            const editableResponse = await apiFetch({
                path: 'employee-manager/v1/schema/editable',
            }) as SchemaResponse;

            if (!editableResponse.success) {
                throw new Error('Failed to fetch editable schema');
            }

            setEditableSchema(editableResponse.data);
        } catch (err: any) {
            console.error('Schema fetch error:', err);
            setError(err.message || 'Failed to load schema');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchema();
    }, [fetchSchema]);

    return {
        schema,
        editableSchema,
        isLoading,
        error,
        refetch: fetchSchema,
    };
};

/**
 * Fetch specific field schema
 */
export const useFieldSchema = (fieldName: string) => {
    const [field, setField] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchField = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await apiFetch({
                    path: `employee-manager/v1/schema/fields/${fieldName}`,
                }) as SchemaResponse;

                if (!response.success) {
                    throw new Error('Field not found');
                }

                setField(response.data);
            } catch (err: any) {
                console.error('Field schema fetch error:', err);
                setError(err.message || 'Failed to load field schema');
            } finally {
                setIsLoading(false);
            }
        };

        if (fieldName) {
            fetchField();
        }
    }, [fieldName]);

    return { field, isLoading, error };
};
