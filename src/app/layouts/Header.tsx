import HeaderComponent from './headerbody';

/**
 * Header wrapper component for importing in layouts.
 * The actual HeaderComponent is a client component with interactive features.
 * This wrapper provides a clean import point for the layout.
 */
export default function Header() {
    return <HeaderComponent />;
}
