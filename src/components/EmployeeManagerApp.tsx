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
    // Initialize perPage from localStorage or default to 10
    const [perPage, setPerPage] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('employeeManager_perPage');
            return saved ? parseInt(saved, 10) : 10;
        }
        return 10;
    });
    const [totalPages, setTotalPages] = useState(1);
    const [totalFilteredItems, setTotalFilteredItems] = useState(0);  // Items matching filters
    const [totalDatabaseItems, setTotalDatabaseItems] = useState(0);  // Total in database

    // Sorting state
    const [sortBy, setSortBy] = useState<'full_name' | 'date_joined' | 'id'>('id');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

    // Initialize form data from schema
    const [formData, setFormData] = useState<any>(() => generateInitialFormData(schema));

    const fetchPageData = useCallback(
        async (
            page: number = 1, 
            itemsPerPage: number = perPage,
            sortByParam: 'full_name' | 'date_joined' | 'id' = sortBy,
            sortOrderParam: 'ASC' | 'DESC' = sortOrder,
            search: string = searchTerm,
            department: string = filterDepartment,
            status: string = filterStatus,
            showLoading: boolean = true  // Controls loading spinner display
        ) => {
            try {
                if (showLoading) setIsLoading(true);
                setError(null);

                // Build query parameters including filters
                const params = new URLSearchParams({
                    page: page.toString(),
                    per_page: itemsPerPage.toString(),
                    sort_by: sortByParam,
                    sort_order: sortOrderParam,
                    ...(search && { search }),
                    ...(department && { department }),
                    ...(status && { status }),
                });

                const empResponse = await apiFetch({
                    path: `employee-manager/v1/employees?${params.toString()}`,
                }) as any;
                
                // Update table data
                setEmployees(empResponse.data || []);
                setCurrentPage(empResponse.page || 1);
                setTotalPages(empResponse.pages || 1);
                
                // Update counts from API response
                // total_filtered = items matching filters
                // total_database = total items in database
                setTotalFilteredItems(empResponse.total_filtered || 0);
                setTotalDatabaseItems(empResponse.total_database || 0);

                setSelectedIds([]);
            } catch (err: any) {
                setError(err.message || 'Failed to load data');
            } finally {
                if (showLoading) setIsLoading(false);
            }
        },
        [perPage, sortBy, sortOrder]
    );

    // Fetch settings once on component mount
    useEffect(() => {
        const fetchSettings = async () => {
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
        };

        fetchSettings();
    }, []); // Empty dependency array - fetch only once on mount

    // Persist perPage to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('employeeManager_perPage', perPage.toString());
    }, [perPage]);

    useEffect(() => {
        // Call fetchPageData with all filter parameters to ensure consistency
        fetchPageData(currentPage, perPage, sortBy, sortOrder, searchTerm, filterDepartment, filterStatus);
    }, [fetchPageData, currentPage, perPage, sortBy, sortOrder, searchTerm, filterDepartment, filterStatus]);

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

    const handleSort = (column: 'full_name' | 'date_joined') => {
        // If clicking the same column, toggle sort order
        if (sortBy === column) {
            const newOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC';
            setSortOrder(newOrder);
            setCurrentPage(1);
            fetchPageData(1, perPage, column, newOrder, searchTerm, filterDepartment, filterStatus);
        } else {
            // If clicking a new column, sort by that column in ASC order
            setSortBy(column);
            setSortOrder('ASC');
            setCurrentPage(1);
            fetchPageData(1, perPage, column, 'ASC', searchTerm, filterDepartment, filterStatus);
        }
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
            fetchPageData(currentPage, perPage, sortBy, sortOrder, searchTerm, filterDepartment, filterStatus);
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

    // Handle search filter change - reset to page 1 and fetch with new search
    const handleSearchChange = (newSearchTerm: string) => {
        setSearchTerm(newSearchTerm);
        setCurrentPage(1);
        fetchPageData(1, perPage, sortBy, sortOrder, newSearchTerm, filterDepartment, filterStatus);
    };

    // Handle department filter change - reset to page 1 and fetch with new department
    const handleDepartmentChange = (newDepartment: string) => {
        setFilterDepartment(newDepartment);
        setCurrentPage(1);
        fetchPageData(1, perPage, sortBy, sortOrder, searchTerm, newDepartment, filterStatus);
    };

    // Handle status filter change - reset to page 1 and fetch with new status
    const handleStatusChange = (newStatus: string) => {
        setFilterStatus(newStatus);
        setCurrentPage(1);
        fetchPageData(1, perPage, sortBy, sortOrder, searchTerm, filterDepartment, newStatus);
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
            fetchPageData(1, perPage, sortBy, sortOrder, searchTerm, filterDepartment, filterStatus, false);
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
            fetchPageData(currentPage, perPage, sortBy, sortOrder, searchTerm, filterDepartment, filterStatus, false);
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

    // Check if any filters are active
    const hasActiveFilters = searchTerm || filterDepartment || filterStatus;
    // Show: filtered count of total database count
    // Example: "Result: 10 of 15" means 10 items match filters out of 15 total

    return (
        <ThemeProvider pluginId="employee-manager">
            <div style={{ padding: '20px' }}>
                <Card>
                    {canManage ? (
                        // HR Manager / Admin Layout
                        <>
                            {/* Row 1: Add New Employee and Search */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <Button variant="primary" onClick={() => openModal()}>
                                    + Add New Employee
                                </Button>
                                <TextControl
                                    placeholder="Search by name or email"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    style={{ width: '300px' }}
                                />
                            </div>

                            {/* Row 2: Bulk Actions and Filters */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '15px', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
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
                                        style={{ minWidth: '180px' }}
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
                                        onChange={handleDepartmentChange}
                                    />
                                    <SelectControl
                                        label="Status"
                                        value={filterStatus}
                                        options={[
                                            { label: 'All Status', value: '' },
                                            { label: 'Active', value: 'active' },
                                            { label: 'Inactive', value: 'inactive' },
                                        ]}
                                        onChange={handleStatusChange}
                                    />
                                </div>

                                {/* Member Count Display - Right Side */}
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {hasActiveFilters ? (
                                        <>
                                            <span style={{ fontSize: '13px', color: '#555' }}>
                                                Result: <strong>{totalFilteredItems}</strong> of <strong>{totalDatabaseItems}</strong>
                                            </span>
                                            <Button 
                                                variant="tertiary"
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setFilterDepartment('');
                                                    setFilterStatus('');
                                                    setCurrentPage(1);
                                                    // Fetch data with cleared filters from page 1
                                                    fetchPageData(1, perPage, sortBy, sortOrder, '', '', '');
                                                }}
                                                style={{ padding: '2px 8px', fontSize: '11px' }}
                                            >
                                                Clear
                                            </Button>
                                        </>
                                    ) : (
                                        <span style={{ fontSize: '13px', color: '#0073aa', fontWeight: '600' }}>
                                            Total: <strong>{totalFilteredItems}</strong>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        // Employee Viewer Layout - All controls in one row
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '15px', gap: '12px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'nowrap', minWidth: 0 }}>
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
                                    onChange={handleDepartmentChange}
                                />
                                <SelectControl
                                    label="Status"
                                    value={filterStatus}
                                    options={[
                                        { label: 'All Status', value: '' },
                                        { label: 'Active', value: 'active' },
                                        { label: 'Inactive', value: 'inactive' },
                                    ]}
                                    onChange={handleStatusChange}
                                />
                                <TextControl
                                    placeholder="Search by name or email"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    style={{ width: '200px', flexShrink: 0 }}
                                />
                            </div>

                            {/* Member Count Display - Right Side */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {hasActiveFilters ? (
                                    <>
                                        <span style={{ fontSize: '13px', color: '#555' }}>
                                            Result: <strong>{totalFilteredItems}</strong> of <strong>{totalDatabaseItems}</strong>
                                        </span>
                                        <Button 
                                            variant="tertiary"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setFilterDepartment('');
                                                setFilterStatus('');
                                                setCurrentPage(1);
                                                // Fetch data with cleared filters from page 1
                                                fetchPageData(1, perPage, sortBy, sortOrder, '', '', '');
                                            }}
                                            style={{ padding: '2px 8px', fontSize: '11px' }}
                                        >
                                            Clear
                                        </Button>
                                    </>
                                ) : (
                                    <span style={{ fontSize: '13px', color: '#0073aa', fontWeight: '600' }}>
                                        Total: <strong>{totalFilteredItems}</strong>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

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
                                        }).then(() => fetchPageData(currentPage, perPage, sortBy, sortOrder, searchTerm, filterDepartment, filterStatus, false));
                                    }
                                } : undefined}
                                canManage={canManage}
                                onSort={handleSort}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
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
                                        { label: '2 items', value: '2' },
                                        { label: '5 items', value: '5' },
                                        { label: '10 items', value: '10' },
                                        { label: '25 items', value: '25' },
                                        { label: '50 items', value: '50' },
                                    ]}
                                    onChange={(val) => {
                                        const newPerPage = parseInt(val);
                                        setPerPage(newPerPage);
                                        setCurrentPage(1);
                                        // Save to localStorage
                                        localStorage.setItem('employeeManager_perPage', newPerPage.toString());
                                        fetchPageData(1, newPerPage, sortBy, sortOrder, searchTerm, filterDepartment, filterStatus, false);
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
                                        onClick={() => fetchPageData(1, perPage, sortBy, sortOrder, searchTerm, filterDepartment, filterStatus, false)}
                                        disabled={currentPage === 1 || isLoading}
                                        variant="secondary"
                                    >
                                        « First
                                    </Button>
                                    <Button
                                        onClick={() => fetchPageData(currentPage - 1, perPage, sortBy, sortOrder, searchTerm, filterDepartment, filterStatus, false)}
                                        disabled={currentPage === 1 || isLoading}
                                        variant="secondary"
                                    >
                                        ‹ Previous
                                    </Button>
                                    <Button
                                        onClick={() => fetchPageData(currentPage + 1, perPage, sortBy, sortOrder, searchTerm, filterDepartment, filterStatus, false)}
                                        disabled={currentPage >= totalPages || isLoading}
                                        variant="secondary"
                                    >
                                        Next ›
                                    </Button>
                                    <Button
                                        onClick={() => fetchPageData(totalPages, perPage, sortBy, sortOrder, searchTerm, filterDepartment, filterStatus, false)}
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