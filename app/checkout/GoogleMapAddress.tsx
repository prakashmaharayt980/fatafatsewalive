'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    APIProvider,
    Map,
    Marker,
    useMap,
    useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { Loader2, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// --- Types ---
// Matches the structure expected by AddressStep.tsx
export interface LocationData {
    lat: number;
    lng: number;
    address: string; // Full address string
    addressComponents?: {
        province: string;
        district: string;
        municipality: string;
        ward: number;
        tole: string;
        city: string; // Keep for fallback
    };
}

interface GoogleMapAddressProps {
    onLocationSelect: (location: LocationData) => void;
    initialPosition?: Partial<LocationData>;
}

const defaultCenter = {
    lat: 27.7172, // Kathmandu
    lng: 85.3240
};

// --- Main Component ---
export default function GoogleMapAddress({ onLocationSelect, initialPosition }: GoogleMapAddressProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    // Local state for the marker position to ensure UI updates immediately
    const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number }>({
        lat: initialPosition?.lat || defaultCenter.lat,
        lng: initialPosition?.lng || defaultCenter.lng
    });

    useEffect(() => {
        if (initialPosition?.lat && initialPosition?.lng) {
            setMarkerPosition({
                lat: initialPosition.lat,
                lng: initialPosition.lng
            });
        }
    }, [initialPosition]);

    return (
        <div className="w-full h-full rounded-xl overflow-hidden border border-gray-200 relative shadow-sm">
            <APIProvider apiKey={apiKey} libraries={['places', 'geocoding']}>
                <MapInternal
                    markerPosition={markerPosition}
                    setMarkerPosition={setMarkerPosition}
                    onLocationSelect={onLocationSelect}
                />
            </APIProvider>
        </div>
    );
}

// --- Map Internal Logic ---
function MapInternal({ markerPosition, setMarkerPosition, onLocationSelect }: {
    markerPosition: { lat: number; lng: number },
    setMarkerPosition: React.Dispatch<React.SetStateAction<{ lat: number; lng: number }>>,
    onLocationSelect: (location: LocationData) => void
}) {
    const map = useMap();
    const placesLib = useMapsLibrary('places');
    const geocodingLib = useMapsLibrary('geocoding');

    const [isLocating, setIsLocating] = useState(false);
    const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);

    // Init Places Service
    useEffect(() => {
        if (map && placesLib) {
            placesServiceRef.current = new placesLib.PlacesService(map);
        }
    }, [map, placesLib]);

    // --- CORE LOGIC: EXTRACT DATA FROM GOOGLE ---
    const handleLocationUpdate = useCallback((lat: number, lng: number) => {
        // Update local marker immediately
        setMarkerPosition({ lat, lng });

        if (!geocodingLib || !placesServiceRef.current) return;

        const geocoder = new geocodingLib.Geocoder();

        // 1. Geocode: Get the Administrative Areas (City, District, Province)
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const result = results[0];

                // Extraction Variables
                let province = '';
                let district = '';
                let municipality = '';
                let ward = 0;
                let tole = '';
                let city = ''; // Fallback

                // Loop through address components to find specific types
                result.address_components.forEach((comp) => {
                    const t = comp.types;
                    // Province
                    if (t.includes('administrative_area_level_1')) province = comp.long_name;
                    // District
                    if (t.includes('administrative_area_level_2')) district = comp.long_name;
                    // Municipality / City
                    if (t.includes('administrative_area_level_3') || t.includes('locality')) {
                        // Prefer level 3 for municipality in Nepal if available, else locality
                        if (!municipality || t.includes('administrative_area_level_3')) {
                            municipality = comp.long_name;
                        }
                        if (t.includes('locality')) city = comp.long_name;
                    }

                    // Ward
                    if (t.includes('active_political') || t.includes('political') || t.includes('sublocality_level_1')) {
                        // Often wards are just numbers in 'political' or 'sublocality_level_1'
                        const wardMatch = comp.long_name.match(/\d+/);
                        if (wardMatch) {
                            ward = parseInt(wardMatch[0], 10);
                        }
                    }

                    // Tole / Area
                    if (t.includes('neighborhood') || t.includes('route') || t.includes('sublocality')) {
                        if (!tole) tole = comp.long_name;
                    }
                });

                // Fallback for Municipality if empty
                if (!municipality) municipality = city;

                // 2. Places API (New): Attempt to get a named place (POI)
                // Using modern Place.searchNearby if available
                const request = {
                    fields: ['displayName', 'formattedAddress'],
                    locationRestriction: {
                        center: { lat, lng },
                        radius: 50, // 50 meters
                    },
                    maxResultCount: 1,
                };

                // Check if the new library is loaded and Place is available
                if (google.maps.places && google.maps.places.Place && google.maps.places.Place.searchNearby) {
                    google.maps.places.Place.searchNearby(request)
                        .then((response) => {
                            let exactLocationName = "";
                            if (response.places && response.places.length > 0) {
                                exactLocationName = response.places[0].displayName || "";
                            }

                            // Construct a clean display address
                            const displayAddress = (exactLocationName && exactLocationName !== municipality)
                                ? `${exactLocationName}, ${result.formatted_address}`
                                : result.formatted_address;

                            emitLocation(displayAddress);
                        })
                        .catch((err) => {
                            console.warn("Places API Search Error:", err);
                            // Fallback to geocoded address
                            emitLocation(result.formatted_address);
                        });
                } else {
                    // Fallback if Place API not available or loaded
                    emitLocation(result.formatted_address);
                }

                function emitLocation(finalAddress: string) {
                    onLocationSelect({
                        lat,
                        lng,
                        address: finalAddress,
                        addressComponents: {
                            province,
                            district,
                            municipality,
                            ward,
                            tole,
                            city
                        }
                    });
                }
            }
        });
    }, [geocodingLib, onLocationSelect, setMarkerPosition]);

    // Handle "Locate Me"
    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation not supported");
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                map?.panTo({ lat: latitude, lng: longitude });
                map?.setZoom(17);
                handleLocationUpdate(latitude, longitude);
                setIsLocating(false);
            },
            () => {
                toast.error("Could not get location");
                setIsLocating(false);
            }
        );
    };

    return (
        <>
            <div className="absolute top-4 right-4 z-[1]">
                <Button
                    size="icon"
                    variant="secondary"
                    onClick={handleLocateMe}
                    disabled={isLocating}
                    className="h-10 w-10 bg-white shadow-md border-gray-200 hover:bg-gray-50"
                    type="button" // Prevent form submission
                >
                    {isLocating ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Crosshair className="w-4 h-4 text-gray-700" />}
                </Button>
            </div>

            <Map
                defaultCenter={defaultCenter}
                defaultZoom={18}
                gestureHandling={'greedy'}
                disableDefaultUI={true}
                mapTypeId={'satellite'}
                className="w-full h-full"
                onClick={(e) => {
                    if (e.detail.latLng) {
                        handleLocationUpdate(e.detail.latLng.lat, e.detail.latLng.lng);
                    }
                }}
            >
                <Marker
                    position={markerPosition}
                    draggable={true}
                    onDragEnd={(e) => {
                        if (e.latLng) handleLocationUpdate(e.latLng.lat(), e.latLng.lng());
                    }}
                />
            </Map>
        </>
    );
}