// ══════════════════════════════════════════════════════════════
// Exchange Helpers — Types, calculations, filtering
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
    brand: { id: number; name: string; slug: string }
    highlights?: string
    description?: string
    attributes?: {
        product_attributes?: Record<string, string>
        [key: string]: any
    }
}

export type ConditionAnswer = Record<string, any>

export const depreciationRules = {
    condition: {
        Excellent: 0,
        Good: 10,
        Average: 20,
        Poor: 40
    },
    screen: {
        'No scratches': 0,
        'Minor scratches': 5,
        'Cracked': 20
    },
    battery: {
        Good: 0,
        Average: 10,
        Poor: 20
    }
}

// ── Category Filtering ─────────────────────────────────────
const EXCHANGE_SLUGS = ['mobile', 'laptop', 'smartphone', 'macbook']

export const IS_EXCHANGE_CATEGORY = (cat: any) => {
    const title = cat?.title?.toLowerCase() ?? ''
    const slug = cat?.slug?.toLowerCase() ?? ''
    return EXCHANGE_SLUGS.some(s => title.includes(s) || slug.includes(s))
}

// ── Image Helper ───────────────────────────────────────────
export const getThumbnail = (p: any): string => {
    if (!p) return '/imgfile/logoimg.png'
    const img = p.image ?? p.thumb
    if (typeof img === 'string') return img ?? '/imgfile/logoimg.png'
    return img?.thumb ?? img?.full ?? img?.url ?? '/imgfile/logoimg.png'
}

