'use client';

import { MapContainer, TileLayer, Marker, Tooltip, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import { useState } from 'react';
import clubsData from '../data/clubs.json';
import communitiesData from '../data/communities.json';
import zonesData from '../data/zones.json';

// Custom yellow marker icon for clubs
const clubIcon = L.divIcon({
    className: 'custom-marker-wrapper',
    html: `<div style="
    background: #ffd500;
    border: 3px solid #1a1a1a;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  ">🎾</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

// Blue marker icon for communities
const communityIcon = L.divIcon({
    className: 'custom-marker-wrapper',
    html: `<div style="
    background: #3b82f6;
    border: 3px solid #1a1a1a;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    color: white;
  ">👥</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

interface Club {
    id: string;
    name: string;
    location: { lat: number; lng: number; address: string; zone: string };
    rating: number;
    reviews_count: number;
    price_per_hour: number;
    price_level: number;
    amenities: string[];
    images: string[];
    socials: { instagram?: string; facebook?: string; twitter?: string; tiktok?: string; youtube?: string; linkedin?: string; website?: string };
    booking_url: string;
    reviews: { author: string; rating: number; text: string }[];
}

interface Community {
    id: string;
    name: string;
    platform: string;
    members: number;
    link: string;
    description: string;
    location?: { lat: number; lng: number };
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
    onCommunitySelect: (community: Community) => void;
    showClubs: boolean;
    showCommunities: boolean;
}

export default function Map({ onClubSelect, onCommunitySelect, showClubs, showCommunities }: MapProps) {
    const [clubs] = useState<Club[]>(clubsData as Club[]);
    const [communities] = useState<Community[]>(communitiesData as Community[]);
    const [zones] = useState<Zone[]>(zonesData as Zone[]);

    return (
        <MapContainer
            center={[25.12, 55.20]}
            zoom={12}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
        >
            {/* Light Map Tiles */}
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
                        fillOpacity: 0.08,
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
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            color: zone.color,
                            textShadow: '1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white',
                            whiteSpace: 'nowrap',
                        }}>
                            {zone.label}
                        </span>
                    </Tooltip>
                </Rectangle>
            ))}

            {/* Club Markers */}
            {showClubs && clubs.map((club) => (
                <Marker
                    key={club.id}
                    position={[club.location.lat, club.location.lng]}
                    icon={clubIcon}
                    eventHandlers={{
                        click: () => onClubSelect(club),
                    }}
                >
                    <Tooltip direction="top" offset={[0, -12]}>
                        <div style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 700,
                            fontSize: '11px',
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

            {/* Community Markers */}
            {showCommunities && communities.map((community) => (
                community.location && (
                    <Marker
                        key={community.id}
                        position={[community.location.lat, community.location.lng]}
                        icon={communityIcon}
                        eventHandlers={{
                            click: () => onCommunitySelect(community),
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -12]}>
                            <div style={{
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 700,
                                fontSize: '11px',
                                padding: '4px 8px',
                                background: '#3b82f6',
                                color: '#fff',
                                textTransform: 'uppercase',
                            }}>
                                {community.name} ({community.members})
                            </div>
                        </Tooltip>
                    </Marker>
                )
            ))}

        </MapContainer>
    );
}
