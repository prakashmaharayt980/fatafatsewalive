// ══════════════════════════════════════════════════════════════
// Exchange Helpers — Types, calculations, condition questions
// ══════════════════════════════════════════════════════════════

export interface BrandItem {
    id: number
    name: string
    slug: string
    image?: string
}

export interface ProductListItem {
    id: number | string
    name: string
    slug: string
    image: { full: string; thumb: string; preview: string } | string
    price: number | string
    discounted_price: number | string
    created_at: string
    average_rating?: number
    colors?: string[]
    variants?: Array<{
        id: number
        attributes: Record<string, string>
        image?: { full: string; thumb: string; preview?: string | null }
        price: number
        discounted_price: number
    }>
    brand?: { id: number; name: string; slug: string }
}

export interface FullProduct {
    id: number
    name: string
    slug: string
    price: number
    discounted_price: number
    created_at: string
    image: { full: string; thumb: string; preview: string }
    images: Array<{
        id: number
        url: string
        thumb: string
        preview: string
        color?: string | null
        custom_properties?: { color?: string; is_default?: boolean }
    }>
    variants: Array<{
        id: number
        product_id: number
        price: number
        discounted_price: number
        quantity: number
        attributes: Record<string, string>
        image?: { full: string; thumb: string; preview?: string | null }
    }>
    brand: { id: number; name: string; slug: string }
    highlights?: string
    description?: string
}

export interface ColorOption {
    name: string
    hex: string
    image: string
    variantId: number
    price: number
    discountedPrice: number
}

export type ConditionAnswer = Record<string, number>

// ── Condition Questions (Category & Brand Specific) ────────────────
export const GET_CONDITION_QUESTIONS = (categorySlug: string, brandName: string = '') => {
    const isLaptop = categorySlug?.toLowerCase().includes('laptop')
    const isApple = brandName?.toLowerCase().includes('apple')
    
    if (isLaptop) {
        return [
            {
                key: 'screen',
                label: `Is the ${isApple ? 'Retina ' : ''}display flawless and scratch-free?`,
                icon: '💻',
                options: [ { label: 'Yes', value: 1.0 }, { label: 'No', value: 0.5 } ],
            },
            {
                key: 'body',
                label: 'Are the hinges, chassis, and keys in good condition?',
                icon: '🛡️',
                options: [ { label: 'Yes', value: 1.0 }, { label: 'No', value: 0.6 } ],
            },
            {
                key: 'battery',
                label: 'Does the battery hold a charge for normal usage duration?',
                icon: '🔋',
                options: [ { label: 'Yes', value: 1.0 }, { label: 'No', value: 0.5 } ],
            },
            {
                key: 'ports',
                label: 'Do all ports, trackpad, and performance feel optimal?',
                icon: '🔌',
                options: [ { label: 'Yes', value: 1.0 }, { label: 'No', value: 0.2 } ],
            },
        ]
    }

    // Default Mobile
    return [
        {
            key: 'screen',
            label: `Is the ${isApple ? 'iPhone' : 'mobile'} screen flawless and scratch-free?`,
            icon: '📱',
            options: [ { label: 'Yes', value: 1.0 }, { label: 'No', value: 0.5 } ],
        },
        {
            key: 'body',
            label: 'Is the device body free from major dents or scratches?',
            icon: '🛡️',
            options: [ { label: 'Yes', value: 1.0 }, { label: 'No', value: 0.6 } ],
        },
        {
            key: 'battery',
            label: `Is the ${isApple ? 'Peak Performance Capability' : 'battery health'} normal?`,
            icon: '🔋',
            options: [ { label: 'Yes', value: 1.0 }, { label: 'No', value: 0.5 } ],
        },
        {
            key: 'features',
            label: `Are all features (${isApple ? 'FaceID/iCloud' : 'Camera/Fingerprint/Speaker'}) working?`,
            icon: '⚙️',
            options: [ { label: 'Yes', value: 1.0 }, { label: 'No', value: 0.2 } ],
        },
    ]
}

