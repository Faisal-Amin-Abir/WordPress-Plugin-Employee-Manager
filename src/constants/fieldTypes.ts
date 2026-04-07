/**
 * Field Type Constants and Mappings
 * 
 * Maps field types to their corresponding input components and validation rules
 */

export const FIELD_TYPE_COMPONENT_MAP = {
    text: 'TextControl',
    email: 'TextControl',
    tel: 'TextControl',
    number: 'NumberControl',
    date: 'DateControl',
    datetime: 'DateTimeControl',
    select: 'SelectControl',
    media: 'MediaControl',
    textarea: 'TextareaControl',
    checkbox: 'CheckboxControl',
    radio: 'RadioControl',
} as const;

export const FIELD_INPUT_TYPE_MAP = {
    text: 'text',
    email: 'email',
    tel: 'tel',
    number: 'number',
    date: 'date',
    datetime: 'datetime-local',
    select: 'select',
    media: 'hidden',
    textarea: 'textarea',
    checkbox: 'checkbox',
    radio: 'radio',
} as const;

export const FIELD_DISPLAY_FORMAT = {
    text: (value: any) => String(value || ''),
    email: (value: any) => String(value || ''),
    tel: (value: any) => String(value || ''),
    number: (value: any) => value ? `$${Number(value).toLocaleString()}` : '-',
    date: (value: any) => value ? new Date(value).toLocaleDateString() : '-',
    datetime: (value: any) => value ? new Date(value).toLocaleString() : '-',
    select: (value: any) => String(value || ''),
    media: (value: any) => value ? `Attached (ID: ${value})` : 'No attachment',
    textarea: (value: any) => String(value || ''),
    checkbox: (value: any) => value ? 'Yes' : 'No',
    radio: (value: any) => String(value || ''),
};

export const FILTERABLE_FIELD_TYPES = ['select', 'checkbox', 'radio', 'date'];

export const SORTABLE_FIELD_TYPES = ['text', 'email', 'tel', 'number', 'date'];

export const SEARCHABLE_FIELD_TYPES = ['text', 'email', 'tel', 'textarea'];
