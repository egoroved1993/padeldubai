'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useState, useEffect } from 'react';
import clubsData from '../data/clubs.json';

// Fix for default markers in Next.js
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

export default function Map() {
    const [clubs, setClubs] = useState(clubsData);

    return (
        <MapContainer
            center={[25.2048, 55.2708]}
            zoom={11}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {clubs.map((club) => (
                <Marker
                    key={club.id}
                    position={[club.location.lat, club.location.lng]}
                    icon={icon}
                >
                    <Popup>
                        <div className="flex flex-col">
                            <div className="h-32 bg-gray-700 w-full relative">
                                {/* Placeholder for image */}
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                    Image
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-white mb-1">{club.name}</h3>
                                <p className="text-sm text-gray-400 mb-2">{club.location.address}</p>
                                <div className="flex justify-between items-center text-sm mb-3">
                                    <span className="text-yellow-400">★ {club.rating} ({club.reviews})</span>
                                    <span className="text-green-400">{club.price_per_hour} {club.currency}/hr</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {club.socials.instagram && (
                                        <a href={club.socials.instagram} target="_blank" className="bg-pink-600 text-white text-xs py-1 px-2 rounded text-center">Instagram</a>
                                    )}
                                    {club.booking_url && (
                                        <a href={club.booking_url} target="_blank" className="bg-blue-600 text-white text-xs py-1 px-2 rounded text-center">Book Now</a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
