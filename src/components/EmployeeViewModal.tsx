import React from 'react';
import { Modal, Button } from '@wordpress/components';
import { Employee } from '../types';

interface EmployeeViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee | null;
}

const EmployeeViewModal: React.FC<EmployeeViewModalProps> = ({
    isOpen,
    onClose,
    employee,
}) => {
    if (!isOpen || !employee) return null;

    return (
        <Modal
            title={`Profile: ${employee.full_name}`}
            onRequestClose={onClose}
            size="large"
        >
            <div style={{ padding: '25px' }}>
                {/* Profile Photo */}
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    {employee.profile_photo_url ? (
                        <img
                            src={employee.profile_photo_url}
                            alt={employee.full_name}
                            style={{
                                width: '180px',
                                height: '180px',
                                objectFit: 'cover',
                                borderRadius: '12px',
                                border: '3px solid #f0f0f0'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '180px',
                            height: '180px',
                            background: '#f0f0f0',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto'
                        }}>
                            No Photo
                        </div>
                    )}
                </div>

                {/* Employee Details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px 30px' }}>
                    <p><strong>Full Name:</strong> {employee.full_name}</p>
                    <p><strong>Email:</strong> {employee.email}</p>
                    <p><strong>Phone:</strong> {employee.phone || '—'}</p>
                    <p><strong>Department:</strong> {employee.department || '—'}</p>
                    <p><strong>Job Title:</strong> {employee.job_title || '—'}</p>
                    <p><strong>Salary:</strong> {employee.salary ? `$${employee.salary}` : '—'}</p>
                    <p><strong>Date Joined:</strong> {employee.date_joined || '—'}</p>
                    <p><strong>Status:</strong> 
                        <span style={{ 
                            color: employee.status === 'active' ? 'green' : 'red',
                            fontWeight: 'bold'
                        }}>
                            {employee.status.toUpperCase()}
                        </span>
                    </p>
                </div>
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid #ddd', textAlign: 'right' }}>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </div>
        </Modal>
    );
};

export default EmployeeViewModal;