export const parsePrice = (price: number | string | null | undefined): number => {
    if (price === null || price === undefined) return 0
    if (typeof price === 'number') return price
    const cleaned = price.toString().replace(/[^\d.]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
}

// ── Arko-Style Deduction & Accessory Values ─────────────────
// Values are expressed as multipliers (deductions from base) or fixed additions
export const EVALUATION_VALUES = {
    // Basic Switches
    switch_off_multiplier: 0.2, // 80% deduction if it doesn't turn on
    not_registered_multiplier: 0.7, // 30% deduction if not MDMS registered

    // Accessories (Fixed Credits)
    original_charger: 1200,
    purchase_bill: 800,
    matching_box: 500,

    // Warranty (Addition)
    under_warranty_multiplier: 1.1, // 10% bonus if under warranty
}

// ── Condition Questions (Arko Store Style Sequence) ───────────
const SPEC_MAPPING: Record<string, { label: string; icon: string; multiplier: number }> = {
    'display': { label: 'Display / Screen', icon: 'Monitor', multiplier: 0.7 },
    'processor': { label: 'Processor', icon: 'Settings2', multiplier: 0.8 },
    'ram': { label: 'Memory (RAM)', icon: 'HardDrive', multiplier: 0.9 },
    'battery': { label: 'Battery', icon: 'Battery', multiplier: 0.85 },
    'storage': { label: 'Storage', icon: 'HardDrive', multiplier: 0.88 },
    'rom': { label: 'Storage', icon: 'HardDrive', multiplier: 0.88 },
    'camera': { label: 'Camera', icon: 'Camera', multiplier: 0.92 },
}

export const GET_CONDITION_QUESTIONS = (categorySlug: string, brandName: string = '', specifications: Record<string, string> = {}) => {
    const isLaptop = categorySlug?.toLowerCase().includes('laptop')
    const isApple = brandName?.toLowerCase().includes('apple')
    const deviceType = isLaptop ? 'laptop' : 'phone'

    const problemOptions = [
        { key: 'screen_scratches', label: 'Scratches on screen', icon: 'XCircle', multiplier: 0.95 },
        { key: 'screen_broken', label: 'Screen Broken', icon: 'AlertTriangle', multiplier: 0.6 },
        { key: 'connectivity', label: 'Problems with WiFi/GPS/Bluetooth', icon: 'Wifi', multiplier: 0.8 },
        { key: 'speakers', label: 'Problem with speakers', icon: 'Volume2', multiplier: 0.95 },
    ]

    // Dynamically add technical specification checks
    Object.entries(specifications).forEach(([rawKey, value]) => {
        const key = rawKey.toLowerCase()
        const mapping = Object.entries(SPEC_MAPPING).find(([mKey]) => key.includes(mKey))?.[1]
        
        if (mapping && !problemOptions.find(o => o.key === `spec_${key}`)) {
            problemOptions.push({
                key: `spec_${key}`,
                label: `Faulty ${mapping.label} (${value})`,
                icon: mapping.icon,
                multiplier: mapping.multiplier
            })
        }
    })

    return [
        {
            key: 'condition_grade',
            label: 'Overall Device Condition',
            type: 'grade',
            options: [
                { key: 'new',         label: 'Brand New',        description: 'Unopened or unused',              multiplier: 1.0  },
                { key: 'like_new',    label: 'Like New',         description: 'Minimal use, no visible marks',   multiplier: 0.95 },
                { key: 'good',        label: 'Good',             description: 'Normal wear, fully working',      multiplier: 0.85 },
                { key: 'some_damage', label: 'Some Damage',      description: 'Minor scratches or dents',         multiplier: 0.7  },
                { key: 'old',         label: 'Old / Heavy Use',  description: 'Visible wear and damage',          multiplier: 0.5  },
            ]
        },
        {
            key: 'switch_on',
            label: `Does your device Switch On?`,
            type: 'boolean',
            options: [{ label: 'YES', value: 1.0 }, { label: 'NO', value: EVALUATION_VALUES.switch_off_multiplier }],
        },
        {
            key: 'mdms_registered',
            label: `Is your device MDMS Registered?`,
            type: 'boolean',
            options: [{ label: 'YES', value: 1.0 }, { label: 'NO', value: EVALUATION_VALUES.not_registered_multiplier }],
        },
        {
            key: 'problems',
            label: `Technical Inspection: Select any faulty components`,
            type: 'multiple',
            options: problemOptions,
        },
        {
            key: 'under_warranty',
            label: `Is your ${deviceType} under Warranty?`,
            type: 'boolean',
            options: [{ label: 'YES', value: EVALUATION_VALUES.under_warranty_multiplier }, { label: 'NO', value: 1.0 }],
        },
        {
            key: 'accessories',
            label: `Please Confirm, If You Can Return Accessories/Purchase Bill`,
            type: 'multiple',
            options: [
                { key: 'charger', label: 'Original Charger/Accessories', icon: 'Cable', credit: EVALUATION_VALUES.original_charger },
                { key: 'bill', label: 'Purchase Bill', icon: 'Receipt', credit: EVALUATION_VALUES.purchase_bill },
                { key: 'box', label: 'IMEI Matching Box', icon: 'Package', credit: EVALUATION_VALUES.matching_box },
            ],
        }
    ]
}

// ── Detailed Value Calculation ──────────────────────────────
export function calculateExchangeValueBreakdown(
    price: number | string,
    createdAt: string,
    answers: ConditionAnswer
) {
    let basePrice = parsePrice(price)
    if (!basePrice) return { total: 0, breakdown: [] }

    // 1. Age Depreciation
    const createdDate = new Date(createdAt)
    const now = new Date()
    const ageMonths = (now.getFullYear() - createdDate.getFullYear()) * 12 + (now.getMonth() - createdDate.getMonth())

    let ageMultiplier = 0.3
    if (ageMonths <= 6) ageMultiplier = 0.9
    else if (ageMonths <= 12) ageMultiplier = 0.75
    else if (ageMonths <= 24) ageMultiplier = 0.6
    else if (ageMonths <= 36) ageMultiplier = 0.45

    const depreciatedValue = Math.round(basePrice * ageMultiplier)
    const breakdown = [{ label: 'Market Value (Depreciated)', value: depreciatedValue }]

    let currentValue = depreciatedValue

    // Condition Grade (applied first on the depreciated base)
    if (answers.condition_grade?.multiplier !== undefined && answers.condition_grade.multiplier < 1.0) {
        const deduction = Math.round(currentValue * (1 - answers.condition_grade.multiplier))
        currentValue -= deduction
        breakdown.push({ label: `Condition: ${answers.condition_grade.label}`, value: -deduction })
    }

    // 2. Evaluation Logic
    // Switch On
    if (answers.switch_on === EVALUATION_VALUES.switch_off_multiplier) {
        const deduction = Math.round(currentValue * (1 - EVALUATION_VALUES.switch_off_multiplier))
        currentValue -= deduction
        breakdown.push({ label: 'Device not switching on', value: -deduction })
    }

    // MDMS Registered
    if (answers.mdms_registered === EVALUATION_VALUES.not_registered_multiplier) {
        const deduction = Math.round(currentValue * (1 - EVALUATION_VALUES.not_registered_multiplier))
        currentValue -= deduction
        breakdown.push({ label: 'MDMS not registered', value: -deduction })
    }

    // Problems
    if (Array.isArray(answers.problems)) {
        answers.problems.forEach((p: any) => {
            const deduction = Math.round(currentValue * (1 - p.multiplier))
            currentValue -= deduction
            breakdown.push({ label: p.label, value: -deduction })
        })
    }

    // Warranty
    if (answers.under_warranty === EVALUATION_VALUES.under_warranty_multiplier) {
        const bonus = Math.round(currentValue * (EVALUATION_VALUES.under_warranty_multiplier - 1))
        currentValue += bonus
        breakdown.push({ label: 'Under Warranty Bonus', value: bonus })
    }

    // Accessories
    if (Array.isArray(answers.accessories)) {
        answers.accessories.forEach((acc: any) => {
            currentValue += acc.credit
            breakdown.push({ label: acc.label, value: acc.credit })
        })
    }

    const applyDepreciation = <T extends keyof typeof depreciationRules>(category: T, answerKey: string, label: string) => {
        const rules = depreciationRules[category]
        const rule = rules[answerKey as keyof typeof rules]
        if (rule === undefined) return
        const deduction = Math.round(currentValue * (rule / 100))
        currentValue -= deduction
        if (deduction > 0) breakdown.push({ label: `${label} (${answerKey})`, value: -deduction })
    }

    if (typeof answers.condition === 'string') {
        applyDepreciation('condition', answers.condition, 'Overall condition')
    }
    if (typeof answers.screen === 'string') {
        applyDepreciation('screen', answers.screen, 'Screen condition')
    }
    if (typeof answers.battery === 'string') {
        applyDepreciation('battery', answers.battery, 'Battery health')
    }

    return {
        total: Math.round(currentValue),
        breakdown
    }
}

// Compatibility wrapper for existing code
export function calculateExchangeValue(
    price: number | string,
    createdAt: string,
    conditionAnswers?: ConditionAnswer
): number {
    if (!conditionAnswers) return Math.round(parsePrice(price) * 0.75) // Default depreciation
    return calculateExchangeValueBreakdown(price, createdAt, conditionAnswers).total
}

export function getMaxExchangeValue(price: number | string, createdAt: string): number {
    return calculateExchangeValue(price, createdAt)
}
