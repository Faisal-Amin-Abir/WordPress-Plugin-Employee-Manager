/**
 * Dynamic Form Modal Component
 * 
 * Main form modal that dynamically renders all fields based on schema
 * Replaces the hardcoded EmployeeFormModal
 */

import React, { useState, useEffect } from 'react';
import { Button, Modal, Notice } from '@wordpress/components';
import { FormSchema } from '../../types/schema';
import DynamicField from './FieldRenderer';
import { validateFormData } from '../../utils/schemaParser';

interface DynamicFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent, formData: any) => void;
    formData: any;
    onFormChange: (newData: any) => void;
    schema: FormSchema | null;
    isLoading: boolean;
    isSaving?: boolean;
    editingRecord?: any;
    onMediaUpload?: (fieldName: string) => void;
    maxUploadMB?: number;
    title?: string;
}

const DynamicFormModal: React.FC<DynamicFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    formData,
    onFormChange,
    schema,
    isLoading,
    isSaving = false,
    editingRecord,
    onMediaUpload,
    maxUploadMB = 2,
    title = 'Add New Record',
}) => {
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});

    // Get editable fields from schema
    const editableFields = schema
        ? Object.entries(schema)
              .filter(([, field]) => field.editable)
              .sort(([, a], [, b]) => {
                  // Prioritize important fields
                  const priorityFields = [
                      'full_name',
                      'email',
                      'phone',
                      'profile_photo_id',
                      'department',
                      'job_title',
                      'salary',
                      'date_joined',
                      'status',
                  ];
                  const aIndex = priorityFields.indexOf(a.name);
                  const bIndex = priorityFields.indexOf(b.name);
                  return aIndex - bIndex;
              })
        : [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (schema) {
            const validation = validateFormData(formData, schema);

            if (!validation.valid) {
                setFieldErrors(validation.fieldErrors);
                return;
            }
        }

        // Clear errors if valid
        setFieldErrors({});

        // Call parent submit handler
        onSubmit(e, formData);
    };

    if (!isOpen) {
        return null;
    }

    const modalTitle = editingRecord ? `Edit Record` : title;

    return (
        <Modal title={modalTitle} onRequestClose={onClose} size="large">
            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                {isLoading ? (
                    <Notice status="info" isDismissible={false}>
                        Loading form schema...
                    </Notice>
                ) : (
                    <>
                        {editableFields.length === 0 ? (
                            <Notice status="warning" isDismissible={false}>
                                No editable fields available in this form.
                            </Notice>
                        ) : (
                            <div>
                                {editableFields.map(([fieldName, field]) => (
                                    <DynamicField
                                        key={fieldName}
                                        field={field}
                                        value={formData[fieldName]}
                                        onChange={(value) =>
                                            onFormChange({
                                                ...formData,
                                                [fieldName]: value,
                                            })
                                        }
                                        error={fieldErrors[fieldName]?.[0]}
                                        onMediaUpload={() =>
                                            onMediaUpload?.(fieldName)
                                        }
                                        maxUploadMB={maxUploadMB}
                                    />
                                ))}
                            </div>
                        )}

                        <div
                            style={{
                                marginTop: '30px',
                                display: 'flex',
                                gap: '10px',
                            }}
                        >
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSaving || isLoading}
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={onClose}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                        </div>
                    </>
                )}
            </form>
        </Modal>
    );
};

export default DynamicFormModal;
