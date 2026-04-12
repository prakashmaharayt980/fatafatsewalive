"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
    { q: 'What is the minimum salary required for EMI in Nepal?', a: 'For salaried employees, the minimum required gross monthly income is NPR 15,000. Business owners and guarantors need at least NPR 25,000 per month in verifiable income.' },
    { q: 'Can students apply for EMI at Fatafat Sewa?', a: 'Yes. Students aged 18–30 who are enrolled at a recognised college or university can apply for EMI, provided a parent or legal guardian with a stable income co-signs the application as a guarantor.' },
    { q: 'How long does EMI approval take?', a: 'Our partner banks typically verify all submitted documents and issue an approval decision within 24 hours on working days. Once approved, you can purchase your product immediately.' },
    { q: 'Does checking my EMI eligibility affect my credit score?', a: 'No. Using our eligibility calculator is a soft check only and does not affect your credit score in any way.' },
    { q: 'Can a business owner apply for EMI without a salary slip?', a: 'Yes. Business owners can substitute salary slips with 6 months of business bank statements, a PAN/VAT certificate, and a business registration document. A tax clearance or audit report is optional but highly recommended.' },
    { q: 'Is there any processing fee or hidden charge for EMI?', a: 'Fatafat Sewa does not charge any processing fees. The EMI offered is 0% No-Cost — you pay only for the product, split into equal monthly instalments.' },
    { q: 'What documents does a guarantor need to provide?', a: 'A guarantor must provide their Citizenship Certificate, 3 months of salary slips or income proof, 3 months of bank statements, a passport photo, and a signed Relationship Declaration Form (available at our office).' },
    { q: 'How much can I buy on EMI based on my salary?', a: 'Your EMI limit is 50% of gross income for salaried applicants and 40% for business/freelancer applicants. For example: NPR 40,000 salary → NPR 20,000/month EMI → up to NPR 2,40,000 in products on a 12-month plan.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button onClick={() => setOpen(p => !p)} className="w-full flex items-start justify-between gap-4 py-5 text-left group" aria-expanded={open}>
                <span className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-gray-900 leading-snug">{q}</span>
                <span className="shrink-0 mt-0.5">
                    {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </span>
            </button>
            {open && (
                <p className="text-sm text-gray-500 leading-relaxed pb-5 animate-in fade-in slide-in-from-top-2 duration-200">{a}</p>
            )}
        </div>
    );
}

export default function FaqAccordion() {
    return (
        <div>
            {FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
        </div>
    );
}
