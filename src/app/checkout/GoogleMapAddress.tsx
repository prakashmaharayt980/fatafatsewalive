'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { Loader2, MapPin, Navigation, Crosshair, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const libraries: ("places")[] = ["places"];

interface GoogleMapAddressProps {
    onLocationSelect: (location: { lat: number; lng: number, address?: string }) => void;
    initialPosition?: { lat: number; lng: number };
    isOptional?: boolean;
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '12px'
};

const defaultCenter = {
    lat: 27.7172, // Kathmandu
    lng: 85.3240
};

// --- Mock Map Component for Testing without API Key ---
const MockMap = ({
    center,
    onLocationSelect
}: {
    center: { lat: number; lng: number },
    onLocationSelect: (loc: { lat: number; lng: number, address?: string }) => void
}) => {
    const [marker, setMarker] = useState(center);
    const [isDragging, setIsDragging] = useState(false);

    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Simple mock logic: changing position slightly based on click relative to center
        // In a real mock, this would be pixel-to-coords, but here we just randomize slightly for effect
        // or just set it to a fixed offset for "visual feedback"
        // Better: Use styling to visually show the click. 
        // For testing flow, we mainly need to trigger the callback.

        // Let's just pretend the user clicked exactly where the marker is for simplicity in this visual mock
        // or update it to a random nearby spot to simulate "selecting"
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create a fake coordinate shift based on click position (0-100% of width)
        // This is purely to make the numbers change so the user sees "updates"
        const latOffset = (y / rect.height - 0.5) * 0.02;
        const lngOffset = (x / rect.width - 0.5) * 0.02;

        const newPos = {
            lat: center.lat - latOffset,
            lng: center.lng + lngOffset
        };

        setMarker(newPos);
        onLocationSelect({ ...newPos, address: "Mock Address, Kathmandu (Testing Mode)" });
        toast.success("Location updated (Mock Mode)");
    };

    return (
        <div
            className="w-full h-full bg-blue-50 relative overflow-hidden cursor-crosshair group"
            onClick={handleMapClick}
        >
            {/* Grid Pattern to look like a map */}
            <div className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            {/* Fake Streets */}
            <div className="absolute top-1/2 left-0 right-0 h-4 bg-white/50 -rotate-6 transform origin-center" />
            <div className="absolute top-0 bottom-0 left-1/3 w-4 bg-white/50 rotate-12 transform origin-center" />

            {/* Watermark/Warning */}
            <div className="absolute bottom-2 left-2 bg-yellow-100 text-yellow-800 text-[10px] px-2 py-1 rounded border border-yellow-200 font-medium z-0">
                Test Mode: API Key Missing
            </div>

            {/* Marker */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full transition-all duration-300 z-10">
                <MapPin className="w-8 h-8 text-red-500 drop-shadow-md animate-bounce" fill="currentColor" />
            </div>

            <div className="absolute top-4 left-4 right-16 bg-white/90 p-2 rounded-lg text-xs text-gray-500 text-center pointer-events-none border border-gray-200">
                Mock Map Active. Click anywhere to simulate selection.
            </div>
        </div>
    );
};

