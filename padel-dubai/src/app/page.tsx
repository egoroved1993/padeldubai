'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import clubsData from '../data/clubs.json';
import communitiesData from '../data/communities.json';

const Map = dynamic(() => import('../components/Map'), {
    ssr: false,
    loading: () => <div style={{ width: '100%', height: '100vh', background: '#f5f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>LOADING MAP...</div>
});

interface Review {
    author: string;
    rating: number;
    text: string;
}

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
    reviews: Review[];
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

export default function Home() {
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);
    const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
    const [showCommunities, setShowCommunities] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showClubs, setShowClubs] = useState(true);
    const [showCommunitiesOnMap, setShowCommunitiesOnMap] = useState(true);

    const communities = (communitiesData as Community[]).sort((a, b) => b.members - a.members);

    const handleClubSelect = (club: Club) => {
        setSelectedClub(club);
        setSelectedCommunity(null);
        setCurrentImageIndex(0);
    };

    const handleCommunitySelect = (community: Community) => {
        setSelectedCommunity(community);
        setSelectedClub(null);
    };

    const handleClosePanel = () => {
        setSelectedClub(null);
        setSelectedCommunity(null);
    };

    const renderPriceLevel = (level: number) => {
        return Array(5).fill(0).map((_, i) => (
            <span key={i} className={i < level ? 'price-active' : 'price-inactive'}>$</span>
        ));
    };

    const renderStars = (rating: number) => {
        return Array(5).fill(0).map((_, i) => (
            <span key={i}>{i < rating ? '★' : '☆'}</span>
        ));
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'telegram': return '✈️';
            case 'whatsapp': return '💬';
            case 'facebook': return '📘';
            case 'meetup': return '🤝';
            default: return '🔗';
        }
    };

    const getSocialIcon = (social: string) => {
        switch (social) {
            case 'instagram': return '📷';
            case 'facebook': return '📘';
            case 'twitter': return '🐦';
            case 'tiktok': return '🎵';
            case 'youtube': return '▶️';
            case 'linkedin': return '💼';
            case 'website': return '🌐';
            default: return '🔗';
        }
    };

    const nextImage = () => {
        if (selectedClub && selectedClub.images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % selectedClub.images.length);
        }
    };

    const prevImage = () => {
        if (selectedClub && selectedClub.images.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + selectedClub.images.length) % selectedClub.images.length);
        }
    };

    return (
        <div className="app-container">
            {/* Map */}
            <div className="map-container">
                <Map
                    onClubSelect={handleClubSelect}
                    onCommunitySelect={handleCommunitySelect}
                    showClubs={showClubs}
                    showCommunities={showCommunitiesOnMap}
                />

                {/* Legend */}
                <div className="map-legend">
                    <div className="legend-title">MAP LEGEND</div>
                    <label className="legend-item">
                        <input type="checkbox" checked={showClubs} onChange={(e) => setShowClubs(e.target.checked)} />
                        <div className="legend-dot" style={{ background: '#ffd500' }}></div>
                        <span>Padel Clubs</span>
                    </label>
                    <label className="legend-item">
                        <input type="checkbox" checked={showCommunitiesOnMap} onChange={(e) => setShowCommunitiesOnMap(e.target.checked)} />
                        <div className="legend-dot" style={{ background: '#3b82f6' }}></div>
                        <span>Communities</span>
                    </label>
                    <button
                        className="legend-btn"
                        onClick={() => setShowCommunities(!showCommunities)}
                    >
                        {showCommunities ? 'HIDE LIST' : 'COMMUNITIES LIST'}
                    </button>
                </div>
            </div>

            {/* Communities List Panel */}
            {showCommunities && !selectedClub && !selectedCommunity && (
                <div className="communities-panel">
                    <div className="panel-header">
                        <h2>COMMUNITIES</h2>
                        <button className="detail-close" onClick={() => setShowCommunities(false)}>✕</button>
                    </div>
                    <div className="communities-list">
                        {communities.map((community) => (
                            <div
                                key={community.id}
                                className="community-card"
                                onClick={() => handleCommunitySelect(community)}
                            >
                                <div className="community-icon">{getPlatformIcon(community.platform)}</div>
                                <div className="community-info">
                                    <h3>{community.name}</h3>
                                    <p className="community-platform">{community.platform}</p>
                                    <p className="community-members">{community.members.toLocaleString()} members</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Club Detail Panel */}
            <div className={`detail-panel ${selectedClub ? 'open' : ''}`}>
                {selectedClub && (
                    <>
                        <button className="detail-close" onClick={handleClosePanel}>✕</button>

                        {/* Image Gallery */}
                        <div className="detail-gallery">
                            <img
                                src={selectedClub.images[currentImageIndex]}
                                alt={selectedClub.name}
                                className="gallery-image"
                            />
                            {selectedClub.images.length > 1 && (
                                <>
                                    <button className="gallery-btn gallery-prev" onClick={prevImage}>‹</button>
                                    <button className="gallery-btn gallery-next" onClick={nextImage}>›</button>
                                    <div className="gallery-dots">
                                        {selectedClub.images.map((_, i) => (
                                            <span
                                                key={i}
                                                className={`gallery-dot ${i === currentImageIndex ? 'active' : ''}`}
                                                onClick={() => setCurrentImageIndex(i)}
                                            ></span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="detail-body">
                            <div className="detail-header">
                                <h2 className="detail-name">{selectedClub.name}</h2>
                                <div className="detail-rating">★ {selectedClub.rating}</div>
                            </div>

                            <p className="detail-address">{selectedClub.location.address}, Dubai</p>

                            {/* Social Icons */}
                            <div className="social-icons">
                                {Object.entries(selectedClub.socials).map(([key, url]) => (
                                    url && (
                                        <a key={key} href={url} target="_blank" className="social-icon" title={key}>
                                            {getSocialIcon(key)}
                                        </a>
                                    )
                                ))}
                            </div>

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
                                <div className="detail-label">Reviews ({selectedClub.reviews_count})</div>
                                <div className="reviews-list">
                                    {selectedClub.reviews.slice(0, 10).map((review, i) => (
                                        <div key={i} className="review-item">
                                            <div className="review-header">
                                                <span className="review-author">{review.author}</span>
                                                <span className="review-stars">{renderStars(review.rating)}</span>
                                            </div>
                                            <p className="review-text">{review.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <a
                                href={selectedClub.booking_url}
                                target="_blank"
                                className="detail-cta"
                            >
                                Book Now
                            </a>
                        </div>
                    </>
                )}
            </div>

            {/* Community Detail Panel */}
            <div className={`detail-panel ${selectedCommunity ? 'open' : ''}`}>
                {selectedCommunity && (
                    <>
                        <button className="detail-close" onClick={handleClosePanel}>✕</button>

                        <div className="detail-image" style={{ background: '#3b82f6', color: 'white' }}>
                            <span style={{ fontSize: '4rem' }}>{getPlatformIcon(selectedCommunity.platform)}</span>
                        </div>

                        <div className="detail-body">
                            <div className="detail-header">
                                <h2 className="detail-name">{selectedCommunity.name}</h2>
                                <div className="detail-rating" style={{ background: '#3b82f6', color: 'white' }}>
                                    {selectedCommunity.members.toLocaleString()}
                                </div>
                            </div>

                            <p className="detail-address">{selectedCommunity.platform} • {selectedCommunity.members.toLocaleString()} members</p>

                            <p style={{ margin: '16px 0', color: '#666', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                {selectedCommunity.description}
                            </p>

                            <a
                                href={selectedCommunity.link}
                                target="_blank"
                                className="detail-cta"
                                style={{ background: '#3b82f6' }}
                            >
                                Join {selectedCommunity.platform}
                            </a>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
