import React from 'react';
import { Button, CheckboxControl } from '@wordpress/components';
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
}) => {
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
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Full Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Department</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Job Title</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Salary</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Date Joined</th>
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
                            <Button 
                                variant="secondary" 
                                onClick={() => onView(emp)} 
                                style={{ marginRight: '8px' }}
                            >
                                View
                            </Button>

                            {canManage && onEdit && (
                                <Button 
                                    variant="secondary" 
                                    onClick={() => onEdit(emp)} 
                                    style={{ marginRight: '8px' }}
                                >
                                    Edit
                                </Button>
                            )}

                            {canManage && onDelete && (
                                <Button 
                                    variant="secondary" 
                                    isDestructive 
                                    onClick={() => onDelete(emp)}
                                >
                                    Delete
                                </Button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default EmployeeTable;