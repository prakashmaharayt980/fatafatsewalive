import { Metadata } from 'next';
import EligibilityClient from './EligibilityClient';

export const metadata: Metadata = {
    title: 'Check EMI Eligibility - Fatafat Sewa',
    description: 'Check if you are eligible for EMI plans on Fatafat Sewa. Calculate your approval limit based on salary and employment details.',
    openGraph: {
        title: 'Check EMI Eligibility - Fatafat Sewa',
        description: 'Check if you are eligible for EMI plans on Fatafat Sewa. Calculate your approval limit based on salary and employment details.',
        type: 'website',
    },
};

export default function EligibilityPage() {
    return <EligibilityClient />;
}
