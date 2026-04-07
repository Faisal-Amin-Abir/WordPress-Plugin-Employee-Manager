# Employee Manager - WordPress Plugin

> **Modern employee management system built with WordPress best practices**

A comprehensive WordPress plugin demonstrating modern admin application architecture using REST API, React, TypeScript, and advanced WordPress development patterns.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Database Schema](#database-schema)
- [REST API Documentation](#rest-api-documentation)
- [Project Structure](#project-structure)
- [Development](#development)
- [Role-Based Access Control](#role-based-access-control)
- [Security](#security)
- [Performance](#performance)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**Employee Manager** is a production-ready WordPress plugin that provides a structured system for managing employee records inside WordPress. It demonstrates modern **WordPress admin application architecture** using:

- **WordPress Plugin Architecture** - OOP-based modular design
- **REST API** - Data layer with proper security and validation
- **React + TypeScript** - Modern frontend with DataViews
- **PostgreSQL/MySQL** - Optimized database structure
- **Plugin UI** - Consistent, professional UI components
- **Role-Based Access Control** - Granular permission system

**Key Technologies:**
- WordPress DataViews for listing and managing data
- WordPress DataForm for dynamic form rendering
- Plugin UI components for consistent UI
- React 18 with TypeScript
- WordPress REST API
- OOP Architecture with Namespaces

---

## ✨ Features

### 2.1 Employee CRUD Operations

✅ Create new employee records
✅ View complete employee directory
✅ Update employee information
✅ Delete employees
✅ Upload and manage profile photos
✅ All operations through secure REST API layer

### 2.2 Employee Data Structure

Each employee record contains the following fields:

| Field | Type | Notes |
|-------|------|-------|
| **ID** | Integer (Auto) | Primary Key |
| **Full Name** | String (255) | Required field |
| **Email** | String (100) | Unique, Required |
| **Phone** | String (50) | Optional |
| **Department** | ENUM | HR, Engineering, Marketing, Sales, Finance, Operations, Other |
| **Job Title** | String (150) | Optional |
| **Salary** | Decimal (15,2) | Stored securely |
| **Date Joined** | Date | Record creation date |
| **Profile Photo** | Media | Linked to WordPress Media Library |
| **Status** | ENUM | Active / Inactive |
| **Created At** | DateTime | Auto-generated |
| **Updated At** | DateTime | Auto-updated on modification |

### Advanced Features

#### 3.1 Search, Filter & Sorting

✅ **Full-text Search** - Search employees by name or email
✅ **Department Filter** - Filter employees by department
✅ **Status Filter** - Filter by Active/Inactive status
✅ **Multi-field Sorting** - Sort by:
- Full Name (A-Z, Z-A)
- Date Joined (Newest, Oldest)

#### 3.2 Pagination & Performance

✅ **Server-side Pagination** - Efficient data loading
✅ **Customizable Items Per Page** - 5, 10, 25, or 50 items
✅ **Persistent Settings** - Items per page setting saved to localStorage
✅ **Query Optimization** - Indexed fields for fast queries
✅ **Handles 1000+ Employees** - Optimized for large datasets

#### 3.3 Bulk Actions

✅ **Multi-select Employees** - Select multiple records
✅ **Bulk Delete** - Delete multiple employees at once
✅ **Bulk Status Change** - Change Active/Inactive status for multiple employees

#### 3.4 Employee Profile Modal

✅ **Detailed View Modal** - Opens in a modal window
✅ **Profile Information**:
  - Profile photo with preview
  - Contact information
  - Department and job title
  - Date joined
  - Current status

#### 3.5 Media Handling

✅ **Profile Photo Upload** - Upload via WordPress Media Library
✅ **Configurable Upload Settings**:
  - Maximum upload file size (MB)
  - Image validation
  - Secure file handling

#### 3.6 Admin Settings Panel

✅ **Settings Page** - Configure plugin behavior:
  - Max upload size for employee photos
  - Allowed file types
  - Default settings

---

## 🏗️ Architecture

### Backend Architecture

```
includes/
├── Core/
│   ├── Plugin.php              # Main plugin class & init
│   ├── Capabilities.php        # Role-based access control
│   └── Admin.php               # Admin page setup
├── Database/
│   ├── Manager.php             # Database table creation
│   └── Query.php               # Query builder
├── API/
│   ├── RestController.php      # REST API endpoints
│   └── SchemaController.php    # Schema API endpoints
├── Models/
│   └── Employee.php            # Employee model with CRUD
├── Admin/
│   └── SettingsPage.php        # Admin settings UI
├── Settings/
│   └── Manager.php             # Settings management
└── Utils/
    ├── Sanitizer.php           # Input sanitization
    └── Validator.php           # Data validation
```

### Frontend Architecture

```
src/
├── components/
│   ├── EmployeeManagerApp.tsx  # Main app component
│   ├── EmployeeTable.tsx       # Data table view
│   ├── EmployeeViewModal.tsx   # Detail view modal
│   ├── DynamicForm/
│   │   ├── DynamicFormModal.tsx# Form modal
│   │   └── components/         # Form field components
│   └── schemas/                # Schema configurations
├── hooks/
│   ├── useSchema.ts            # Schema data hook
│   └── usePagination.ts        # Pagination logic
├── types/
│   ├── index.ts                # Employee types
│   └── schema.ts               # Schema types
├── utils/
│   ├── formInitialize.ts       # Form initialization
│   └── validation.ts           # Frontend validation
└── constants/
    └── departments.ts          # Department definitions
```

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│         WordPress Admin (React + TypeScript)            │
├─────────────────────────────────────────────────────────┤
│ Component Layer (EmployeeManagerApp, EmployeeTable)     │
└────────────────────┬────────────────────────────────────┘
                     │ REST API Calls
                     ▼
┌─────────────────────────────────────────────────────────┐
│       WordPress REST API (`/employee-manager/v1/`)       │
├─────────────────────────────────────────────────────────┤
│ RestController (Routes, Permissions, Validation)        │
└────────────────────┬────────────────────────────────────┘
                     │ PHP Operations
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Employee Model (CRUD Operations)                 │
├─────────────────────────────────────────────────────────┤
│ Sanitize -> Validate -> Query -> Get/Update/Delete      │
└────────────────────┬────────────────────────────────────┘
                     │ Database Query
                     ▼
┌─────────────────────────────────────────────────────────┐
│      WordPress Database (wp_employee_manager table)      │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

### Requirements

- WordPress 6.4 or higher
- PHP 7.4 or higher
- MySQL 5.7 or PostgreSQL

### Installation Steps

1. **Download the plugin** to your WordPress plugins directory:
   ```bash
   cd wp-content/plugins/
   git clone https://github.com/your-repo/employee-manager.git
   ```

2. **Install dependencies**:
   ```bash
   cd employee-manager
   npm install
   composer install
   ```

3. **Build the React frontend**:
   ```bash
   npm run build
   ```

4. **Activate the plugin** in WordPress Admin:
   - Go to **Plugins** → **Installed Plugins**
   - Find **Employee Manager**
   - Click **Activate**

5. **Database Setup** - Automatic on activation:
   - Creates `wp_employee_manager` table
   - Creates custom roles (HR Manager, Department Manager)
   - Sets up capabilities

6. **Navigate to the plugin**:
   - Go to **Employees** in the WordPress admin sidebar
   - Start managing your employee database

---

## 🗄️ Database Schema

### Table: `wp_employee_manager`

```sql
CREATE TABLE IF NOT EXISTS wp_employee_manager (
    id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(50) DEFAULT NULL,
    department ENUM('HR', 'Engineering', 'Marketing', 'Sales', 'Finance', 'Operations', 'Other') DEFAULT NULL,
    job_title VARCHAR(150) DEFAULT NULL,
    salary DECIMAL(15,2) DEFAULT NULL,
    date_joined DATE DEFAULT NULL,
    profile_photo_id BIGINT(20) UNSIGNED DEFAULT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    KEY department (department),
    KEY status (status),
    KEY date_joined (date_joined)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Indexes

- **Primary Key**: `id` - Fast lookups
- **Unique**: `email` - Prevents duplicate emails
- **Department**: Indexed for filtering
- **Status**: Indexed for filtering
- **Date Joined**: Indexed for sorting

---

## 🔌 REST API Documentation

### Base URL
```
/wp-json/employee-manager/v1/
```

### Authentication
All endpoints require WordPress authentication:
- Use nonce verification for frontend requests
- Use REST API authentication for external apps

### Endpoints

#### 1. List Employees
```
GET /employees
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number (default: 1) |
| `per_page` | int | Items per page (default: 10) |
| `search` | string | Search by name/email |
| `department` | string | Filter by department |
| `status` | string | Filter (active/inactive) |
| `sort_by` | string | Sort field (full_name, date_joined, id) |
| `sort_order` | string | Sort order (ASC, DESC) |

**Response Example:**
```json
{
  "data": [
    {
      "id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "department": "Engineering",
      "job_title": "Senior Developer",
      "phone": "+1 234 567 8900",
      "salary": "120000.00",
      "date_joined": "2023-01-15",
      "status": "active",
      "profile_photo_id": 123,
      "profile_photo_url": "http://example.com/wp-content/uploads/photo.jpg"
    }
  ],
  "page": 1,
  "pages": 5,
  "total": 47
}
```

#### 2. Get Single Employee
```
GET /employees/{id}
```

**Response:**
```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 234 567 8900",
  "department": "Engineering",
  "job_title": "Senior Developer",
  "salary": "120000.00",
  "date_joined": "2023-01-15",
  "status": "active",
  "profile_photo_id": 123,
  "profile_photo_url": "http://example.com/wp-content/uploads/photo.jpg",
  "created_at": "2023-01-15 10:30:00",
  "updated_at": "2024-03-01 15:45:00"
}
```

#### 3. Create Employee
```
POST /employees
```

**Request Body:**
```json
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1 234 567 8901",
  "department": "HR",
  "job_title": "HR Manager",
  "salary": "95000",
  "date_joined": "2024-01-10",
  "status": "active"
}
```

**Response:** Created employee object with ID

#### 4. Update Employee
```
PUT /employees/{id}
```

**Request Body:** Any of the fields above

**Response:** Updated employee object

#### 5. Delete Employee
```
DELETE /employees/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

#### 6. Bulk Actions
```
POST /employees/bulk
```

**Request Body:**
```json
{
  "action": "delete",
  "employee_ids": [1, 2, 3]
}
```

Or for status change:
```json
{
  "action": "change_status",
  "employee_ids": [1, 2, 3],
  "status": "inactive"
}
```

#### 7. Get Schema
```
GET /schema
```

**Response:** Dynamic schema for form rendering

---

## 📂 Project Structure

```
employee-manager/
├── employee-manager.php          # Main plugin file
├── package.json                  # Frontend dependencies
├── composer.json                 # Backend dependencies
├── README.md                      # This file
│
├── includes/                      # Backend PHP code
│   ├── Core/
│   │   ├── Plugin.php            # Main plugin class
│   │   ├── Capabilities.php      # Role and permissions
│   │   └── Admin.php             # Admin page registration
│   │
│   ├── Database/
│   │   ├── Manager.php           # Table creation & management
│   │   └── Query.php             # Query building utilities
│   │
│   ├── API/
│   │   ├── RestController.php    # REST endpoints
│   │   └── SchemaController.php  # Schema API
│   │
│   ├── Models/
│   │   └── Employee.php          # Employee CRUD model
│   │
│   ├── Admin/
│   │   └── SettingsPage.php      # Settings UI
│   │
│   ├── Settings/
│   │   └── Manager.php           # Settings handling
│   │
│   └── Utils/
│       ├── Sanitizer.php         # Input sanitization
│       └── Validator.php         # Data validation
│
├── src/                           # Frontend React/TypeScript
│   ├── index.tsx                 # Entry point
│   │
│   ├── components/
│   │   ├── EmployeeManagerApp.tsx       # Main app
│   │   ├── EmployeeTable.tsx            # Data table
│   │   ├── EmployeeViewModal.tsx        # Detail view
│   │   ├── DynamicForm/                 # Form components
│   │   │   ├── DynamicFormModal.tsx
│   │   │   ├── DynamicForm.tsx
│   │   │   └── components/
│   │   └── schemas/                     # Schema configs
│   │
│   ├── hooks/
│   │   ├── useSchema.ts          # Schema hook
│   │   └── usePagination.ts      # Pagination hook
│   │
│   ├── types/
│   │   ├── index.ts              # Employee types
│   │   └── schema.ts             # Schema types
│   │
│   ├── utils/
│   │   ├── formInitialize.ts     # Form setup
│   │   └── validation.ts         # Validation logic
│   │
│   └── constants/
│       └── departments.ts        # Department list
│
├── assets/                        # Static assets
│   ├── css/                       # Stylesheets
│   └── images/                    # Images
│
└── build/                         # Compiled React output
    ├── index.js                   # Bundled JavaScript
    └── index.asset.php            # Asset metadata
```

---

## 🛠️ Development

### Setup Development Environment

```bash
# Clone and navigate to plugin directory
cd wp-content/plugins/employee-manager

# Install dependencies
npm install
composer install

# Start development server with hot reload
npm start

# For production build
npm run build
```

### Development Workflow

1. **Frontend Development**:
   ```bash
   npm start
   # Changes in src/ will automatically rebuild
   ```

2. **Backend Development**:
   - Edit PHP files in `includes/`
   - No build required for PHP
   - Test via REST API or WordPress admin

3. **Component Naming**:
   - Follow React best practices
   - Use TypeScript for type safety
   - Component files: `.tsx` extension

4. **Testing Changes**:
   - Refresh WordPress admin page
   - Check browser console for errors
   - Check WordPress debug logs

### Code Structure Guidelines

**Backend (PHP):**
- Use PSR-4 autoloading with namespaces
- Follow WordPress coding standards
- Sanitize all inputs
- Validate all data
- Use proper error handling

**Frontend (React/TypeScript):**
- Use functional components with hooks
- Implement proper type definitions
- Follow React best practices
- Use WordPress components when available

---

## 🔐 Role-Based Access Control

### Default Roles

The plugin creates and manages the following roles:

| Role | Capability | Permissions |
|------|-----------|-------------|
| **Administrator** | Default WordPress Admin | Full access - Create, Read, Update, Delete |
| **HR Manager** | `manage_employees` | Can manage all employees, access settings |
| **Department Manager** | `read` (view only) | Can only view employee directory |

### Capability Mapping

| Action | Required Capability |
|--------|-------------------|
| View Employee List | `read` (Any logged-in user) |
| Create Employee | `manage_employees` |
| Edit Employee | `manage_employees` |
| Delete Employee | `manage_employees` |
| Bulk Actions | `manage_employees` |
| Settings Page | `manage_options` |

### Custom Implementation

To assign roles to users:

```php
// In WordPress admin
$user = get_user_by( 'login', 'username' );
$user->add_role( 'hr_manager' );
```

---

## 🔒 Security

### Security Features Implemented

✅ **Input Sanitization**
- All user inputs are sanitized using WordPress sanitization functions
- Prevents XSS attacks

✅ **Data Validation**
- Server-side validation for all inputs
- Type checking and format validation
- Email validation

✅ **SQL Injection Prevention**
- Uses WordPress `$wpdb` prepared statements
- No raw SQL queries

✅ **CSRF Protection**
- REST API uses nonce verification
- WordPress native CSRF protection

✅ **Permission Checks**
- All endpoints check user capabilities
- Role-based access control
- Capability verification before operations

✅ **Secure Password Storage**
- Salaries and sensitive data handled securely
- Uses WordPress sanitization

✅ **Media Security**
- File type validation for uploads
- File size limits enforced
- Stored in WordPress Media Library

### Security Best Practices

1. Always use `sanitize_text_field()` for text inputs
2. Use `sanitize_email()` for email fields
3. Use `intval()` for integer IDs
4. Use prepared statements with `$wpdb->prepare()`
5. Check nonces with `wp_verify_nonce()`
6. Check user capabilities with `current_user_can()`

---

## ⚡ Performance

### Optimization Strategies

1. **Database Indexes**
   - Department field indexed for quick filtering
   - Status field indexed for filtering
   - Date Joined indexed for sorting

2. **Server-Side Pagination**
   - Only loads required records per page
   - Handles up to 1000+ employees efficiently

3. **Query Optimization**
   - Selective field fetching
   - Proper WHERE clauses
   - LIMIT and OFFSET applied

4. **Frontend Caching**
   - LocalStorage for pagination settings
   - Component state management

5. **React Optimization**
   - Memoized components
   - Efficient re-rendering
   - Lazy loading when needed

### Performance Tips

- Use appropriate pagination size (5-50 items)
- Leverage search and filter for large datasets
- Clear old data regularly
- Monitor database growth

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Table not found" error
**Solution:**
1. Check if plugin is activated
2. Go to plugins and deactivate then reactivate
3. Check WordPress debug.log for errors
4. Verify database permissions

#### Issue: REST API returning 403 Forbidden
**Solution:**
1. Ensure user is logged in
2. Check user role and capabilities
3. Verify REST API is enabled
4. Check CORS settings if using external requests

#### Issue: Profile photo not uploading
**Solution:**
1. Check max upload file size in settings
2. Verify WordPress uploads directory permissions
3. Check file type (must be image)
4. Review error logs for details

#### Issue: Pagination not working correctly
**Solution:**
1. Check `per_page` parameter
2. Verify total item count
3. Check for filter conflicts
4. Clear browser cache and localStorage

#### Issue: Form fields not appearing
**Solution:**
1. Verify schema API is responding
2. Check browser console for errors
3. Restart development server
4. Rebuild frontend: `npm run build`

### Debug Mode

Enable debug logging in WordPress:

```php
// In wp-config.php
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false );
```

View logs:
```bash
tail -f wp-content/debug.log
```

---

## 📝 Usage Examples

### Creating an Employee via REST API

```bash
curl -X POST http://localhost/wp-json/employee-manager/v1/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "full_name": "Jane Doe",
    "email": "jane@company.com",
    "phone": "+1 234 567 8900",
    "department": "Engineering",
    "job_title": "Frontend Developer",
    "salary": "95000",
    "date_joined": "2024-01-15",
    "status": "active"
  }'
```

### Searching Employees

```bash
curl "http://localhost/wp-json/employee-manager/v1/employees?search=john&department=Engineering&page=1&per_page=10"
```

### Bulk Delete Employees

```bash
curl -X POST http://localhost/wp-json/employee-manager/v1/employees/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "action": "delete",
    "employee_ids": [1, 2, 3, 4, 5]
  }'
```

---

## 👨‍💻 Author

**Faisal Ami Abir**
- Email: faisalamin50106@gmail.com

---

## 📄 License

This plugin is provided as-is for the WeDevs Assignment. Modify and distribute freely with attribution.

---

## 🎓 Assignment Features Completed

✅ WordPress plugin architecture with OOP
✅ REST API driven data layer
✅ Media handling (profile photos)
✅ Secure CRUD operations with sanitization & validation
✅ DataViews for listing employees
✅ Dynamic form rendering
✅ Search, filter, and sorting functionality
✅ Server-side pagination with localStorage persistence
✅ Bulk actions (delete, change status)
✅ Employee detail modal view
✅ Settings panel (max upload size)
✅ Role-based access control
✅ Modern React + TypeScript frontend
✅ Plugin UI components for consistent design
✅ Database schema with proper indexing
✅ Comprehensive REST API documentation
✅ Security best practices implementation
✅ Performance optimization



**Last Updated:** April 7, 2026
**Version:** 1.0.0
