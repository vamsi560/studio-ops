'use server';

import { createResources, getAllResources } from '@/lib/db/queries/resources';
import type { Resource } from '@/lib/types';

export async function getResources(): Promise<Resource[]> {
  try {
    return await getAllResources();
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw new Error('Failed to fetch resources');
  }
}

export async function addResources(resources: Omit<Resource, 'id'>[]): Promise<Resource[]> {
  try {
    return await createResources(resources);
  } catch (error) {
    console.error('Error creating resources:', error);
    throw new Error('Failed to create resources');
  }
}

