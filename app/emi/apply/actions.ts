'use server'

import { getFaqs } from '@/app/api/services/misc.service'

export async function fetchFaqs(params: { type?: string; per_page?: number; page?: number }) {
    return getFaqs(params)
}
