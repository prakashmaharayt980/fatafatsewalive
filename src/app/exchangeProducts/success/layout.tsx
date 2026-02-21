import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Exchange Request Confirmed | Fatafat Sewa',
    description: 'Your mobile exchange request has been submitted successfully. Track the status of your exchange pickup and device evaluation.',
    robots: { index: false, follow: false },
}

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
    return children
}
