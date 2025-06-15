
# FuelSync Multi-Tenant API Specification

## Overview

The FuelSync API is designed with a multi-tenant architecture where:
- **Super Admins** have system-wide access
- **Owners** can manage multiple stations and their employees
- **Employees** are tied to specific stations through the user_stations junction table

## Authentication & Authorization

### User Roles

```typescript
type UserRole = 'superadmin' | 'owner' | 'employee';
```

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| `superadmin` | Full system access, can manage all users and stations |
| `owner` | Can manage own stations and employees within those stations |
| `employee` | Can only access data for assigned station |

## Core Entities

### User
```typescript
interface User {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  password: string;
  role: 'superadmin' | 'owner' | 'employee';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  stations: Station[]; // Related stations through ownership or user_stations
}
```

### Station
```typescript
interface Station {
  id: number;
  name: string;
  brand: 'IOCL' | 'BPCL' | 'HPCL';
  address: string | null;
  owner_id: number; // References users.id where role = 'owner'
  current_plan_id: number | null;
  created_at: string;
  updated_at: string;
}
```

### UserStation (Junction Table)
```typescript
interface UserStation {
  user_id: number;
  station_id: number;
  created_at: string;
}
```

### Plan
```typescript
interface Plan {
  id: number;
  name: string;
  price_monthly: number | null;
  max_pumps: number | null;
  max_nozzles: number | null;
  max_employees: number | null;
  max_ocr_monthly: number | null;
  allow_manual_entry: boolean;
  edit_fuel_type: boolean;
  export_reports: boolean;
  features: Record<string, any>;
  is_active: boolean;
  created_at: string;
}
```

## Database Schema Changes

### Key Updates:
1. **Removed `station_id` from users table** - Users are now linked to stations through the `user_stations` junction table or ownership
2. **Added `user_stations` junction table** - Enables many-to-many relationships between users and stations
3. **Owners manage stations** - Owners are linked to stations via `owner_id` in the stations table
4. **Employees can access multiple stations** - Through the `user_stations` table

### Data Access Patterns:

#### For Owners:
```sql
-- Get stations owned by a user
SELECT * FROM stations WHERE owner_id = :user_id;
```

#### For Employees:
```sql
-- Get stations accessible to an employee
SELECT s.* FROM stations s
JOIN user_stations us ON s.id = us.station_id
WHERE us.user_id = :user_id;
```

#### For Super Admins:
```sql
-- Get all stations
SELECT * FROM stations;
```

## API Endpoints

### Authentication

#### POST /api/v1/auth/login
Login user and return JWT token with station information.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "owner",
      "stations": [
        {
          "id": 1,
          "name": "Main Station",
          "brand": "IOCL",
          "address": "123 Main St"
        }
      ]
    },
    "token": "jwt-token-here"
  }
}
```

### User Management

#### GET /api/v1/admin/users
Get all users in the system (Super Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "owner",
      "is_active": true,
      "stations": [...],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/v1/admin/users
Create a new user.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "phone": "+91-9999999999",
  "password": "password123",
  "role": "employee",
  "station_ids": [1, 2] // For employees - stations they can access
}
```

#### POST /api/v1/admin/users/owner-with-station
Create an owner with their first station.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "user": {
    "name": "Owner Name",
    "email": "owner@example.com",
    "phone": "+91-9999999999",
    "password": "password123"
  },
  "station": {
    "name": "Station Name",
    "brand": "IOCL",
    "address": "Station Address",
    "plan_id": 1
  }
}
```

### Station Management

#### GET /api/v1/stations
Get stations accessible to the authenticated user.
- Super Admin: All stations
- Owner: Owned stations only
- Employee: Assigned stations only

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Main Station",
      "brand": "IOCL",
      "address": "123 Main St",
      "owner_id": 1,
      "current_plan_id": 1,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/v1/stations
Create a new station (Owner/Super Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "New Station",
  "brand": "BPCL",
  "address": "456 New St",
  "plan_id": 2
}
```

#### GET /api/v1/stations/:id/employees
Get employees for a specific station.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Employee Name",
      "email": "employee@example.com",
      "phone": "+91-9999999999",
      "role": "employee",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/v1/stations/:id/employees
