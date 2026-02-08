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
                        <div className="popup-content">
                            <div className="popup-header">
                                <span>🎾</span>
                            </div>
                            <div className="popup-body">
                                <h3 className="popup-title">{club.name}</h3>
                                <p className="dark-text" style={{ fontSize: '0.8rem', margin: '0 0 0.5rem 0' }}>{club.location.address}</p>
                                <div className="popup-meta">
                                    <span style={{ color: '#d97706', fontWeight: 'bold' }}>★ {club.rating}</span>
                                    <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{club.price_per_hour} AED/hr</span>
                                </div>
                                <div className="popup-actions">
                                    {club.socials.instagram && (
                                        <a href={club.socials.instagram} target="_blank" className="btn-action btn-insta">Instagram</a>
                                    )}
                                    {club.booking_url && (
                                        <a href={club.booking_url} target="_blank" className="btn-action btn-book">Book</a>
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
                            <div style={{ width: '200px' }}>
                                <h3 style={{ margin: '0 0 5px', fontSize: '1rem', fontWeight: 'bold', color: '#333' }}>{community.name}</h3>
                                <span style={{ background: '#374151', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px' }}>
                                    {community.platform}
                                </span>
                                <p style={{ fontSize: '0.8rem', color: '#555', margin: '8px 0' }}>{community.description}</p>
                                <a href={community.link} target="_blank" style={{
                                    display: 'block', width: '100%', background: '#ca8a04', color: 'white',
                                    textAlign: 'center', padding: '5px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.8rem'
                                }}>
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
