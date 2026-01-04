import { api } from "./api";
import type { Component, ComponentInsert } from "./types";

export const componentService = {
  /**
   * Get all components
   */
  async getAllComponents(): Promise<Component[]> {
    return api.get<Component[]>("/components/");
  },

  /**
   * Get a specific component by ID
   */
  async getComponent(id: number): Promise<Component> {
    return api.get<Component>(`/components/${id}`);
  },

  /**
   * Add a new component
   */
  async addComponent(component: ComponentInsert): Promise<void> {
    return api.post<void>("/components/create", component);
  },

  /**
   * Add multiple components
   */
  async addManyComponents(components: ComponentInsert[]): Promise<void> {
    return api.post<void>("/components/create", components);
  },
};
