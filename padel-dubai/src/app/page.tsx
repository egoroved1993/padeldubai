'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { supabase, getClubs, getCommunities, Club, Community } from '@/lib/supabase';
import localClubsData from '../data/clubs.json';
import localCommunitiesData from '../data/communities.json';

const Map = dynamic(() => import('../components/Map'), {
    ssr: false,
    loading: () => <div style={{ width: '100%', height: '100vh', background: '#f5f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>LOADING MAP...</div>
});

interface Review {
    author: string;
    rating: number;
    text: string;
}

export default function Home() {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);
    const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
    const [showCommunities, setShowCommunities] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showClubs, setShowClubs] = useState(true);
    const [showCommunitiesOnMap, setShowCommunitiesOnMap] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();

        // Set up real-time subscription if Supabase is configured
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (supabaseUrl) {
            const clubsSubscription = supabase
                .channel('clubs-changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'clubs' }, () => {
                    loadData();
                })
                .subscribe();

            const communitiesSubscription = supabase
                .channel('communities-changes')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'communities' }, () => {
                    loadData();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(clubsSubscription);
                supabase.removeChannel(communitiesSubscription);
            };
        }
    }, []);

    const loadData = async () => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!supabaseUrl) {
            // Use local JSON
            setClubs(localClubsData as Club[]);
            setCommunities((localCommunitiesData as Community[]).sort((a, b) => b.members - a.members));
            setIsLoading(false);
            return;
        }

        try {
            const [clubsData, communitiesData] = await Promise.all([
                getClubs(),
                getCommunities()
            ]);

            // If database is empty, use local data
            if (clubsData.length === 0) {
                setClubs(localClubsData as Club[]);
            } else {
                setClubs(clubsData);
            }

            if (communitiesData.length === 0) {
                setCommunities((localCommunitiesData as Community[]).sort((a, b) => b.members - a.members));
            } else {
                setCommunities(communitiesData);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setClubs(localClubsData as Club[]);
            setCommunities((localCommunitiesData as Community[]).sort((a, b) => b.members - a.members));
        }

        setIsLoading(false);
    };

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
            case 'app': return '📱';
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

    const getFlagEmoji = (code: string): string => {
        const flags: Record<string, string> = {
            'AE': '🇦🇪', 'RU': '🇷🇺', 'GB': '🇬🇧', 'US': '🇺🇸', 'ES': '🇪🇸',
            'FR': '🇫🇷', 'DE': '🇩🇪', 'IT': '🇮🇹', 'IN': '🇮🇳', 'PK': '🇵🇰'
        };
        return flags[code] || '🏳️';
    };

    const nextImage = () => {
        if (selectedClub && selectedClub.images) {
            setCurrentImageIndex(prev => (prev + 1) % selectedClub.images.length);
        }
    };

    const prevImage = () => {
        if (selectedClub && selectedClub.images) {
            setCurrentImageIndex(prev => (prev - 1 + selectedClub.images.length) % selectedClub.images.length);
        }
    };

    if (isLoading) {
        return (
            <div style={{ width: '100%', height: '100vh', background: '#f5f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                LOADING...
            </div>
        );
    }

    return (
        <div className="container">
            {/* Map Legend */}
            <div className="legend">
                <div className="legend-title">🎾 PADEL DUBAI</div>
                <label className="legend-item">
                    <input type="checkbox" checked={showClubs} onChange={e => setShowClubs(e.target.checked)} />
                    <span className="legend-marker" style={{ background: '#ffd500' }}></span>
                    Clubs ({clubs.length})
                </label>
                <label className="legend-item">
                    <input type="checkbox" checked={showCommunitiesOnMap} onChange={e => setShowCommunitiesOnMap(e.target.checked)} />
                    <span className="legend-marker" style={{ background: '#3b82f6' }}></span>
                    Communities ({communities.length})
                </label>
                <button className="communities-btn" onClick={() => setShowCommunities(!showCommunities)}>
                    {showCommunities ? '✕ Close' : '👥 Communities'}
                </button>
            </div>

            {/* Map */}
            <Map
                clubs={clubs}
                communities={communities}
                onClubSelect={handleClubSelect}
                onCommunitySelect={handleCommunitySelect}
                showClubs={showClubs}
                showCommunities={showCommunitiesOnMap}
            />

            {/* Communities Panel */}
            {showCommunities && (
                <div className="communities-panel">
                    <div className="panel-header">
                        <h2>👥 Communities</h2>
                        <button onClick={() => setShowCommunities(false)}>✕</button>
                    </div>
                    <div className="communities-list">
                        {communities.map(community => (
                            <div key={community.id} className="community-card" onClick={() => handleCommunitySelect(community)}>
                                <span className="platform-icon">{getPlatformIcon(community.platform)}</span>
                                <div className="community-info">
                                    <span className="community-name">{getFlagEmoji(community.country || 'AE')} {community.name}</span>
                                    <span className="community-meta">{community.platform} • {community.members.toLocaleString()} members</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Club Detail Panel */}
            {selectedClub && (
                <div className="detail-panel">
                    <button className="close-btn" onClick={handleClosePanel}>✕</button>

                    {/* Image Gallery */}
                    {selectedClub.images && selectedClub.images.length > 0 && (
                        <div className="gallery">
                            <img
                                src={selectedClub.images[currentImageIndex]}
                                alt={selectedClub.name}
                                className="gallery-image"
                            />
                            {selectedClub.images.length > 1 && (
                                <>
                                    <button className="gallery-nav prev" onClick={prevImage}>‹</button>
                                    <button className="gallery-nav next" onClick={nextImage}>›</button>
                                    <div className="gallery-dots">
                                        {selectedClub.images.map((_, i) => (
                                            <span
                                                key={i}
                                                className={`dot ${i === currentImageIndex ? 'active' : ''}`}
                                                onClick={() => setCurrentImageIndex(i)}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div className="panel-content">
                        <h2>{selectedClub.name}</h2>
                        <div className="rating">
                            <span className="stars">{renderStars(Math.round(selectedClub.rating))}</span>
                            <span>{selectedClub.rating} ({selectedClub.reviews_count} reviews)</span>
                        </div>
                        <div className="price-line">
                            <span className="price">{selectedClub.price_per_hour} AED/hr</span>
                            <span className="price-level">{renderPriceLevel(selectedClub.price_level)}</span>
                        </div>
                        <p className="address">{selectedClub.location.address}</p>

                        {/* Socials */}
                        {selectedClub.socials && Object.keys(selectedClub.socials).length > 0 && (
                            <div className="socials">
                                <h3>📱 Links</h3>
                                <div className="socials-grid">
                                    {Object.entries(selectedClub.socials).map(([key, url]) => url && (
                                        <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="social-link">
                                            {getSocialIcon(key)} {key}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Amenities */}
                        {selectedClub.amenities && selectedClub.amenities.length > 0 && (
                            <div className="amenities">
                                <h3>✨ Amenities</h3>
                                <div className="amenities-list">
                                    {selectedClub.amenities.map((amenity, i) => (
                                        <span key={i} className="amenity-tag">{amenity}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reviews */}
                        {selectedClub.reviews && selectedClub.reviews.length > 0 && (
                            <div className="reviews">
                                <h3>💬 Reviews ({selectedClub.reviews.length})</h3>
                                <div className="reviews-list">
                                    {selectedClub.reviews.slice(0, 10).map((review, i) => (
                                        <div key={i} className="review">
                                            <div className="review-header">
                                                <span className="review-author">{review.author}</span>
                                                <span className="review-rating">{renderStars(review.rating)}</span>
                                            </div>
                                            <p className="review-text">{review.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Book Button */}
                        {selectedClub.booking_url && (
                            <a
                                href={selectedClub.booking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="book-btn"
                            >
                                BOOK NOW
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Community Detail Panel */}
            {selectedCommunity && (
                <div className="detail-panel">
                    <button className="close-btn" onClick={handleClosePanel}>✕</button>
                    <div className="panel-content">
                        <div className="community-header">
                            <span className="big-icon">{getPlatformIcon(selectedCommunity.platform)}</span>
                            <h2>{getFlagEmoji(selectedCommunity.country || 'AE')} {selectedCommunity.name}</h2>
                        </div>
                        <div className="community-stats">
                            <span className="stat">{selectedCommunity.platform}</span>
                            <span className="stat">{selectedCommunity.members.toLocaleString()} members</span>
                        </div>
                        <p className="description">{selectedCommunity.description}</p>
                        <a
                            href={selectedCommunity.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="join-btn"
                        >
                            JOIN COMMUNITY
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
