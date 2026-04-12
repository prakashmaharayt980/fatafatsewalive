export interface ProductListItem {
    id: number | string
    name: string
    slug: string
    image: { full: string; thumb: string; preview: string } | string
    price: number | string
    created_at: string
    average_rating?: number
    brand?: { id: number; name: string; slug: string }
}

export interface FullProduct {
    id: number
    name: string
    slug: string
    price: number
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

const EXCHANGE_SLUGS = ['mobile', 'laptop']

export const IS_EXCHANGE_CATEGORY = (cat: any) => {
    const title = cat?.title?.toLowerCase() ?? ''
    const slug = cat?.slug?.toLowerCase() ?? ''
    return EXCHANGE_SLUGS.some(s => title.includes(s) || slug.includes(s))
}

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

export const EVALUATION_VALUES = {
    switch_off_multiplier: 0.2,
    not_registered_multiplier: 0.7,
    original_charger: 1200,
    purchase_bill: 800,
    matching_box: 500,
    under_warranty_multiplier: 1.1,
}

const SPEC_MAPPING: Record<string, { label: string; icon: string; multiplier: number }> = {
    'display': { label: 'Display / Screen', icon: 'Monitor', multiplier: 0.7 },
    'processor': { label: 'Processor', icon: 'Settings2', multiplier: 0.8 },
    'ram': { label: 'Memory (RAM)', icon: 'HardDrive', multiplier: 0.9 },
    'battery': { label: 'Battery', icon: 'Battery', multiplier: 0.85 },
    'storage': { label: 'Storage', icon: 'HardDrive', multiplier: 0.88 },
    'rom': { label: 'Storage', icon: 'HardDrive', multiplier: 0.88 },
    'camera': { label: 'Camera', icon: 'Camera', multiplier: 0.92 },
}

export const GET_CONDITION_QUESTIONS = (
    categorySlug: string,
    brandName: string = '',
    specifications: Record<string, string> = {}
) => {
    const isLaptop = categorySlug?.toLowerCase().includes('laptop')
    const deviceType = isLaptop ? 'laptop' : 'phone'

    const problemOptions: { key: string; label: string; icon: string; multiplier: number }[] = [
        { key: 'screen_scratches', label: 'Scratches on screen', icon: 'XCircle', multiplier: 0.95 },
        { key: 'screen_broken', label: 'Screen Broken', icon: 'AlertTriangle', multiplier: 0.6 },
        { key: 'connectivity', label: 'Problems with WiFi/GPS/Bluetooth', icon: 'Wifi', multiplier: 0.8 },
        { key: 'speakers', label: 'Problem with speakers', icon: 'Volume2', multiplier: 0.95 },
    ]

    Object.entries(specifications).forEach(([rawKey, value]) => {
        const key = rawKey.toLowerCase()
        const mapping = Object.entries(SPEC_MAPPING).find(([mKey]) => key.includes(mKey))?.[1]
        if (mapping && !problemOptions.find(o => o.key === `spec_${key}`)) {
            problemOptions.push({
                key: `spec_${key}`,
                label: `Faulty ${mapping.label} (${value})`,
                icon: mapping.icon,
                multiplier: mapping.multiplier,
            })
        }
    })

    return [
        {
            key: 'condition_grade',
            label: 'Overall Device Condition',
            type: 'grade',
            options: [
                { key: 'new', label: 'Brand New', description: 'Unopened or unused', multiplier: 1.0 },
                { key: 'like_new', label: 'Like New', description: 'Minimal use, no marks', multiplier: 0.95 },
                { key: 'good', label: 'Good', description: 'Normal wear, fully working', multiplier: 0.85 },
                { key: 'some_damage', label: 'Some Damage', description: 'Minor scratches or dents', multiplier: 0.7 },
                { key: 'old', label: 'Old / Heavy Use', description: 'Visible wear and damage', multiplier: 0.5 },
            ],
        },
        {
            key: 'switch_on',
            label: 'Does your device Switch On?',
            type: 'boolean',
            options: [{ label: 'YES', value: 1.0 }, { label: 'NO', value: EVALUATION_VALUES.switch_off_multiplier }],
        },
        {
            key: 'mdms_registered',
            label: 'Is your device MDMS Registered?',
            type: 'boolean',
            options: [{ label: 'YES', value: 1.0 }, { label: 'NO', value: EVALUATION_VALUES.not_registered_multiplier }],
        },
        {
            key: 'problems',
            label: 'Technical Inspection: Select any faulty components',
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
            label: 'Confirm accessories / documents you can return',
            type: 'multiple',
            options: [
                { key: 'charger', label: 'Original Charger/Accessories', icon: 'Cable', credit: EVALUATION_VALUES.original_charger },
                { key: 'bill', label: 'Purchase Bill', icon: 'Receipt', credit: EVALUATION_VALUES.purchase_bill },
                { key: 'box', label: 'IMEI Matching Box', icon: 'Package', credit: EVALUATION_VALUES.matching_box },
            ],
        },
    ]
}

export function calculateExchangeValueBreakdown(
    price: number | string,
    createdAt: string,
    answers?: ConditionAnswer
) {
    const basePrice = parsePrice(price)
    if (!basePrice) return { total: 0, breakdown: [] }

    const createdDate = new Date(createdAt)
    const now = new Date()
    let ageMonths = (now.getFullYear() - createdDate.getFullYear()) * 12 + (now.getMonth() - createdDate.getMonth())
    if (isNaN(ageMonths)) ageMonths = 24

    let ageMultiplier = 0.3
    if (ageMonths <= 6) ageMultiplier = 0.9
    else if (ageMonths <= 12) ageMultiplier = 0.75
    else if (ageMonths <= 24) ageMultiplier = 0.6
    else if (ageMonths <= 36) ageMultiplier = 0.45

    const depreciatedValue = Math.round(basePrice * ageMultiplier)

    // Calculate the 'Best-Case' Max Value (Depreciated + All Accessory Credits + Warranty Bonus)
    const maxAccessoryCredit = EVALUATION_VALUES.original_charger + EVALUATION_VALUES.purchase_bill + EVALUATION_VALUES.matching_box
    
    // Start with the absolute maximum (Highest current value)
    let current = Math.round((depreciatedValue + maxAccessoryCredit) * EVALUATION_VALUES.under_warranty_multiplier)
    
    const breakdown: { label: string; value: number }[] = [
        { label: 'Maximum Exchange Value (Perfect Condition)', value: current }
    ]

    // Use provided answers or default to 'Perfect' for initial display
    const effectiveAnswers = answers ?? {
        switch_on: 1.0,
        mdms_registered: 1.0,
        under_warranty: EVALUATION_VALUES.under_warranty_multiplier,
        problems: [],
        accessories: [
            { key: 'charger', credit: EVALUATION_VALUES.original_charger },
            { key: 'bill', credit: EVALUATION_VALUES.purchase_bill },
            { key: 'box', credit: EVALUATION_VALUES.matching_box },
        ]
    } as any

    // 1. Power Status Deduction
    if (effectiveAnswers.switch_on === EVALUATION_VALUES.switch_off_multiplier) {
        const cut = Math.round(current * (1 - EVALUATION_VALUES.switch_off_multiplier))
        current -= cut
        breakdown.push({ label: 'Device Power Off Deduction', value: -cut })
    }

    // 2. Condition Grade Deduction
    if (effectiveAnswers.condition_grade?.multiplier !== undefined && effectiveAnswers.condition_grade.multiplier < 1.0) {
        const cut = Math.round(current * (1 - effectiveAnswers.condition_grade.multiplier))
        current -= cut
        breakdown.push({ label: `Condition Grade (${effectiveAnswers.condition_grade.label})`, value: -cut })
    }

    // 3. MDMS Registration Deduction
    if (effectiveAnswers.mdms_registered === EVALUATION_VALUES.not_registered_multiplier) {
        const cut = Math.round(current * (1 - EVALUATION_VALUES.not_registered_multiplier))
        current -= cut
        breakdown.push({ label: 'MDMS Not Registered Deduction', value: -cut })
    }

    // 4. Warranty Deduction (If NO is selected, multiplier is 1.0, so no bonus/deduction from current)
    // But since our MAX assumes 'Under Warranty' bonus (1.1), we deduct if they DON'T have it.
    if (effectiveAnswers.under_warranty !== EVALUATION_VALUES.under_warranty_multiplier) {
        // current is already boosted by 1.1 potentially? 
        // Actually, let's keep it simpler: deduct if NOT YES.
        const originalBase = current / EVALUATION_VALUES.under_warranty_multiplier
        const cut = Math.round(current - originalBase)
        current -= cut
        breakdown.push({ label: 'Out of Warranty Deduction', value: -cut })
    }

    // 6. Missing Accessories Deductions
    // Since our MAX assumes all accessories are present, we subtract for missing ones
    if (effectiveAnswers.accessories) {
        const has = (key: string) => effectiveAnswers.accessories.some((a: any) => a.key === key)
        if (!has('charger')) {
            current -= EVALUATION_VALUES.original_charger
            breakdown.push({ label: 'Missing Charger Deduction', value: -EVALUATION_VALUES.original_charger })
        }
        if (!has('bill')) {
            current -= EVALUATION_VALUES.purchase_bill
            breakdown.push({ label: 'Missing Bill Deduction', value: -EVALUATION_VALUES.purchase_bill })
        }
        if (!has('box')) {
            current -= EVALUATION_VALUES.matching_box
            breakdown.push({ label: 'Missing Box Deduction', value: -EVALUATION_VALUES.matching_box })
        }
    }

    // 5. Technical defects Deductions
    if (effectiveAnswers.problems && effectiveAnswers.problems.length > 0) {
        effectiveAnswers.problems.forEach((p: any) => {
            const cut = Math.round(current * (1 - (p.multiplier || 0.9)))
            current -= cut
            breakdown.push({ label: `Fault: ${p.label}`, value: -cut })
        })
    }

    return {
        total: Math.max(0, Math.round(current)),
        breakdown
    }
}

export function getMaxExchangeValue(price: number | string, createdAt: string) {
    return calculateExchangeValueBreakdown(price, createdAt).total
}
