import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Notice, TextControl, SelectControl, CheckboxControl } from '@wordpress/components';
import { ThemeProvider, Card } from '@wedevs/plugin-ui';
import apiFetch from '@wordpress/api-fetch';

interface Employee {
    id?: number;
    full_name: string;
    email: string;
    phone?: string;
    department?: string;
    job_title?: string;
    salary?: number;
    date_joined?: string;
    profile_photo_id?: number;
    profile_photo_url?: string | null;
    status: 'active' | 'inactive';
}

const EmployeeManagerApp: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [maxUploadMB, setMaxUploadMB] = useState(2);

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

            // Fetch employees
            const empResponse = await apiFetch({
                path: 'employee-manager/v1/employees?per_page=100',
            }) as any;
            setEmployees(empResponse.data || []);

            // Fetch max upload size from settings
            const settingsResponse = await apiFetch({
                path: 'wp/v2/settings',
            }) as any;

            const maxMB = settingsResponse.employee_manager_max_upload_mb || 2;
            setMaxUploadMB(maxMB);

            setSelectedIds([]); // Clear selection
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filtered employees
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
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8f9fa' }}>
                                    <th style={{ padding: '12px', border: '1px solid #ddd', width: '40px' }}>
                                        <CheckboxControl
                                            checked={selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                                            onChange={(checked) => setSelectedIds(checked ? filteredEmployees.map(e => e.id!) : [])}
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
                                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp.id}>
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                            <CheckboxControl
                                                checked={selectedIds.includes(emp.id!)}
                                                onChange={() => {
                                                    setSelectedIds(prev => 
                                                        prev.includes(emp.id!) 
                                                            ? prev.filter(id => id !== emp.id!)
                                                            : [...prev, emp.id!]
                                                    );
                                                }}
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
                                        <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                                            <Button variant="secondary" onClick={() => openModal(emp)} style={{ marginRight: '8px' }}>
                                                Edit
                                            </Button>
                                            <Button 
                                                variant="secondary" 
                                                isDestructive 
                                                onClick={() => {
                                                    if (confirm(`Delete ${emp.full_name}?`)) {
                                                        apiFetch({
                                                            path: `employee-manager/v1/employees/${emp.id}`,
                                                            method: 'DELETE',
                                                        }).then(() => fetchData());
                                                    }
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Card>

                {/* Add/Edit Modal */}
                {isModalOpen && (
                    <Modal
                        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                        onRequestClose={() => setIsModalOpen(false)}
                        size="large"
                    >
                        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                    Profile Photo
                                </label>
                                <Button variant="secondary" onClick={openMediaLibrary}>
                                    {formData.profile_photo_id ? 'Change Profile Photo' : 'Upload Profile Photo'}
                                </Button>
                                {formData.profile_photo_id && (
                                    <p style={{ marginTop: '8px', color: 'green' }}>
                                        ✓ Photo selected (ID: {formData.profile_photo_id})
                                    </p>
                                )}
                                <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
                                    Max allowed size: <strong>{maxUploadMB} MB</strong><br />
                                    <span style={{ color: '#0073aa' }}>
                                        The Media Library will now respect this limit.
                                    </span>
                                </p>
                            </div>

                            <TextControl label="Full Name *" value={formData.full_name} onChange={(val) => setFormData({ ...formData, full_name: val })} required />
                            <TextControl label="Email *" type="email" value={formData.email} onChange={(val) => setFormData({ ...formData, email: val })} required />
                            <TextControl label="Phone" value={formData.phone || ''} onChange={(val) => setFormData({ ...formData, phone: val })} />
                            <SelectControl label="Department" value={formData.department || ''} options={[
                                { label: 'HR', value: 'HR' },
                                { label: 'Engineering', value: 'Engineering' },
                                { label: 'Marketing', value: 'Marketing' },
                                { label: 'Sales', value: 'Sales' },
                                { label: 'Finance', value: 'Finance' },
                                { label: 'Operations', value: 'Operations' },
                                { label: 'Other', value: 'Other' },
                            ]} onChange={(val) => setFormData({ ...formData, department: val })} />
                            <TextControl label="Job Title" value={formData.job_title || ''} onChange={(val) => setFormData({ ...formData, job_title: val })} />
                            <TextControl label="Salary" type="number" value={formData.salary?.toString() || ''} onChange={(val) => setFormData({ ...formData, salary: val ? parseFloat(val) : undefined })} />
                            <TextControl label="Date Joined" type="date" value={formData.date_joined || ''} onChange={(val) => setFormData({ ...formData, date_joined: val })} />
                            <SelectControl label="Status" value={formData.status} options={[
                                { label: 'Active', value: 'active' },
                                { label: 'Inactive', value: 'inactive' },
                            ]} onChange={(val) => setFormData({ ...formData, status: val as 'active' | 'inactive' })} />

                            <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                                <Button type="submit" variant="primary">
                                    {editingEmployee ? 'Update Employee' : 'Create Employee'}
                                </Button>
                                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Modal>
                )}
            </div>
        </ThemeProvider>
    );
};

export default EmployeeManagerApp;