export default function GoogleMapAddress({ onLocationSelect, initialPosition, isOptional = false }: GoogleMapAddressProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: apiKey || '',
        libraries,
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [markerPos, setMarkerPos] = useState(initialPosition || defaultCenter);
    const [searchBox, setSearchBox] = useState<google.maps.places.SearchBox | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    // Sync initial position if it changes
    useEffect(() => {
        if (initialPosition) {
            setMarkerPos(initialPosition);
            map?.panTo(initialPosition);
        }
    }, [initialPosition, map]);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            const newPos = { lat, lng };
            setMarkerPos(newPos);
            onLocationSelect(newPos);
            // Reverse geocode could happen here if needed, but we rely on search or user input mostly
        }
    }, [onLocationSelect]);

    const onSearchLoad = (ref: google.maps.places.SearchBox) => {
        setSearchBox(ref);
    };

    const onPlacesChanged = () => {
        const places = searchBox?.getPlaces();
        if (places && places.length > 0) {
            const place = places[0];
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const newPos = { lat, lng };

                setMarkerPos(newPos);
                map?.panTo(newPos);
                map?.setZoom(16); // Zoom in on result
                onLocationSelect({ lat, lng, address: place.formatted_address });
            }
        }
    };

    const handleLocateMe = () => {
        setIsLoadingLocation(true);
        setPermissionError(null);

        if (!navigator.geolocation) {
            setPermissionError("Geolocation is not supported by your browser");
            setIsLoadingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newPos = { lat: latitude, lng: longitude };

                setMarkerPos(newPos);
                map?.panTo(newPos);
                map?.setZoom(16);
                onLocationSelect({ lat: latitude, lng: longitude });
                setIsLoadingLocation(false);
                toast.success("Location found!");
            },
            (error) => {
                console.error("Geolocation error:", error);
                setIsLoadingLocation(false);
                // Handle errors...
                setPermissionError("Could not retrieve location.");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // --- Fallback for Missing API Key (Mock Mode) ---
    if (!apiKey) {
        return (
            <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                <MockMap
                    center={markerPos}
                    onLocationSelect={(loc) => {
                        setMarkerPos(loc);
                        onLocationSelect(loc);
                    }}
                />
                {/* Locate Me Button (Still Works with Browser API in Mock Mode) */}
                <div className="absolute top-4 right-4 z-10">
                    <Button
                        size="icon"
                        onClick={handleLocateMe}
                        disabled={isLoadingLocation}
                        className="rounded-xl shadow-lg bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600 border border-gray-200 transition-all"
                    >
                        {isLoadingLocation ? (
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                        ) : (
                            <Crosshair className="w-5 h-5" />
                        )}
                    </Button>
                </div>
            </div>
        );
    }

    if (loadError) return (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Error loading Google Maps. Invalid API Key.</span>
        </div>
    );

    if (!isLoaded) return (
        <div className="h-[350px] w-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-100">
            <Loader2 className="animate-spin text-blue-500 w-8 h-8 mb-2" />
            <span className="text-gray-400 text-sm font-medium">Loading Map...</span>
        </div>
    );

    return (
        <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={markerPos}
                zoom={14}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={onMapClick}
                options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                }}
            >
                <Marker
                    position={markerPos}
                    draggable={true}
                    animation={google.maps.Animation.DROP}
                    onDragEnd={(e) => {
                        if (e.latLng) {
                            const lat = e.latLng.lat();
                            const lng = e.latLng.lng();
                            setMarkerPos({ lat, lng });
                            onLocationSelect({ lat, lng });
                        }
                    }}
                />
            </GoogleMap>

            {/* Search Box Overlay */}
            <div className="absolute top-4 left-4 right-16 z-10 w-full max-w-sm sm:max-w-md">
                <StandaloneSearchBox
                    onLoad={onSearchLoad}
                    onPlacesChanged={onPlacesChanged}
                >
                    <div className="relative shadow-lg rounded-xl">
                        <div className="absolute left-3 top-3 text-gray-400">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search your location..."
                            className="w-full p-3 pl-10 pr-4 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium transition-all"
                        />
                    </div>
                </StandaloneSearchBox>
            </div>

            {/* Locate Me Button */}
            <div className="absolute top-4 right-4 z-10">
                <Button
                    size="icon"
                    onClick={handleLocateMe}
                    disabled={isLoadingLocation}
                    className="rounded-xl shadow-lg bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600 border border-gray-200 transition-all"
                    title="Use my current location"
                >
                    {isLoadingLocation ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    ) : (
                        <Crosshair className="w-5 h-5" />
                    )}
                </Button>
            </div>

            {/* Permission Error Toast/Badge */}
            {permissionError && (
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-4 py-2 rounded-full shadow-lg z-20 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
                    <AlertCircle className="w-3 h-3" />
                    {permissionError}
                </div>
            )}

            {/* Helper Text */}
            <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm shadow-md border border-gray-200 px-4 py-1.5 rounded-full flex items-center gap-2">
                    <Navigation className="w-3 h-3 text-blue-500" />
                    <span className="text-xs font-semibold text-gray-700">Drag marker to pinpoint exact location</span>
                </div>
            </div>
        </div>
    );
}