// Fallback constant to maintain backward compatibility during transition
export const CONDITION_QUESTIONS = GET_CONDITION_QUESTIONS('mobile')

// ── Problem Options (Category-Specific) ─────────────────────
export const GET_PROBLEM_OPTIONS = (categorySlug: string): string[] => {
    const isLaptop = categorySlug?.toLowerCase().includes('laptop')
    if (isLaptop) return [
        'Cracked screen', 'Keyboard issues', 'Battery degraded',
        'Hinge broken', 'Overheating', 'Port damage', 'Slow performance', 'No issues',
    ]
    return [
        'Cracked screen', 'Dead battery', 'Camera problem',
        'Speaker / mic', 'Water damage', 'Charging issue', 'Button stuck', 'No issues',
    ]
}

export const REASON_OPTIONS = [
    'Upgrading device',
    'Switching brand',
    'Need cash',
    'Device too old',
    'Other',
]

// ── Age-based depreciation ───────────────────────────────────
export function monthsSince(dateStr: string): number {
    const created = new Date(dateStr)
    // Stabilize 'now' for build-time generation to avoid hydration mismatches
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth())
}


export function getDepreciationRate(ageMonths: number): number {
    if (ageMonths <= 6) return 0.90
    if (ageMonths <= 12) return 0.75
    if (ageMonths <= 24) return 0.60
    if (ageMonths <= 36) return 0.45
    return 0.30
}

export function getConditionMultiplier(answers: ConditionAnswer): number {
    const values = Object.values(answers);
    if (values.length === 0) return 1;
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.round(avg * 100) / 100
}

export function calculateExchangeValue(
    price: number | string,
    createdAt: string,
    conditionAnswers?: ConditionAnswer
): number {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (!numPrice || isNaN(numPrice)) return 0
    const age = monthsSince(createdAt)
    const depreciation = getDepreciationRate(age)
    const condition = conditionAnswers ? getConditionMultiplier(conditionAnswers) : 1
    return Math.round(numPrice * depreciation * condition)
}

export function getMaxExchangeValue(price: number | string, createdAt: string): number {
    return calculateExchangeValue(price, createdAt)
}

// ── Extract unique colors from variants ──────────────────────
const COLOR_HEX_MAP: Record<string, string> = {
    black: '#1A1A1A', white: '#F5F5F5', red: '#E53935', blue: '#1E88E5',
    green: '#43A047', gold: '#FFD700', silver: '#C0C0C0', purple: '#8E24AA',
    pink: '#EC407A', gray: '#9E9E9E', grey: '#9E9E9E', orange: '#FF9800',
    brown: '#795548', cream: '#F5E6CA', midnight: '#1F2020', titanium: '#9A9A96',
    graphite: '#4A4A4A', natural: '#9A9A96', violet: '#9B8BB4', lime: '#B5D63D',
    lavender: '#C4A7D7', starlight: '#FAF6F2', coral: '#FF7F50', bronze: '#CD7F32',
}

export function guessColorHex(colorName: string): string {
    const lower = colorName.toLowerCase()
    for (const [key, hex] of Object.entries(COLOR_HEX_MAP)) {
        if (lower.includes(key)) return hex
    }
    return '#888888'
}

export function extractColorsFromVariants(product: FullProduct): ColorOption[] {
    const colorMap = new Map<string, ColorOption>()
    for (const v of product.variants) {
        const colorName = v.attributes?.color || v.attributes?.Color
        if (!colorName || colorMap.has(colorName)) continue
        const img = v.image?.thumb || v.image?.full || (typeof product.image === 'string' ? product.image : product.image.thumb)
        colorMap.set(colorName, {
            name: colorName,
            hex: guessColorHex(colorName),
            image: img,
            variantId: v.id,
            price: v.price,
            discountedPrice: v.discounted_price,
        })
    }
    return Array.from(colorMap.values())
}
