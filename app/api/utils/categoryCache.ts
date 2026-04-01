'use server'

import { getCategoryProducts } from '@/app/api/services/category.service';
import type { SearchParams } from '@/app/category/[slug]/types';

export const getCachedCategoryProducts = async (slug: string, params?: SearchParams) =>
    getCategoryProducts(slug, params ?? {});
