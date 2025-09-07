# Inventorus Frontend - Pages and Navigation

This document describes the page structure and navigation in the Inventorus React Router application.

## 🧭 Navigation Structure

The application now includes a responsive navigation bar with the following pages:

### **🏠 Dashboard (`/`)**
- **Overview**: Main dashboard with statistics and quick actions
- **Features**:
  - Summary cards showing total counts of components, vendors, and types
  - Recent components list
  - Low stock alerts (components with quantity < 10)
  - Quick action buttons for adding new items

### **🔧 Components (`/components`)**
- **Purpose**: Manage electronic component inventory
- **Features**:
  - Comprehensive component listing in table format
  - Add new components with detailed form
  - Filter and search capabilities
  - Shows vendor name, type, price, quantity, and specifications

### **🏪 Vendors (`/vendors`)**
- **Purpose**: Manage component suppliers and vendors
- **Features**:
  - Card-based vendor directory
  - Add new vendor form
  - Vendor contact information and websites
  - Clean, organized vendor profiles

### **📂 Types (`/types`)**
- **Purpose**: Manage component categories and types
- **Features**:
  - Visual component type categories with icons
  - Add new component type form
  - Unit of measurement tracking
  - Category descriptions and specifications

## 🎨 UI Components

### **Navigation Bar (`Navbar.tsx`)**
- Responsive design with mobile hamburger menu
- Active route highlighting
- Consistent branding with Inventorus logo
- Smooth transitions and hover effects

### **Form Components**
- **AddComponentForm**: Full component creation with vendor/type dropdowns
- **AddVendorForm**: Vendor registration with website validation  
- **AddTypeForm**: Component type creation with unit specification

## 📱 Responsive Design

All pages are fully responsive and include:
- **Mobile-first design** with Tailwind CSS
- **Responsive grids** that adapt to screen size
- **Touch-friendly interfaces** for mobile devices
- **Consistent spacing and typography** across all pages

## 🔄 Data Flow

1. **API Integration**: All pages use the service layer for data fetching
2. **Real-time Updates**: Forms refresh data lists after successful submissions
3. **Error Handling**: Comprehensive error states and loading indicators
4. **Optimistic UI**: Immediate feedback for user actions

## 🎯 Key Features

### **Dashboard Highlights**
- **Smart Alerts**: Low stock warnings with visual indicators
- **Quick Stats**: At-a-glance inventory overview
- **Recent Activity**: Last added components
- **Action Center**: Direct links to add new items

### **Data Management**
- **CRUD Operations**: Full create, read, update capabilities
- **Form Validation**: Client-side validation with helpful error messages
- **Bulk Operations**: Support for adding multiple components
- **Data Relationships**: Proper linking between components, vendors, and types

### **User Experience**
- **Intuitive Navigation**: Clear page hierarchy and breadcrumbs
- **Consistent Layouts**: Unified design patterns across pages
- **Fast Loading**: Optimized data fetching and caching
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Getting Started

1. **Start the backend**: `cd zig-api-test && export INVENTORUS_TEST=1 && zig build run`
2. **Start the frontend**: `cd inventorus-frontend && npm run dev`
3. **Open browser**: Navigate to `http://localhost:5173`

The navigation will automatically work with the proxy configuration to communicate with the Zig API backend.

## 📋 Usage Tips

- **Start with Types**: Create component types first (Resistor, Capacitor, etc.)
- **Add Vendors**: Register your suppliers before adding components
- **Bulk Import**: Use the "Add Many Components" feature for large inventories
- **Monitor Stock**: Check the dashboard regularly for low stock alerts
- **Organize**: Use descriptive names and consistent naming conventions
