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
import { Loader2, Crosshair, MapPin } from 'lucide-react';
import { toast } from 'sonner';

// --- Types ---
export interface LocationData {
    lat: number;
    lng: number;
    address: string;
    addressComponents?: {
        province: string;
        district: string;
        municipality: string;
        ward: number;
        tole: string;
        city: string;
    };
}

interface GoogleMapAddressProps {
    onLocationSelect: (location: LocationData) => void;
    initialPosition?: Partial<LocationData>;
}

const defaultCenter = { lat: 27.7172, lng: 85.3240 }; // Kathmandu

export default function GoogleMapAddress({ onLocationSelect, initialPosition }: GoogleMapAddressProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    const mapId = process.env.NEXT_PUBLIC_MAP_ID || 'YOUR_MAP_ID_HERE'; // MUST PROVIDE MAP ID

    const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>({
        lat: initialPosition?.lat || defaultCenter.lat,
        lng: initialPosition?.lng || defaultCenter.lng,
    });

    // Sync marker when editing an existing address (initialPosition changes)
    useEffect(() => {
        if (initialPosition?.lat && initialPosition?.lng) {
            setMarkerPosition({ lat: initialPosition.lat, lng: initialPosition.lng });
        }
    }, [initialPosition?.lat, initialPosition?.lng]);

    return (
        /* Ensure the container has a fixed height for mobile rendering */
        <div className="w-full h-52 sm:h-64 rounded-xl overflow-hidden border border-gray-200 relative shadow-sm">
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

    // Initial Sync
    useEffect(() => {
        if (hasInitialPosition && map) {
            map.panTo(markerPosition);
            map.setZoom(17);
        }
    }, [hasInitialPosition, map]);

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

            const result = results[0];
            let province = '', district = '', municipality = '', city = '', tole = '';
            let ward = 0;

            result.address_components.forEach((comp) => {
                const t = comp.types;
                if (t.includes('administrative_area_level_1')) province = comp.long_name;
                if (t.includes('administrative_area_level_2')) district = comp.long_name;
                if (t.includes('locality')) city = comp.long_name;
                if (t.includes('administrative_area_level_3')) municipality = comp.long_name;

                // Ward logic for Nepal
                if (t.includes('sublocality_level_1')) {
                    const wardMatch = comp.long_name.match(/\d+/);
                    if (wardMatch) ward = parseInt(wardMatch[0], 10);
                }
                // Tole / Landmark logic
                if ((t.includes('neighborhood') || t.includes('sublocality_level_2') || t.includes('route') || t.includes('premise') || t.includes('subpremise') || t.includes('point_of_interest')) && !tole) {
                    tole = comp.long_name;
                }
            });

            const finalAddress = result.formatted_address;
            setConfirmedAddress(finalAddress);

            onLocationSelect({
                lat, lng,
                address: finalAddress,
                addressComponents: { province, district, municipality: municipality || city, ward, tole, city },
            });
        });
    }, [geocodingLib, onLocationSelect, setMarkerPosition]);

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation not supported');
            return;
        }
        setIsLocating(true);

        // Critical for Mobile: HighAccuracy and Timeout
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const newPos = { lat: coords.latitude, lng: coords.longitude };
                map?.panTo(newPos);
                map?.setZoom(17);
                handleLocationUpdate(newPos.lat, newPos.lng);
                setIsLocating(false);
            },
            (err) => {
                toast.error('Permission denied or GPS signal weak.');
                setIsLocating(false);
                console.error(err);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <>
            {/* Locate Button */}
            <div className="absolute top-3 right-3 z-[1]">
                <button
                    type="button"
                    onClick={handleLocateMe}
                    disabled={isLocating || isGeocoding}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-700 text-xs font-bold rounded-xl shadow-md border border-gray-200 hover:bg-gray-50 transition-all"
                >
                    {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
                    {isLocating ? 'Locating...' : 'Use My Location'}
                </button>
            </div>

            {/* Status Overlay */}
            {isGeocoding && (
                <div className="absolute inset-0 z-[2] bg-black/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                    <div className="bg-white px-4 py-2 rounded-lg shadow-lg text-xs font-bold flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" /> Fetching Address...
                    </div>
                </div>
            )}

            {/* Address Bar */}
            {confirmedAddress && (
                <div className="absolute bottom-4 left-4 right-4 z-[1]">
                    <div className="bg-white/95 p-3 rounded-lg shadow-xl border border-gray-100 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] md:text-xs text-gray-600 line-clamp-2">{confirmedAddress}</p>
                    </div>
                </div>
            )}

            <Map
                mapId={mapId} // REQUIRED for Advanced Markers
                defaultCenter={defaultCenter}
                defaultZoom={15}
                gestureHandling="greedy"
                disableDefaultUI
                onClick={(e) => {
                    if (e.detail.latLng) {
                        handleLocationUpdate(e.detail.latLng.lat, e.detail.latLng.lng);
                    }
                }}
            >
                {/* Advanced Marker Component */}
                <AdvancedMarker
                    position={markerPosition}
                    draggable={true}
                    onDragEnd={(e) => {
                        if (e.latLng) {
                            handleLocationUpdate(e.latLng.lat(), e.latLng.lng());
                        }
                    }}
                >
                    <Pin background={'#fb2c36'} glyphColor={'#fff'} borderColor={'#000'} />
                </AdvancedMarker>
            </Map>
        </>
    );
}