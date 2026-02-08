import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface Club {
    id: string;
    name: string;
    location: { lat: number; lng: number; address: string; zone: string };
    rating: number;
    price_per_hour: number;
    currency?: string;
    socials: Record<string, string>;
    booking_url?: string;
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

interface MapProps {
    clubs: Club[];
    communities: Community[];
    onClubSelect?: (club: Club) => void;
    onCommunitySelect?: (community: Community) => void;
    showClubs: boolean;
    showCommunities: boolean;
}

export default function Map({ clubs, communities, onClubSelect, onCommunitySelect, showClubs, showCommunities }: MapProps) {

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
            {showClubs && clubs.map((club) => (
                <Marker
                    key={club.id}
                    position={[club.location.lat, club.location.lng]}
                    icon={clubIcon}
                    eventHandlers={{
                        click: () => onClubSelect?.(club),
                    }}
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
                                    <span className="text-green-400">{club.price_per_hour} AED/hr</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {club.socials.instagram && (
                                        <a href={club.socials.instagram} target="_blank" rel="noopener noreferrer" className="bg-pink-600 hover:bg-pink-700 text-white text-xs py-1 px-2 rounded text-center transition-colors">Instagram</a>
                                    )}
                                    {club.booking_url && (
                                        <a href={club.booking_url} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded text-center transition-colors">Book</a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Communities Layer */}
            {showCommunities && communities.map((community) => (
                community.location ? (
                    <Marker
                        key={community.id}
                        position={[community.location.lat, community.location.lng]}
                        icon={communityIcon}
                        eventHandlers={{
                            click: () => onCommunitySelect?.(community),
                        }}
                    >
                        <Popup>
                            <div className="p-2 w-48">
                                <h3 className="text-base font-bold text-yellow-500 mb-1">{community.name}</h3>
                                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full mb-2 inline-block">
                                    {community.platform}
                                </span>
                                <p className="text-xs text-gray-300 mb-2">{community.description}</p>
                                <a href={community.link} target="_blank" rel="noopener noreferrer" className="block w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-1 rounded text-center transition-colors">
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

