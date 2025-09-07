import { api } from './api';
import type { Type, TypeInsert } from './types';

export const typeService = {
  /**
   * Get all types
   */
  async getAllTypes(): Promise<Type[]> {
    return api.get<Type[]>('/types/');
  },

  /**
   * Get a specific type by ID
   */
  async getType(id: number): Promise<Type> {
    return api.get<Type>(`/types/${id}`);
  },

  /**
   * Add a new type
   */
  async addType(type: TypeInsert): Promise<void> {
    return api.post<void>('/types/add', type);
  },
};
