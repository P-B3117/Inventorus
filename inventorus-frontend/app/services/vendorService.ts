import { api } from './api';
import type { Vendor, VendorInsert } from './types';

export const vendorService = {
  /**
   * Get all vendors
   */
  async getAllVendors(): Promise<Vendor[]> {
    return api.get<Vendor[]>('/vendors/');
  },

  /**
   * Get a specific vendor by ID
   */
  async getVendor(id: number): Promise<Vendor> {
    return api.get<Vendor>(`/vendors/${id}`);
  },

  /**
   * Add a new vendor
   */
  async addVendor(vendor: VendorInsert): Promise<void> {
    return api.post<void>('/vendors/add', vendor);
  },
};
