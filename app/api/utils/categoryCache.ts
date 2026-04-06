'use server'

import { getAllCategories } from '@/app/api/services/category.service';
import { getBlogCategories } from '@/app/api/services/blog.service';

export async function getCachedAllCategories() {
    'use cache';
    return getAllCategories();
}

export async function getCachedBlogCategories() {
    'use cache';
    return getBlogCategories();
}
