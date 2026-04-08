'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    APIProvider,
    Map,
    useMap,
    useMapsLibrary,
    AdvancedMarker,
    Pin
} from '@vis.gl/react-google-maps';
import { Loader2, Crosshair, MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';

export interface LocationData {
    lat: number;
    lng: number;
    address: string;
    addressComponents?: {
        province: string;
        district: string;
        municipality: string;
        city: string;
    };
}

interface GoogleMapAddressProps {
    onLocationSelect: (location: LocationData) => void;
    initialPosition?: Partial<LocationData>;
}

const defaultCenter = { lat: 27.7172, lng: 85.3240 };

export default function GoogleMapAddress({ onLocationSelect, initialPosition }: GoogleMapAddressProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    const mapId = process.env.NEXT_PUBLIC_MAP_ID || 'YOUR_MAP_ID_HERE';

    const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>({
        lat: initialPosition?.lat || defaultCenter.lat,
        lng: initialPosition?.lng || defaultCenter.lng,
    });

    useEffect(() => {
        if (initialPosition?.lat && initialPosition?.lng) {
            setMarkerPosition({ lat: initialPosition.lat, lng: initialPosition.lng });
        } else if (!initialPosition) {
            // Reset to default center if initialPosition is explicitly cleared (e.g., clicking 'Add New')
            setMarkerPosition(defaultCenter);
        }
    }, [initialPosition?.lat, initialPosition?.lng, initialPosition]);

    return (
        <div className="w-full h-full min-h-50 relative">
            <APIProvider apiKey={apiKey}>
                <MapInternal
                    mapId={mapId}
                    markerPosition={markerPosition}
                    setMarkerPosition={setMarkerPosition}
                    onLocationSelect={onLocationSelect}
                    hasInitialPosition={!!(initialPosition?.lat && initialPosition?.lng)}
                />
            </APIProvider>
        </div>
    );
}

function MapInternal({
    mapId,
    markerPosition,
    setMarkerPosition,
    onLocationSelect,
    hasInitialPosition,
}: {
    mapId: string;
    markerPosition: { lat: number; lng: number };
    setMarkerPosition: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>;
    onLocationSelect: (location: LocationData) => void;
    hasInitialPosition: boolean;
}) {
    const map = useMap();
    const geocodingLib = useMapsLibrary('geocoding');

    const [isLocating, setIsLocating] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [confirmedAddress, setConfirmedAddress] = useState<string | null>(null);
    const hasAutoLocated = useRef(false);

    // Pan to initial position when map/edit mode loads
    useEffect(() => {
        if (hasInitialPosition && map) {
            map.panTo(markerPosition);
            map.setZoom(17);
        }
    }, [hasInitialPosition, map, markerPosition]);

    const handleLocationUpdate = useCallback((lat: number, lng: number) => {
        setMarkerPosition({ lat, lng });
        setIsGeocoding(true);
        setConfirmedAddress(null);

        if (!geocodingLib) {
            setIsGeocoding(false);
            return;
        }

        const geocoder = new geocodingLib.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            setIsGeocoding(false);

            if (status !== 'OK' || !results?.[0]) {
                toast.error('Could not detect address for this location');
                return;
            }

            // Prefer a street-level or premise result for more exact address
            const result =
                results.find(r =>
                    r.types.some(t => ['street_address', 'premise', 'sublocality_level_1'].includes(t))
                ) ?? results[0];

            let province = '', district = '', municipality = '', city = '', tole = '';

            result.address_components.forEach((comp) => {
                const t = comp.types;
                if (t.includes('administrative_area_level_1')) province = comp.long_name;
                if (t.includes('administrative_area_level_2')) district = comp.long_name;
                if (t.includes('administrative_area_level_3')) municipality = comp.long_name;
                if (t.includes('locality')) city = comp.long_name;
                if (t.includes('sublocality_level_1') || t.includes('neighborhood')) tole = comp.long_name;
            });

            // Fallback: use tole as city if locality is missing (rural Nepal)
            if (!city) city = tole;

            const finalAddress = result.formatted_address;
            setConfirmedAddress(finalAddress);
            onLocationSelect({
                lat, lng,
                address: finalAddress,
                addressComponents: { province, district, municipality: municipality || city, city: tole || city },
            });
        });
    }, [geocodingLib, onLocationSelect, setMarkerPosition]);

    // Auto-locate when map is ready and permission already granted
    useEffect(() => {
        if (hasAutoLocated.current || hasInitialPosition || !map || !geocodingLib) return;
        if (!navigator.geolocation) return;

        const tryAutoLocate = () => {
            hasAutoLocated.current = true;
            setIsLocating(true);
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                    const pos = { lat: coords.latitude, lng: coords.longitude };
                    map.panTo(pos);
                    map.setZoom(17);
                    handleLocationUpdate(pos.lat, pos.lng);
                    setIsLocating(false);
                },
                () => setIsLocating(false),
                // Use high accuracy for exact location
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        };

        if (navigator.permissions) {
            navigator.permissions.query({ name: 'geolocation' as PermissionName })
                .then(result => { if (result.state === 'granted') tryAutoLocate(); })
                .catch(() => { });
        }
    }, [map, geocodingLib, hasInitialPosition, handleLocationUpdate]);

    // Manual locate — always gets fresh high-accuracy position
    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation not supported on this device');
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const pos = { lat: coords.latitude, lng: coords.longitude };
                map?.panTo(pos);
                map?.setZoom(17);
                handleLocationUpdate(pos.lat, pos.lng);
                setIsLocating(false);
            },
            (err) => {
                setIsLocating(false);
                if (err.code === err.PERMISSION_DENIED) {
                    toast.error('Location permission denied. Please enable it in browser settings.');
                } else if (err.code === err.TIMEOUT) {
                    toast.error('GPS timed out. Try tapping a spot on the map instead.');
                } else {
                    toast.error('Could not get location. Tap the map to set your pin.');
                }
            },
            { enableHighAccuracy: true, timeout: 1000, maximumAge: 0 }
        );
    };

    return (
        <>
            {/* Locate Me button — large tap target for mobile */}
            <div className="absolute top-3 right-3 z-1">
                <button
                    type="button"
                    onClick={handleLocateMe}
                    disabled={isLocating || isGeocoding}
                    className="flex items-center gap-1.5 px-3 py-2.5 bg-white text-gray-800 text-xs font-bold rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-60 touch-manipulation select-none"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                    {isLocating
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin text-(--colour-fsP2)" />
                        : <Navigation className="w-3.5 h-3.5 text-(--colour-fsP2)" />
                    }
                    <span>{isLocating ? 'Locating...' : 'My Location'}</span>
                </button>
            </div>

            {/* Geocoding overlay */}
            {isGeocoding && (
                <div className="absolute inset-0 z-2 bg-black/5 flex items-center justify-center pointer-events-none">
                    <div className="bg-white px-4 py-2.5 rounded-xl shadow-lg border border-gray-200 text-xs font-bold flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-(--colour-fsP2)" />
                        Fetching address...
                    </div>
                </div>
            )}

            {/* Address confirmation bar */}
            {confirmedAddress && !isGeocoding && (
                <div className="absolute bottom-3 left-3 right-3 z-1">
                    <div className="bg-white px-3 py-2 rounded-xl shadow-md border border-gray-200 flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-(--colour-fsP2) shrink-0 mt-0.5" />
                        <p className="text-[11px] text-gray-800 font-semibold leading-relaxed">{confirmedAddress}</p>
                    </div>
                </div>
            )}

            <Map
                mapId={mapId}
                defaultCenter={defaultCenter}
                defaultZoom={15}
                gestureHandling="greedy"
                disableDefaultUI
                className="w-full h-full"
                onClick={(e) => {
                    if (e.detail.latLng) {
                        handleLocationUpdate(e.detail.latLng.lat, e.detail.latLng.lng);
                    }
                }}
            >
                <AdvancedMarker
                    position={markerPosition}
                    draggable
                    onDragEnd={(e) => {
                        if (e.latLng) handleLocationUpdate(e.latLng.lat(), e.latLng.lng());
                    }}
                >
                    <Pin background="#eb5a2c" glyphColor="#fff" borderColor="#000" />
                </AdvancedMarker>
            </Map>
        </>
    );
}
