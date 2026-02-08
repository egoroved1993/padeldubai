'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import clubsData from '../data/clubs.json';

const Map = dynamic(() => import('../components/Map'), {
    ssr: false,
    loading: () => <div style={{ width: '100%', height: '100vh', background: '#f5f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>LOADING MAP...</div>
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

export default function Home() {
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);

    const handleClubSelect = (club: Club) => {
        setSelectedClub(club);
    };

    const handleClosePanel = () => {
        setSelectedClub(null);
    };

    const renderPriceLevel = (level: number) => {
        return Array(5).fill(0).map((_, i) => (
            <span key={i} className={i < level ? 'price-active' : 'price-inactive'}>$</span>
        ));
    };

    return (
        <div className="app-container">
            {/* Map */}
            <div className="map-container">
                <Map onClubSelect={handleClubSelect} />

                {/* Legend */}
                <div className="map-legend">
                    <div className="legend-title">Map Legend</div>
                    <div className="legend-item">
                        <div className="legend-dot" style={{ background: '#ffd500' }}></div>
                        <span>Padel Clubs</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-dot" style={{ background: '#22c55e' }}></div>
                        <span>Padel Central Zone</span>
                    </div>
                </div>
            </div>

            {/* Detail Panel */}
            <div className={`detail-panel ${selectedClub ? 'open' : ''}`}>
                {selectedClub && (
                    <>
                        <button className="detail-close" onClick={handleClosePanel}>✕</button>

                        <div className="detail-image">🎾</div>

                        <div className="detail-body">
                            <div className="detail-header">
                                <h2 className="detail-name">{selectedClub.name}</h2>
                                <div className="detail-rating">★ {selectedClub.rating}</div>
                            </div>

                            <p className="detail-address">{selectedClub.location.address}, Dubai</p>

                            {selectedClub.socials.instagram && (
                                <a
                                    href={selectedClub.socials.instagram}
                                    target="_blank"
                                    className="detail-cta"
                                >
                                    Instagram
                                </a>
                            )}

                            <div className="detail-section">
                                <div className="detail-label">Details</div>
                                <div className="detail-tags">
                                    {selectedClub.amenities.map((amenity, i) => (
                                        <span key={i} className="detail-tag">{amenity}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="detail-section">
                                <div className="detail-label">Price</div>
                                <div className="detail-price">
                                    {renderPriceLevel(selectedClub.price_level)}
                                </div>
                                <p style={{ marginTop: '8px', color: '#666', fontSize: '0.9rem' }}>
                                    ~{selectedClub.price_per_hour} AED/hour
                                </p>
                            </div>

                            <div className="detail-section">
                                <div className="detail-label">Reviews ({selectedClub.reviews})</div>
                                <div className="detail-reviews">
                                    <div className="review-header">
                                        <span className="review-author">PadelFan2024</span>
                                        <span className="review-stars">★★★★☆</span>
                                    </div>
                                    <p className="review-text">
                                        Great courts, good vibes. {selectedClub.price_level >= 3 ? 'Pricey but worth it.' : 'Good value for money.'}
                                    </p>
                                </div>
                            </div>

                            <a
                                href={selectedClub.booking_url}
                                target="_blank"
                                className="detail-cta"
                                style={{ marginTop: '20px' }}
                            >
                                Book Now
                            </a>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
