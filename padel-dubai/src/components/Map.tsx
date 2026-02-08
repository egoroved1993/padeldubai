'use client';

import { MapContainer, TileLayer, Marker, Popup, Rectangle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useState } from 'react';
import clubsData from '../data/clubs.json';
import zonesData from '../data/zones.json';

// Custom yellow marker icon
const clubIcon = L.divIcon({
    className: 'custom-marker-wrapper',
    html: `<div style="
    background: #ffd500;
    border: 3px solid #1a1a1a;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  ">🎾</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
});

interface Club {
    id: string;
    name: string;
    location: { lat: number; lng: number; address: string; zone: string };
    rating: number;
    reviews: number;
    price_per_hour: number;
    price_level: number;
    amenities: string[];
    socials: { instagram?: string };
    booking_url: string;
}

interface Zone {
    id: string;
    name: string;
    label: string;
    color: string;
    bounds: [[number, number], [number, number]];
    description: string;
}

interface MapProps {
    onClubSelect: (club: Club) => void;
}

export default function Map({ onClubSelect }: MapProps) {
    const [clubs] = useState<Club[]>(clubsData as Club[]);
    const [zones] = useState<Zone[]>(zonesData as Zone[]);

    return (
        <MapContainer
            center={[25.12, 55.20]}
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
        >
            {/* Light/Beige Map Tiles - Stamen Toner Lite / Positron */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            {/* Zone Rectangles with Labels */}
            {zones.map((zone) => (
                <Rectangle
                    key={zone.id}
                    bounds={zone.bounds as L.LatLngBoundsExpression}
                    pathOptions={{
                        color: zone.color,
                        weight: 3,
                        dashArray: '8, 8',
                        fillColor: zone.color,
                        fillOpacity: 0.1,
                    }}
                >
                    <Tooltip
                        permanent
                        direction="center"
                        className="zone-tooltip"
                    >
                        <span style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 900,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            color: zone.color,
                            textShadow: '1px 1px 2px white, -1px -1px 2px white',
                            whiteSpace: 'nowrap',
                        }}>
                            {zone.label}
                        </span>
                    </Tooltip>
                </Rectangle>
            ))}

            {/* Club Markers */}
            {clubs.map((club) => (
                <Marker
                    key={club.id}
                    position={[club.location.lat, club.location.lng]}
                    icon={clubIcon}
                    eventHandlers={{
                        click: () => onClubSelect(club),
                    }}
                >
                    <Tooltip direction="top" offset={[0, -10]}>
                        <div style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 700,
                            fontSize: '12px',
                            padding: '4px 8px',
                            background: '#1a1a1a',
                            color: '#fff',
                            textTransform: 'uppercase',
                        }}>
                            {club.name}
                        </div>
                    </Tooltip>
                </Marker>
            ))}

        </MapContainer>
    );
}
