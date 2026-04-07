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
import { DynamicFormModal } from './DynamicForm';
import EmployeeViewModal from './EmployeeViewModal';
import { Employee } from '../types';
import { useSchema } from '../hooks/useSchema';
import { generateInitialFormData, generateFormDataFromRecord } from '../utils/formInitialize';

const EmployeeManagerApp: React.FC = () => {
    // Fetch schema for dynamic form rendering
    const { schema, editableSchema, isLoading: schemaLoading, error: schemaError } = useSchema();

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
    const [maxUploadMB, setMaxUploadMB] = useState(2);
    const [isSaving, setIsSaving] = useState(false);
    const [currentMediaField, setCurrentMediaField] = useState<string | null>(null);

    const permissions = (window as any).employeeManager || {};
    const canManage = permissions.canManage || false;

    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkAction, setBulkAction] = useState<string>('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Initialize form data from schema
    const [formData, setFormData] = useState<any>(() => generateInitialFormData(schema));

    const fetchData = useCallback(async (page: number = 1, itemsPerPage: number = perPage) => {
        try {
            setIsLoading(true);
            setError(null);

            const empResponse = await apiFetch({
                path: `employee-manager/v1/employees?page=${page}&per_page=${itemsPerPage}`,
            }) as any;
            
            setEmployees(empResponse.data || []);
            setCurrentPage(empResponse.page || 1);
            setTotalPages(empResponse.pages || 1);
            setTotalItems((empResponse.pages || 1) * itemsPerPage);

            // Fetch settings from custom endpoint (allows both admins and managers)
            try {
                const settingsResponse = await apiFetch({
                    path: 'employee-manager/v1/settings',
                }) as any;

                if (settingsResponse.data && settingsResponse.data.employee_manager_max_upload_mb) {
                    const maxMB = settingsResponse.data.employee_manager_max_upload_mb;
                    setMaxUploadMB(maxMB);
                } else {
                    setMaxUploadMB(2);
                }
            } catch (settingsErr: any) {
                // Log settings fetch error but don't display it to user
                console.warn('Could not fetch settings:', settingsErr.message);
                // Use default value
                setMaxUploadMB(2);
            }

            setSelectedIds([]);
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, [perPage]);

    useEffect(() => {
        fetchData(currentPage, perPage);
    }, [fetchData, currentPage, perPage]);

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = !searchTerm || 
            emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment = !filterDepartment || emp.department === filterDepartment;
        const matchesStatus = !filterStatus || emp.status === filterStatus;

        return matchesSearch && matchesDepartment && matchesStatus;
    });

    const openModal = (employee: Employee | null = null) => {
        if (!canManage) return;

        if (employee) {
            setEditingEmployee(employee);
            setFormData(generateFormDataFromRecord(employee, schema));
        } else {
            setEditingEmployee(null);
            setFormData(generateInitialFormData(schema));
        }
        setIsModalOpen(true);
    };

    const openViewModal = (employee: Employee) => {
        setViewingEmployee(employee);
        setIsViewModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canManage) return;

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
            fetchData(currentPage, perPage);
        } catch (err: any) {
            alert('Error: ' + (err.message || 'Failed to save employee'));
        } finally {
            setIsSaving(false);
        }
    };

    const openMediaLibrary = (fieldName: string = 'profile_photo_id') => {
        const frame = (window as any).wp.media({
            title: `Select File for ${schema?.[fieldName]?.label || 'Upload'}`,
            button: { text: 'Use this file' },
            multiple: false,
            library: { type: 'image' }
        });

        frame.on('select', () => {
            const attachment = frame.state().get('selection').first().toJSON();
            setFormData((prev: any) => ({
                ...prev,
                [fieldName]: attachment.id
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
        if (!canManage || selectedIds.length === 0) return;
        if (!confirm(`Delete ${selectedIds.length} selected employees?`)) return;

        try {
            await apiFetch({
                path: 'employee-manager/v1/employees/bulk',
                method: 'POST',
                data: { action: 'delete', ids: selectedIds }
            });
            setSelectedIds([]);
            // Reset to page 1 after bulk delete
            setCurrentPage(1);
            fetchData(1, perPage);
        } catch (err: any) {
            alert('Bulk delete failed');
        }
    };

    const bulkChangeStatus = async (newStatus: 'active' | 'inactive') => {
        if (!canManage || selectedIds.length === 0) return;

        try {
            await apiFetch({
                path: 'employee-manager/v1/employees/bulk',
                method: 'POST',
                data: { action: 'status', ids: selectedIds, status: newStatus }
            });
            setSelectedIds([]);
            setBulkAction('');
            fetchData(currentPage, perPage);
        } catch (err: any) {
            alert('Bulk status change failed');
        }
    };

    const applyBulkAction = async () => {
        if (!bulkAction || selectedIds.length === 0) return;

        if (bulkAction === 'delete') {
            if (!confirm(`Delete ${selectedIds.length} selected employees?`)) return;
            await bulkDelete();
        } else if (bulkAction === 'active') {
            await bulkChangeStatus('active');
        } else if (bulkAction === 'inactive') {
            await bulkChangeStatus('inactive');
        }

        // Reset dropdown after action
        setBulkAction('');
    };

    return (
        <ThemeProvider pluginId="employee-manager">
            <div style={{ padding: '20px' }}>
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h1 style={{ margin: 0 }}>Employee Manager</h1>
                        {canManage && (
                            <Button variant="primary" onClick={() => openModal()}>
                                + Add New Employee
                            </Button>
                        )}
                    </div>

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

                    {/* Bulk Actions Row - WordPress Style */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <SelectControl
                            label=""
                            value={bulkAction}
                            options={[
                                { label: 'Bulk Actions', value: '' },
                                { label: '→ Mark as Active', value: 'active' },
                                { label: '→ Mark as Inactive', value: 'inactive' },
                                { label: '→ Delete', value: 'delete' },
                            ]}
                            onChange={setBulkAction}
                            disabled={selectedIds.length === 0 || !canManage}
                            style={{ minWidth: '200px' }}
                        />
                        <Button 
                            variant="primary"
                            onClick={applyBulkAction}
                            disabled={!bulkAction || selectedIds.length === 0 || !canManage}
                            style={{ color: 'white' }}
                        >
                            Apply
                        </Button>
                        {selectedIds.length > 0 && (
                            <span style={{ 
                                background: '#0073aa', 
                                color: 'white', 
                                padding: '4px 12px', 
                                borderRadius: '12px', 
                                fontSize: '13px',
                                fontWeight: '500'
                            }}>
                                {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
                            </span>
                        )}
                    </div>

                    {error && <Notice status="error" isDismissible onDismiss={() => setError(null)}>{error}</Notice>}
                    {schemaError && <Notice status="error" isDismissible>{schemaError}</Notice>}

                    {isLoading ? (
                        <p>Loading employees...</p>
                    ) : filteredEmployees.length === 0 ? (
                        <p>No employees found.</p>
                    ) : (
                        <>
                            <EmployeeTable
                                filteredEmployees={filteredEmployees}
                                selectedIds={selectedIds}
                                onToggleSelect={toggleSelect}
                                onSelectAll={(checked) => setSelectedIds(checked ? filteredEmployees.map(e => e.id!) : [])}
                                onEdit={canManage ? openModal : undefined}
                                onView={openViewModal}
                                onDelete={canManage ? (emp) => {
                                    if (confirm(`Delete ${emp.full_name}?`)) {
                                        apiFetch({
                                            path: `employee-manager/v1/employees/${emp.id}`,
                                            method: 'DELETE',
                                        }).then(() => fetchData(currentPage, perPage));
                                    }
                                } : undefined}
                                canManage={canManage}
                            />
                            
                            {/* Pagination Controls */}
                            <div style={{ 
                                display: 'flex', 
                                gap: '12px', 
                                marginTop: '20px', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                padding: '15px',
                                background: '#f9f9f9',
                                borderRadius: '4px',
                                border: '1px solid #e5e5e5'
                            }}>
                                <div style={{ fontSize: '13px', color: '#666' }}>
                                    <strong>Items per page:</strong>
                                </div>
                                <SelectControl
                                    value={perPage.toString()}
                                    options={[
                                        { label: '5 items', value: '5' },
                                        { label: '10 items', value: '10' },
                                        { label: '25 items', value: '25' },
                                        { label: '50 items', value: '50' },
                                    ]}
                                    onChange={(val) => {
                                        const newPerPage = parseInt(val);
                                        setPerPage(newPerPage);
                                        setCurrentPage(1);
                                        fetchData(1, newPerPage);
                                    }}
                                    style={{ minWidth: '120px' }}
                                />
                                
                                <div style={{ 
                                    fontSize: '13px', 
                                    color: '#666',
                                    marginLeft: 'auto'
                                }}>
                                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Button
                                        onClick={() => fetchData(1, perPage)}
                                        disabled={currentPage === 1 || isLoading}
                                        variant="secondary"
                                    >
                                        « First
                                    </Button>
                                    <Button
                                        onClick={() => fetchData(currentPage - 1, perPage)}
                                        disabled={currentPage === 1 || isLoading}
                                        variant="secondary"
                                    >
                                        ‹ Previous
                                    </Button>
                                    <Button
                                        onClick={() => fetchData(currentPage + 1, perPage)}
                                        disabled={currentPage >= totalPages || isLoading}
                                        variant="secondary"
                                    >
                                        Next ›
                                    </Button>
                                    <Button
                                        onClick={() => fetchData(totalPages, perPage)}
                                        disabled={currentPage >= totalPages || isLoading}
                                        variant="secondary"
                                    >
                                        Last »
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </Card>

                <DynamicFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                    formData={formData}
                    onFormChange={setFormData}
                    schema={editableSchema}
                    isLoading={schemaLoading}
                    isSaving={isSaving}
                    editingRecord={editingEmployee}
                    onMediaUpload={(fieldName) => {
                        setCurrentMediaField(fieldName);
                        openMediaLibrary(fieldName);
                    }}
                    maxUploadMB={maxUploadMB}
                    title="Add New Employee"
                />

                <EmployeeViewModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    employee={viewingEmployee}
                />
            </div>
        </ThemeProvider>
    );
};

export default EmployeeManagerApp;