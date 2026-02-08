'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useState } from 'react';
import clubsData from '../data/clubs.json';
import communitiesData from '../data/communities.json';

// Clubs Marker: Blue
const clubIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers-default/blue.png',
    iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers-default/blue-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Communities Marker: Gold
const communityIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers-default/gold.png',
    iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers-default/gold-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function Map() {
    const [clubs] = useState(clubsData);
    const [communities] = useState(communitiesData);

    return (
        <MapContainer
            center={[25.15, 55.23]}
            zoom={11}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%", background: "#242f3e" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Clubs Layer */}
            {clubs.map((club) => (
                <Marker
                    key={club.id}
                    position={[club.location.lat, club.location.lng]}
                    icon={clubIcon}
                >
                    <Popup>
                        <div className="flex flex-col">
                            <div className="h-24 bg-blue-900/50 w-full relative mb-2 rounded-t-lg flex items-center justify-center">
                                <span className="text-2xl">🎾</span>
                            </div>
                            <div className="p-2">
                                <h3 className="text-base font-bold text-white mb-1">{club.name}</h3>
                                <p className="text-xs text-gray-400 mb-1">{club.location.address}</p>
                                <div className="flex justify-between items-center text-xs mb-2">
                                    <span className="text-yellow-400">★ {club.rating}</span>
                                    <span className="text-green-400">{club.price_per_hour} {club.currency}/hr</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {club.socials.instagram && (
                                        <a href={club.socials.instagram} target="_blank" className="bg-pink-600 hover:bg-pink-700 text-white text-xs py-1 px-2 rounded text-center transition-colors">Instagram</a>
                                    )}
                                    {club.booking_url && (
                                        <a href={club.booking_url} target="_blank" className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded text-center transition-colors">Book</a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Communities Layer */}
            {communities.map((community: any) => (
                community.location ? (
                    <Marker
                        key={community.id}
                        position={[community.location.lat, community.location.lng]}
                        icon={communityIcon}
                    >
                        <Popup>
                            <div className="p-2 w-48">
                                <h3 className="text-base font-bold text-yellow-500 mb-1">{community.name}</h3>
                                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full mb-2 inline-block">
                                    {community.platform}
                                </span>
                                <p className="text-xs text-gray-300 mb-2">{community.description}</p>
                                <a href={community.link} target="_blank" className="block w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-1 rounded text-center transition-colors">
                                    Join Group
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ) : null
            ))}

        </MapContainer>
    );
}
