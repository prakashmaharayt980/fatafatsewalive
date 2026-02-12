import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Account - Profile & Orders | FataFatSewa',
    description: 'Manage your profile, view order history, track shipments, and update your account settings. Access your personal dashboard for all your shopping needs.',
    keywords: 'user profile, my account, order history, track orders, account settings, shipping address, order tracking',
    openGraph: {
        title: 'My Account - Profile & Orders',
        description: 'Manage your profile, view order history, and track your orders.',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
