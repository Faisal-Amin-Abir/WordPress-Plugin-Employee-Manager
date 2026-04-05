import React from 'react';
import { 
    Button, 
    Modal, 
    TextControl, 
    SelectControl 
} from '@wordpress/components';
import { Employee } from '../types';

interface EmployeeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: Employee;
    onFormChange: (newData: Employee) => void;
    maxUploadMB: number;
    onMediaUpload: () => void;
    isSaving: boolean;
    editingEmployee: Employee | null;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    formData,
    onFormChange,
    maxUploadMB,
    onMediaUpload,
    isSaving,
    editingEmployee,
}) => {
    return (
        isOpen && (
            <Modal
                title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                onRequestClose={onClose}
                size="large"
            >
                <form onSubmit={onSubmit} style={{ padding: '20px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            Profile Photo
                        </label>
                        <Button variant="secondary" onClick={onMediaUpload}>
                            {formData.profile_photo_id ? 'Change Profile Photo' : 'Upload Profile Photo'}
                        </Button>
                        {formData.profile_photo_id && (
                            <p style={{ marginTop: '8px', color: 'green' }}>
                                ✓ Photo selected (ID: {formData.profile_photo_id})
                            </p>
                        )}
                        <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
                            Max allowed size: <strong>{maxUploadMB} MB</strong>
                        </p>
                    </div>

                    <TextControl 
                        label="Full Name *" 
                        value={formData.full_name} 
                        onChange={(val) => onFormChange({ ...formData, full_name: val })} 
                        required 
                    />
                    <TextControl 
                        label="Email *" 
                        type="email" 
                        value={formData.email} 
                        onChange={(val) => onFormChange({ ...formData, email: val })} 
                        required 
                    />
                    <TextControl 
                        label="Phone" 
                        value={formData.phone || ''} 
                        onChange={(val) => onFormChange({ ...formData, phone: val })} 
                    />
                    <SelectControl 
                        label="Department" 
                        value={formData.department || ''} 
                        options={[
                            { label: 'HR', value: 'HR' },
                            { label: 'Engineering', value: 'Engineering' },
                            { label: 'Marketing', value: 'Marketing' },
                            { label: 'Sales', value: 'Sales' },
                            { label: 'Finance', value: 'Finance' },
                            { label: 'Operations', value: 'Operations' },
                            { label: 'Other', value: 'Other' },
                        ]} 
                        onChange={(val) => onFormChange({ ...formData, department: val })} 
                    />
                    <TextControl 
                        label="Job Title" 
                        value={formData.job_title || ''} 
                        onChange={(val) => onFormChange({ ...formData, job_title: val })} 
                    />
                    <TextControl 
                        label="Salary" 
                        type="number" 
                        value={formData.salary?.toString() || ''} 
                        onChange={(val) => onFormChange({ ...formData, salary: val ? parseFloat(val) : undefined })} 
                    />
                    <TextControl 
                        label="Date Joined" 
                        type="date" 
                        value={formData.date_joined || ''} 
                        onChange={(val) => onFormChange({ ...formData, date_joined: val })} 
                    />
                    <SelectControl 
                        label="Status" 
                        value={formData.status} 
                        options={[
                            { label: 'Active', value: 'active' },
                            { label: 'Inactive', value: 'inactive' },
                        ]} 
                        onChange={(val) => onFormChange({ ...formData, status: val as 'active' | 'inactive' })} 
                    />

                    <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                        <Button type="submit" variant="primary" disabled={isSaving}>
                            {isSaving ? 'Saving...' : (editingEmployee ? 'Update Employee' : 'Create Employee')}
                        </Button>
                        <Button variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Modal>
        )
    );
};

export default EmployeeFormModal;