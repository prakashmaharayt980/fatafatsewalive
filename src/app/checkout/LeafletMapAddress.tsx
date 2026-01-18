'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Crosshair, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

// Fix Leaflet Default Icon in Next.js
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

interface LeafletMapAddressProps {
    onLocationSelect: (location: { lat: number; lng: number, address?: string }) => void;
    initialPosition?: { lat: number; lng: number };
}

// Component to handle map clicks and updates
function LocationMarker({ position, onPositionChange }: { position: L.LatLngExpression, onPositionChange: (lat: number, lng: number) => void }) {
    const map = useMap();

    useMapEvents({
        click(e) {
            onPositionChange(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        map.flyTo(position, map.getZoom());
    }, [position, map]);

    const markerRef = useRef<L.Marker>(null);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker) {
                    const { lat, lng } = marker.getLatLng();
                    onPositionChange(lat, lng);
                }
            },
        }),
        [onPositionChange],
    );

    return position === null ? null : (
        <Marker
            position={position}
            icon={icon}
            draggable={true}
            eventHandlers={eventHandlers}
            ref={markerRef}
        >
            <Popup>Selected Location</Popup>
        </Marker>
    );
}

export default function LeafletMapAddress({ onLocationSelect, initialPosition }: LeafletMapAddressProps) {
    const [position, setPosition] = useState<{ lat: number, lng: number }>(initialPosition || { lat: 27.7172, lng: 85.3240 });
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);

    // Reverse Geocoding (Nominatim)
    const fetchAddress = async (lat: number, lng: number) => {
        setIsGeocoding(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data && data.display_name) {
                onLocationSelect({ lat, lng, address: data.display_name });
            } else {
                onLocationSelect({ lat, lng });
            }
        } catch (error) {
            console.error("Geocoding failed", error);
            onLocationSelect({ lat, lng }); // Still update coords even if address fetch fails
        } finally {
            setIsGeocoding(false);
        }
    };

    const handlePositionChange = (lat: number, lng: number) => {
        setPosition({ lat, lng });
        // Debounce or just call fetch? calling directly for now as user interaction is sporadic
        fetchAddress(lat, lng);
    };

    const handleLocateMe = () => {
        setIsLoadingLocation(true);
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported");
            setIsLoadingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition({ lat: latitude, lng: longitude });
                fetchAddress(latitude, longitude);
                setIsLoadingLocation(false);
                toast.success("Location found");
            },
            (err) => {
                console.error(err);
                toast.error("Could not retrieve location");
                setIsLoadingLocation(false);
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-sm z-0">
            <MapContainer
                center={position}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker position={position} onPositionChange={handlePositionChange} />
            </MapContainer>

            {/* Locate Me Button */}
            <div className="absolute top-4 right-4 z-[400]">
                <Button
                    size="icon"
                    onClick={handleLocateMe}
                    disabled={isLoadingLocation}
                    className="rounded-xl shadow-lg bg-white text-gray-700 hover:bg-gray-50 hover:text-blue-600 border border-gray-200 transition-all h-10 w-10"
                    title="Use my current location"
                    type="button"
                >
                    {isLoadingLocation ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    ) : (
                        <Crosshair className="w-5 h-5" />
                    )}
                </Button>
            </div>

            {/* Geocoding Indicator */}
            {isGeocoding && (
                <div className="absolute bottom-4 right-4 z-[400] bg-white/90 px-3 py-1 rounded-full shadow text-xs font-medium text-blue-600 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Updating address...
                </div>
            )}
        </div>
    );
}
