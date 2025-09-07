// Type definitions based on the Zig API structures

export interface Component {
  id: number;
  type_id: number;
  value: string;
  quantity: number;
  footprint: string;
  vendor_id: number;
  description: string;
  vendor_part_number: string;
  price: number; // Price in cents
}

export interface ComponentInsert {
  type_id: number;
  value: string;
  quantity: number;
  footprint: string;
  vendor_id: number;
  description: string;
  vendor_part_number: string;
  price: number; // Price in cents
}

export interface Vendor {
  id: number;
  name: string;
  description: string;
  url: string;
}

export interface VendorInsert {
  name: string;
  description: string;
  url: string;
}

export interface Type {
  id: number;
  name: string;
  description: string;
  unit: string;
}

export interface TypeInsert {
  name: string;
  description: string;
  unit: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
