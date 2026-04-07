import React from 'react';
import { Button, CheckboxControl } from '@wordpress/components';
import { details, pencil, trash } from '@wordpress/icons';
import { Employee } from '../types';

interface EmployeeTableProps {
    filteredEmployees: Employee[];
    selectedIds: number[];
    onToggleSelect: (id: number) => void;
    onSelectAll: (checked: boolean) => void;
    onEdit?: (employee: Employee) => void;
    onView: (employee: Employee) => void;
    onDelete?: (employee: Employee) => void;
    canManage: boolean;
    onSort?: (column: 'full_name' | 'date_joined') => void;
    sortBy?: 'full_name' | 'date_joined' | 'id';
    sortOrder?: 'ASC' | 'DESC';
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
    filteredEmployees,
    selectedIds,
    onToggleSelect,
    onSelectAll,
    onEdit,
    onView,
    onDelete,
    canManage,
    onSort,
    sortBy,
    sortOrder,
}) => {
    const renderSortableHeader = (label: string, column: 'full_name' | 'date_joined') => {
        const isSorted = sortBy === column;
        const sortIcon = isSorted ? (sortOrder === 'ASC' ? '▲' : '▼') : '⇅';
        const iconOpacity = isSorted ? '1' : '0.4';
        
        return (
            <th 
                onClick={() => onSort?.(column)}
                style={{ 
                    padding: '12px', 
                    textAlign: 'left', 
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                    background: '#f8f9fa',
                    fontWeight: '600',
                    userSelect: 'none',
                    transition: 'background-color 0.2s'
                }}
                title="Click to sort"
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#eef7ff';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {label}
                    <span style={{ fontSize: '11px', lineHeight: '1', opacity: iconOpacity, transition: 'opacity 0.2s' }}>{sortIcon}</span>
                </span>
            </th>
        );
    };
    return (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '12px', border: '1px solid #ddd', width: '40px' }}>
                        <CheckboxControl
                            checked={selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                            onChange={onSelectAll}
                        />
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Photo</th>
                    {renderSortableHeader('Full Name', 'full_name')}
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Department</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Job Title</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Salary</th>
                    {renderSortableHeader('Date Joined', 'date_joined')}
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {filteredEmployees.map((emp) => (
                    <tr key={emp.id}>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                            <CheckboxControl
                                checked={selectedIds.includes(emp.id!)}
                                onChange={() => onToggleSelect(emp.id!)}
                            />
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                            {emp.profile_photo_url ? (
                                <img 
                                    src={emp.profile_photo_url}
                                    alt={emp.full_name}
                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                            ) : (
                                <div style={{ width: '60px', height: '60px', background: '#eee', borderRadius: '4px' }} />
                            )}
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>{emp.full_name}</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>{emp.email}</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>{emp.department || '-'}</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>{emp.job_title || '-'}</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                            {emp.salary ? `$${emp.salary.toLocaleString()}` : '-'}
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>{emp.date_joined || '-'}</td>
                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                            <span style={{
                                padding: '4px 10px',
                                borderRadius: '9999px',
                                background: emp.status === 'active' ? '#d4edda' : '#f8d7da',
                                color: emp.status === 'active' ? '#155724' : '#721c24'
                            }}>
                                {emp.status}
                            </span>
                        </td>
                        <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'center' }}>
                                <Button 
                                    icon={details}
                                    onClick={() => onView(emp)}
                                    title="View"
                                    style={{ 
                                        padding: '2px',
                                        cursor: 'pointer',
                                        color: '#0073aa',
                                        minWidth: 'auto',
                                        height: '28px',
                                        width: '28px'
                                    }}
                                />

                                {canManage && onEdit && (
                                    <Button 
                                        icon={pencil}
                                        onClick={() => onEdit(emp)}
                                        title="Edit"
                                        style={{ 
                                            padding: '2px',
                                            cursor: 'pointer',
                                            color: '#0073aa',
                                            minWidth: 'auto',
                                            height: '28px',
                                            width: '28px'
                                        }}
                                    />
                                )}

                                {canManage && onDelete && (
                                    <Button 
                                        icon={trash}
                                        isDestructive 
                                        onClick={() => onDelete(emp)}
                                        title="Delete"
                                        style={{ 
                                            padding: '2px',
                                            cursor: 'pointer',
                                            minWidth: 'auto',
                                            height: '28px',
                                            width: '28px'
                                        }}
                                    />
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default EmployeeTable;