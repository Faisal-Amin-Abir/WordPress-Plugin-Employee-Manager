import React, { useState, useEffect, useCallback } from 'react';
import { 
    Button, 
    Notice, 
    TextControl, 
    SelectControl 
} from '@wordpress/components';
import { ThemeProvider, Card } from '@wedevs/plugin-ui';
import apiFetch from '@wordpress/api-fetch';

import EmployeeTable from './EmployeeTable';
import EmployeeFormModal from './EmployeeFormModal';
import { Employee } from '../types';

const EmployeeManagerApp: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [maxUploadMB, setMaxUploadMB] = useState(2);
    const [isSaving, setIsSaving] = useState(false);   // ← This was missing in some versions

    // Search & Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Bulk Actions
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [formData, setFormData] = useState<Employee>({
        full_name: '',
        email: '',
        phone: '',
        department: 'HR',
        job_title: '',
        salary: undefined,
        date_joined: '',
        profile_photo_id: undefined,
        status: 'active',
    });

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const empResponse = await apiFetch({
                path: 'employee-manager/v1/employees?per_page=100',
            }) as any;
            setEmployees(empResponse.data || []);

            const settingsResponse = await apiFetch({
                path: 'wp/v2/settings',
            }) as any;

            const maxMB = settingsResponse.employee_manager_max_upload_mb || 2;
            setMaxUploadMB(maxMB);

            setSelectedIds([]);
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = !searchTerm || 
            emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment = !filterDepartment || emp.department === filterDepartment;
        const matchesStatus = !filterStatus || emp.status === filterStatus;

        return matchesSearch && matchesDepartment && matchesStatus;
    });

    const openModal = (employee: Employee | null = null) => {
        if (employee) {
            setEditingEmployee(employee);
            setFormData({ ...employee });
        } else {
            setEditingEmployee(null);
            setFormData({
                full_name: '',
                email: '',
                phone: '',
                department: 'HR',
                job_title: '',
                salary: undefined,
                date_joined: '',
                profile_photo_id: undefined,
                status: 'active',
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (editingEmployee?.id) {
                await apiFetch({
                    path: `employee-manager/v1/employees/${editingEmployee.id}`,
                    method: 'PUT',
                    data: formData,
                });
            } else {
                await apiFetch({
                    path: 'employee-manager/v1/employees',
                    method: 'POST',
                    data: formData,
                });
            }

            setIsModalOpen(false);
            fetchData();
        } catch (err: any) {
            alert('Error: ' + (err.message || 'Failed to save employee'));
        } finally {
            setIsSaving(false);
        }
    };

    const openMediaLibrary = () => {
        const frame = (window as any).wp.media({
            title: 'Select Profile Photo',
            button: { text: 'Use this photo' },
            multiple: false,
            library: { type: 'image' }
        });

        frame.on('select', () => {
            const attachment = frame.state().get('selection').first().toJSON();
            setFormData(prev => ({
                ...prev,
                profile_photo_id: attachment.id
            }));
        });

        frame.open();
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const bulkDelete = async () => {
        if (selectedIds.length === 0 || !confirm(`Delete ${selectedIds.length} selected employees?`)) return;

        try {
            await apiFetch({
                path: 'employee-manager/v1/employees/bulk',
                method: 'POST',
                data: { action: 'delete', ids: selectedIds }
            });
            setSelectedIds([]);
            fetchData();
        } catch (err: any) {
            alert('Bulk delete failed');
        }
    };

    const bulkChangeStatus = async (newStatus: 'active' | 'inactive') => {
        if (selectedIds.length === 0) return;

        try {
            await apiFetch({
                path: 'employee-manager/v1/employees/bulk',
                method: 'POST',
                data: { action: 'status', ids: selectedIds, status: newStatus }
            });
            setSelectedIds([]);
            fetchData();
        } catch (err: any) {
            alert('Bulk status change failed');
        }
    };

    return (
        <ThemeProvider pluginId="employee-manager">
            <div style={{ padding: '20px' }}>
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h1 style={{ margin: 0 }}>Employee Manager</h1>
                        <Button variant="primary" onClick={() => openModal()}>
                            + Add New Employee
                        </Button>
                    </div>

                    {/* Search + Filters */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '15px', flexWrap: 'wrap' }}>
                        <TextControl
                            placeholder="Search by name or email"
                            value={searchTerm}
                            onChange={setSearchTerm}
                            style={{ width: '300px' }}
                        />
                        <SelectControl
                            label="Department"
                            value={filterDepartment}
                            options={[
                                { label: 'All Departments', value: '' },
                                { label: 'HR', value: 'HR' },
                                { label: 'Engineering', value: 'Engineering' },
                                { label: 'Marketing', value: 'Marketing' },
                                { label: 'Sales', value: 'Sales' },
                                { label: 'Finance', value: 'Finance' },
                                { label: 'Operations', value: 'Operations' },
                                { label: 'Other', value: 'Other' },
                            ]}
                            onChange={setFilterDepartment}
                        />
                        <SelectControl
                            label="Status"
                            value={filterStatus}
                            options={[
                                { label: 'All Status', value: '' },
                                { label: 'Active', value: 'active' },
                                { label: 'Inactive', value: 'inactive' },
                            ]}
                            onChange={setFilterStatus}
                        />
                    </div>

                    {/* Bulk Actions Toolbar */}
                    {selectedIds.length > 0 && (
                        <div style={{ marginBottom: '15px', padding: '10px', background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px' }}>
                            <strong>{selectedIds.length} selected</strong>
                            <Button variant="secondary" onClick={bulkDelete} style={{ marginLeft: '15px' }}>
                                Delete Selected
                            </Button>
                            <Button variant="secondary" onClick={() => bulkChangeStatus('active')} style={{ marginLeft: '8px' }}>
                                Mark as Active
                            </Button>
                            <Button variant="secondary" onClick={() => bulkChangeStatus('inactive')} style={{ marginLeft: '8px' }}>
                                Mark as Inactive
                            </Button>
                        </div>
                    )}

                    {error && <Notice status="error" isDismissible onDismiss={() => setError(null)}>{error}</Notice>}

                    {isLoading ? (
                        <p>Loading employees...</p>
                    ) : filteredEmployees.length === 0 ? (
                        <p>No employees found.</p>
                    ) : (
                        <EmployeeTable
                            employees={employees}
                            filteredEmployees={filteredEmployees}
                            selectedIds={selectedIds}
                            onToggleSelect={toggleSelect}
                            onSelectAll={(checked) => setSelectedIds(checked ? filteredEmployees.map(e => e.id!) : [])}
                            onEdit={openModal}
                            onDelete={(emp) => {
                                if (confirm(`Delete ${emp.full_name}?`)) {
                                    apiFetch({
                                        path: `employee-manager/v1/employees/${emp.id}`,
                                        method: 'DELETE',
                                    }).then(() => fetchData());
                                }
                            }}
                            onBulkDelete={bulkDelete}
                            onBulkStatusChange={bulkChangeStatus}
                        />
                    )}
                </Card>

                <EmployeeFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                    formData={formData}
                    onFormChange={setFormData}
                    maxUploadMB={maxUploadMB}
                    onMediaUpload={openMediaLibrary}
                    isSaving={isSaving}           // ← This was the missing prop causing error
                    editingEmployee={editingEmployee}
                />
            </div>
        </ThemeProvider>
    );
};

export default EmployeeManagerApp;