Assign an employee to a station.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "user_id": 5
}
```

#### DELETE /api/v1/stations/:station_id/employees/:user_id
Remove an employee from a station.

**Headers:** `Authorization: Bearer <token>`

### OCR Readings

#### GET /api/v1/ocr-readings
Get OCR readings filtered by user permissions.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `station_id`: Filter by station (optional for super admin)
- `date`: Filter by date (YYYY-MM-DD)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "station_id": 1,
      "nozzle_id": 1,
      "source": "manual",
      "reading_date": "2024-01-01",
      "reading_time": "08:00:00",
      "cumulative_vol": 1234.56,
      "image_url": null,
      "created_by": 5,
      "created_at": "2024-01-01T08:05:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### POST /api/v1/ocr-readings
Create a new OCR reading.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "nozzle_id": 1,
  "source": "manual",
  "reading_date": "2024-01-01",
  "reading_time": "08:00:00",
  "cumulative_vol": 1234.56,
  "image_url": null
}
```

### Sales Data

#### GET /api/v1/sales
Get sales data filtered by user permissions.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `station_id`: Filter by station (optional for super admin)
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "station_id": 1,
      "nozzle_id": 1,
      "reading_id": 1,
      "delta_volume_l": 45.5,
      "price_per_litre": 105.50,
      "total_amount": 4800.25,
      "created_at": "2024-01-01T08:00:00Z"
    }
  ]
}
```

#### GET /api/v1/sales/summary
Get sales summary for dashboard.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `station_id`: Filter by station (optional for super admin)
- `period`: 'today' | 'week' | 'month' (default: 'today')

**Response:**
```json
{
  "success": true,
  "data": {
    "total_revenue": 125000.50,
    "total_volume": 1234.5,
    "total_transactions": 89,
    "average_sale": 1404.50,
    "fuel_breakdown": {
      "PETROL": {
        "volume": 734.2,
        "revenue": 77450.30,
        "transactions": 52
      },
      "DIESEL": {
        "volume": 500.3,
        "revenue": 47550.20,
        "transactions": 37
      }
    }
  }
}
```

## Business Rules

1. **Owner Creation**: When creating an owner, optionally create their first station simultaneously
2. **Employee Assignment**: Employees can be assigned to multiple stations through user_stations table
3. **Station Ownership**: Each station has exactly one owner, but owners can have multiple stations
4. **Plan Limits**: Stations are subject to plan limits (max pumps, employees, OCR readings, etc.)
5. **Data Isolation**: Complete data isolation between different owners' stations
6. **Access Control**: Users can only access data for stations they own or are assigned to

## Example Workflows

### 1. Super Admin Creates Owner with First Station

```bash
POST /api/v1/admin/users/owner-with-station
{
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secure123"
  },
  "station": {
    "name": "John's Fuel Station",
    "brand": "IOCL",
    "address": "123 Main St",
    "plan_id": 2
  }
}
```

### 2. Owner Adds Additional Station

```bash
POST /api/v1/stations
{
  "name": "John's Second Station",
  "brand": "BPCL", 
  "address": "456 Second St",
  "plan_id": 2
}
```

### 3. Owner Creates and Assigns Employee

```bash
# Create employee
POST /api/v1/admin/users
{
  "name": "Jane Employee",
  "email": "jane@example.com",
  "role": "employee",
  "password": "password123"
}

# Assign to station
POST /api/v1/stations/1/employees
{
  "user_id": 5
}
```

### 4. Employee Records OCR Reading

```bash
POST /api/v1/ocr-readings
{
  "nozzle_id": 1,
  "source": "manual",
  "reading_date": "2024-01-01",
  "reading_time": "08:00:00",
  "cumulative_vol": 1234.56
}
```

## Migration Notes

### From Previous Schema:
1. **station_id removed from users table** - Relationship now managed through user_stations
2. **Data migration required** - Existing employee-station relationships need to be moved to user_stations table
3. **API updates** - Responses now include stations array instead of single station_id
4. **Authentication flow** - Login now returns user with associated stations array

### Database Migration Steps:
```sql
-- 1. Create user_stations table
CREATE TABLE user_stations (
  user_id INTEGER REFERENCES users(id),
  station_id INTEGER REFERENCES stations(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, station_id)
);

-- 2. Migrate existing data (if any station_id exists in users)
INSERT INTO user_stations (user_id, station_id)
SELECT id, station_id FROM users 
WHERE station_id IS NOT NULL AND role = 'employee';

-- 3. Remove station_id column from users
ALTER TABLE users DROP COLUMN station_id;
```

This updated architecture provides better flexibility for multi-station management while maintaining clear data isolation and access controls.
