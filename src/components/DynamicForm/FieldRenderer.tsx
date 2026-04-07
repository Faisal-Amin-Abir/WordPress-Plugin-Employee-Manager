/**
 * Dynamic Field Renderer Component
 * 
 * Renders individual form fields based on their schema definition
 * Handles all field types dynamically
 */

import React from 'react';
import {
    TextControl,
    SelectControl,
    CheckboxControl,
    Button,
} from '@wordpress/components';
import { FieldDefinition } from '../../types/schema';
import { getFieldLabel, getFieldPlaceholder, getFormattedOptions } from '../../utils/schemaParser';

interface DynamicFieldProps {
    field: FieldDefinition;
    value: any;
    onChange: (value: any) => void;
    error?: string;
    disabled?: boolean;
    onMediaUpload?: () => void;
    maxUploadMB?: number;
}

const DynamicField: React.FC<DynamicFieldProps> = ({
    field,
    value,
    onChange,
    error,
    disabled = false,
    onMediaUpload,
    maxUploadMB = 2,
}) => {
    const label = getFieldLabel(field);
    const placeholder = getFieldPlaceholder(field);
    const isRequired = field.required ? ' *' : '';

    const fieldStyle: React.CSSProperties = {
        marginBottom: '16px',
    };

    const errorStyle: React.CSSProperties = {
        color: '#d32f2f',
        fontSize: '12px',
        marginTop: '4px',
    };

    // Text input fields
    if (['text', 'email', 'tel', 'number', 'date', 'datetime'].includes(field.type)) {
        const inputTypeMap: { [key: string]: string } = {
            'text': 'text',
            'email': 'email',
            'tel': 'tel',
            'number': 'number',
            'date': 'date',
            'datetime': 'datetime-local',
        };
        
        return (
            <div style={fieldStyle}>
                <TextControl
                    label={`${label}${isRequired}`}
                    type={inputTypeMap[field.type] as any}
                    value={value || ''}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled || !field.editable}
                    help={field.description}
                />
                {error && <div style={errorStyle}>{error}</div>}
            </div>
        );
    }

    // Select fields
    if (field.type === 'select') {
        const options = getFormattedOptions(field);

        return (
            <div style={fieldStyle}>
                <SelectControl
                    label={`${label}${isRequired}`}
                    value={value || ''}
                    options={[
                        { label: '-- Select --', value: '' },
                        ...options,
                    ]}
                    onChange={onChange}
                    disabled={disabled || !field.editable}
                    help={field.description}
                />
                {error && <div style={errorStyle}>{error}</div>}
            </div>
        );
    }

    // Checkbox fields
    if (field.type === 'checkbox') {
        return (
            <div style={fieldStyle}>
                <CheckboxControl
                    label={label}
                    checked={Boolean(value)}
                    onChange={onChange}
                    disabled={disabled || !field.editable}
                    help={field.description}
                />
                {error && <div style={errorStyle}>{error}</div>}
            </div>
        );
    }

    // Media fields
    if (field.type === 'media') {
        return (
            <div style={fieldStyle}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    {label}
                    {isRequired}
                </label>
                <Button
                    variant="secondary"
                    onClick={onMediaUpload}
                    disabled={disabled || !field.editable}
                >
                    {value ? 'Change Attachment' : 'Upload File'}
                </Button>
                {value && (
                    <p style={{ marginTop: '8px', color: 'green' }}>
                        ✓ File selected (ID: {value})
                    </p>
                )}
                <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
                    Max allowed size: <strong>{maxUploadMB} MB</strong>
                </p>
                {field.description && (
                    <p style={{ fontSize: '13px', color: '#666' }}>
                        {field.description}
                    </p>
                )}
                {error && <div style={errorStyle}>{error}</div>}
            </div>
        );
    }

    // Textarea fields
    if (field.type === 'textarea') {
        return (
            <div style={fieldStyle}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    {label}
                    {isRequired}
                </label>
                <textarea
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled || !field.editable}
                    style={{
                        width: '100%',
                        minHeight: '100px',
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontFamily: 'inherit',
                    }}
                />
                {field.description && (
                    <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                        {field.description}
                    </p>
                )}
                {error && <div style={errorStyle}>{error}</div>}
            </div>
        );
    }

    // Radio fields
    if (field.type === 'radio') {
        const options = getFormattedOptions(field);

        return (
            <div style={fieldStyle}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    {label}
                    {isRequired}
                </label>
                <div>
                    {options.map((option: any) => (
                        <div key={option.value} style={{ marginBottom: '8px' }}>
                            <label>
                                <input
                                    type="radio"
                                    name={field.name}
                                    value={option.value}
                                    checked={String(value) === String(option.value)}
                                    onChange={(e) => onChange(e.target.value)}
                                    disabled={disabled || !field.editable}
                                    style={{ marginRight: '8px' }}
                                />
                                {option.label}
                            </label>
                        </div>
                    ))}
                </div>
                {field.description && (
                    <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                        {field.description}
                    </p>
                )}
                {error && <div style={errorStyle}>{error}</div>}
            </div>
        );
    }

    // Fallback for unknown types
    return (
        <div style={fieldStyle}>
            <TextControl
                label={`${label}${isRequired}`}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled || !field.editable}
                help={`${field.description} (Type: ${field.type})`}
            />
            {error && <div style={errorStyle}>{error}</div>}
        </div>
    );
};

export default DynamicField;
