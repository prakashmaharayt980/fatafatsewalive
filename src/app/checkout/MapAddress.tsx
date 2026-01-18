
'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';

interface MapDisplayProps {
    position: LatLngExpression;
    address: string;
}

export default function MapDisplay({ position, address }: MapDisplayProps) {
    return (
        <MapContainer
            center={position}
            zoom={15}
            style={{ height: '200px', width: '100%', borderRadius: '8px' }}
            className="z-0"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
                <Popup>{address}</Popup>
            </Marker>
        </MapContainer>
    );
}