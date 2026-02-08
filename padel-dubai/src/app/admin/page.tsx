'use client';

import { useState, useEffect } from 'react';
import {
    supabase,
    getClubs,
    getCommunities,
    upsertClub,
    upsertCommunity,
    deleteClub as deleteClubApi,
    deleteCommunity as deleteCommunityApi,
    Club,
    Community
} from '@/lib/supabase';

// Fallback to local JSON if Supabase not configured
import localClubs from '@/data/clubs.json';
import localCommunities from '@/data/communities.json';

const COUNTRIES = [
    { code: 'AE', name: 'UAE 🇦🇪' },
    { code: 'RU', name: 'Russia 🇷🇺' },
    { code: 'GB', name: 'UK 🇬🇧' },
    { code: 'US', name: 'USA 🇺🇸' },
    { code: 'ES', name: 'Spain 🇪🇸' },
    { code: 'FR', name: 'France 🇫🇷' },
    { code: 'DE', name: 'Germany 🇩🇪' },
    { code: 'IT', name: 'Italy 🇮🇹' },
    { code: 'IN', name: 'India 🇮🇳' },
    { code: 'PK', name: 'Pakistan 🇵🇰' },
];

const PLATFORMS = ['Telegram', 'WhatsApp', 'Facebook', 'App', 'Meetup', 'Discord'];
const ZONES = ['alquoz', 'beach', 'downtown', 'marina', 'palm', 'deira', 'meydan', 'sportscity', 'barsha'];

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'clubs' | 'communities'>('clubs');
    const [clubs, setClubs] = useState<Club[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [editingClub, setEditingClub] = useState<Club | null>(null);
    const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'loading', message: string } | null>(null);
    const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setStatus({ type: 'loading', message: 'Loading data...' });

        // Check if Supabase is configured
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) {
            // Use local JSON as fallback
            setClubs(localClubs as Club[]);
            setCommunities(localCommunities as Community[]);
            setIsSupabaseConnected(false);
            setStatus({ type: 'error', message: 'Supabase not configured. Using local data (read-only).' });
            return;
        }

        try {
            const [clubsData, communitiesData] = await Promise.all([
                getClubs(),
                getCommunities()
            ]);

            if (clubsData.length === 0 && communitiesData.length === 0) {
                // Supabase is empty, offer to seed with local data
                setClubs(localClubs as Club[]);
                setCommunities(localCommunities as Community[]);
                setIsSupabaseConnected(true);
                setStatus({ type: 'success', message: 'Connected! Database empty. Click "Seed Database" to populate.' });
            } else {
                setClubs(clubsData);
                setCommunities(communitiesData);
                setIsSupabaseConnected(true);
                setStatus({ type: 'success', message: `Connected! ${clubsData.length} clubs, ${communitiesData.length} communities` });
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setClubs(localClubs as Club[]);
            setCommunities(localCommunities as Community[]);
            setIsSupabaseConnected(false);
            setStatus({ type: 'error', message: 'Connection failed. Using local data.' });
        }

        setTimeout(() => setStatus(null), 3000);
    };

    const seedDatabase = async () => {
        if (!isSupabaseConnected) return;

        setStatus({ type: 'loading', message: 'Seeding database...' });

        try {
            // Insert all clubs
            for (const club of localClubs as Club[]) {
                await upsertClub(club);
            }

            // Insert all communities
            for (const community of localCommunities as Community[]) {
                await upsertCommunity(community);
            }

            await loadData();
            setStatus({ type: 'success', message: 'Database seeded successfully!' });
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to seed database' });
        }

        setTimeout(() => setStatus(null), 3000);
    };

    const createNewClub = (): Club => ({
        id: `club-${Date.now()}`,
        name: '',
        location: { lat: 25.12, lng: 55.20, address: '', zone: 'alquoz' },
        rating: 4.5,
        reviews_count: 0,
        price_per_hour: 250,
        price_level: 3,
        amenities: [],
        images: [],
        socials: {},
        booking_url: '',
        reviews: []
    });

    const createNewCommunity = (): Community => ({
        id: `community-${Date.now()}`,
        name: '',
        platform: 'Telegram',
        members: 0,
        link: '',
        description: '',
        country: 'AE',
        location: { lat: 25.12, lng: 55.20 }
    });

    const saveClub = async (club: Club) => {
        if (isSupabaseConnected) {
            setStatus({ type: 'loading', message: 'Saving...' });
            const success = await upsertClub(club);
            if (success) {
                await loadData();
                setStatus({ type: 'success', message: 'Club saved!' });
            } else {
                setStatus({ type: 'error', message: 'Failed to save club' });
            }
        } else {
            // Local mode - just update state
            const existing = clubs.findIndex(c => c.id === club.id);
            if (existing >= 0) {
                const updated = [...clubs];
                updated[existing] = club;
                setClubs(updated);
            } else {
                setClubs([...clubs, club]);
            }
        }
        setEditingClub(null);
        setIsCreating(false);
        setTimeout(() => setStatus(null), 2000);
    };

    const saveCommunity = async (community: Community) => {
        if (isSupabaseConnected) {
            setStatus({ type: 'loading', message: 'Saving...' });
            const success = await upsertCommunity(community);
            if (success) {
                await loadData();
                setStatus({ type: 'success', message: 'Community saved!' });
            } else {
                setStatus({ type: 'error', message: 'Failed to save community' });
            }
        } else {
            const existing = communities.findIndex(c => c.id === community.id);
            if (existing >= 0) {
                const updated = [...communities];
                updated[existing] = community;
                setCommunities(updated);
            } else {
                setCommunities([...communities, community]);
            }
        }
        setEditingCommunity(null);
        setIsCreating(false);
        setTimeout(() => setStatus(null), 2000);
    };

    const handleDeleteClub = async (id: string) => {
        if (!confirm('Delete this club?')) return;

        if (isSupabaseConnected) {
            setStatus({ type: 'loading', message: 'Deleting...' });
            const success = await deleteClubApi(id);
            if (success) {
                await loadData();
                setStatus({ type: 'success', message: 'Club deleted!' });
            } else {
                setStatus({ type: 'error', message: 'Failed to delete club' });
            }
        } else {
            setClubs(clubs.filter(c => c.id !== id));
        }
        setTimeout(() => setStatus(null), 2000);
    };

    const handleDeleteCommunity = async (id: string) => {
        if (!confirm('Delete this community?')) return;

        if (isSupabaseConnected) {
            setStatus({ type: 'loading', message: 'Deleting...' });
            const success = await deleteCommunityApi(id);
            if (success) {
                await loadData();
                setStatus({ type: 'success', message: 'Community deleted!' });
            } else {
                setStatus({ type: 'error', message: 'Failed to delete community' });
            }
        } else {
            setCommunities(communities.filter(c => c.id !== id));
        }
        setTimeout(() => setStatus(null), 2000);
    };

  const getFlagEmoji = (code: string): string => {
        const flags: Record<string, string> = {
            'AE': '🇦🇪', 'RU': '🇷🇺', 'GB': '🇬🇧', 'US': '🇺🇸', 'ES': '🇪🇸',
            'FR': '🇫🇷', 'DE': '🇩🇪', 'IT': '🇮🇹', 'IN': '🇮🇳', 'PK': '🇵🇰'
        };
        return flags[code] || '🏳️';
    };

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1>🎾 Padel Dubai Admin</h1>
                <div className="admin-actions">
                    <span className={`connection-status ${isSupabaseConnected ? 'connected' : 'disconnected'}`}>
                        {isSupabaseConnected ? '🟢 Live' : '🔴 Local'}
                    </span>
                    {isSupabaseConnected && clubs.length === 0 && (
                        <button onClick={seedDatabase} className="btn-seed">🌱 Seed Database</button>
                    )}
                    <button onClick={loadData} className="btn-refresh">🔄 Refresh</button>
                    {status && (
                        <span className={`status-message ${status.type}`}>{status.message}</span>
                    )}
                </div>
            </header>

            <div className="admin-tabs">
                <button
                    className={`tab ${activeTab === 'clubs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('clubs')}
                >
                    Clubs ({clubs.length})
                </button>
                <button
                    className={`tab ${activeTab === 'communities' ? 'active' : ''}`}
                    onClick={() => setActiveTab('communities')}
                >
                    Communities ({communities.length})
                </button>
            </div>

            <div className="admin-content">
                {activeTab === 'clubs' && (
                    <>
                        <button
                            className="btn-add"
                            onClick={() => { setEditingClub(createNewClub()); setIsCreating(true); }}
                        >
                            + Add Club
                        </button>

                        <div className="items-list">
                            {clubs.map(club => (
                                <div key={club.id} className="item-card">
                                    <div className="item-info">
                                        <h3>{club.name || 'Unnamed'}</h3>
                                        <p>{club.location.address} • ★{club.rating} • {club.price_per_hour} AED</p>
                                    </div>
                                    <div className="item-actions">
                                        <button onClick={() => setEditingClub(club)}>✏️</button>
                                        <button onClick={() => handleDeleteClub(club.id)}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'communities' && (
                    <>
                        <button
                            className="btn-add"
                            onClick={() => { setEditingCommunity(createNewCommunity()); setIsCreating(true); }}
                        >
                            + Add Community
                        </button>

                        <div className="items-list">
                            {communities.map(community => (
                                <div key={community.id} className="item-card">
                                    <div className="item-info">
                                        <h3>{getFlagEmoji(community.country)} {community.name || 'Unnamed'}</h3>
                                        <p>{community.platform} • {community.members} members</p>
                                    </div>
                                    <div className="item-actions">
                                        <button onClick={() => setEditingCommunity(community)}>✏️</button>
                                        <button onClick={() => handleDeleteCommunity(community.id)}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {editingClub && (
                <ClubForm
                    club={editingClub}
                    onSave={saveClub}
                    onCancel={() => { setEditingClub(null); setIsCreating(false); }}
                    isNew={isCreating}
                />
            )}

            {editingCommunity && (
                <CommunityForm
                    community={editingCommunity}
                    onSave={saveCommunity}
                    onCancel={() => { setEditingCommunity(null); setIsCreating(false); }}
                    isNew={isCreating}
                    countries={COUNTRIES}
                    platforms={PLATFORMS}
                />
            )}

            <style jsx>{`
        .admin-container {
          min-height: 100vh;
          background: #f5f5f0;
          font-family: 'Inter', sans-serif;
        }
        .admin-header {
          background: #1a1a1a;
          color: white;
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .admin-header h1 {
          font-size: 1.4rem;
          font-weight: 900;
        }
        .admin-actions {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        .connection-status {
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.85rem;
        }
        .connection-status.connected { background: #22c55e; }
        .connection-status.disconnected { background: #ef4444; }
        .btn-seed, .btn-refresh {
          padding: 8px 16px;
          border: 2px solid white;
          background: transparent;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }
        .btn-seed:hover { background: #22c55e; border-color: #22c55e; }
        .btn-refresh:hover { background: #3b82f6; border-color: #3b82f6; }
        .status-message {
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 0.85rem;
        }
        .status-message.success { background: #22c55e; }
        .status-message.error { background: #ef4444; }
        .status-message.loading { background: #f59e0b; }
        .admin-tabs {
          display: flex;
          border-bottom: 3px solid #1a1a1a;
        }
        .tab {
          flex: 1;
          padding: 16px;
          background: #fff;
          border: none;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          text-transform: uppercase;
        }
        .tab.active { background: #ffd500; }
        .admin-content {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .btn-add {
          background: #ffd500;
          border: 3px solid #1a1a1a;
          padding: 12px 24px;
          font-weight: 900;
          font-size: 1rem;
          cursor: pointer;
          margin-bottom: 20px;
        }
        .btn-add:hover { background: #e6c000; }
        .items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .item-card {
          background: white;
          border: 2px solid #1a1a1a;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .item-info h3 {
          font-weight: 700;
          margin-bottom: 4px;
        }
        .item-info p {
          color: #666;
          font-size: 0.9rem;
        }
        .item-actions {
          display: flex;
          gap: 8px;
        }
        .item-actions button {
          width: 40px;
          height: 40px;
          border: 2px solid #1a1a1a;
          background: white;
          cursor: pointer;
          font-size: 1.2rem;
        }
        .item-actions button:hover { background: #ffd500; }
      `}</style>
        </div>
    );
}

function ClubForm({ club, onSave, onCancel, isNew }: {
    club: Club;
    onSave: (c: Club) => void;
    onCancel: () => void;
    isNew: boolean;
}) {
    const [data, setData] = useState(club);
    const [amenitiesStr, setAmenitiesStr] = useState((club.amenities || []).join(', '));
    const [imagesStr, setImagesStr] = useState((club.images || []).join('\n'));
    const [reviewsStr, setReviewsStr] = useState(
        (club.reviews || []).map(r => `${r.author}|${r.rating}|${r.text}`).join('\n')
    );

    const handleSave = () => {
        const updated = {
            ...data,
            amenities: amenitiesStr.split(',').map(s => s.trim()).filter(Boolean),
            images: imagesStr.split('\n').map(s => s.trim()).filter(Boolean),
            reviews: reviewsStr.split('\n').filter(Boolean).map(line => {
                const [author, rating, text] = line.split('|');
                return { author: author || '', rating: parseInt(rating) || 5, text: text || '' };
            })
        };
        onSave(updated);
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h2>{isNew ? 'Add Club' : 'Edit Club'}</h2>

                <div className="form-grid">
                    <label>
                        Name
                        <input value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
                    </label>

                    <label>
                        Address
                        <input
                            value={data.location.address}
                            onChange={e => setData({ ...data, location: { ...data.location, address: e.target.value } })}
                        />
                    </label>

                    <label>
                        Zone
                        <select
                            value={data.location.zone}
                            onChange={e => setData({ ...data, location: { ...data.location, zone: e.target.value } })}
                        >
                            {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                        </select>
                    </label>

                    <label>
                        Lat / Lng
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="number"
                                step="0.001"
                                value={data.location.lat}
                                onChange={e => setData({ ...data, location: { ...data.location, lat: parseFloat(e.target.value) } })}
                            />
                            <input
                                type="number"
                                step="0.001"
                                value={data.location.lng}
                                onChange={e => setData({ ...data, location: { ...data.location, lng: parseFloat(e.target.value) } })}
                            />
                        </div>
                    </label>

                    <label>
                        Rating (1-5)
                        <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            value={data.rating}
                            onChange={e => setData({ ...data, rating: parseFloat(e.target.value) })}
                        />
                    </label>

                    <label>
                        Price/Hour (AED)
                        <input
                            type="number"
                            value={data.price_per_hour}
                            onChange={e => setData({ ...data, price_per_hour: parseInt(e.target.value) })}
                        />
                    </label>

                    <label>
                        Booking URL
                        <input
                            value={data.booking_url}
                            onChange={e => setData({ ...data, booking_url: e.target.value })}
                        />
                    </label>

                    <label>
                        Instagram
                        <input
                            value={data.socials?.instagram || ''}
                            onChange={e => setData({ ...data, socials: { ...data.socials, instagram: e.target.value } })}
                        />
                    </label>
                </div>

                <label className="full-width">
                    Amenities (comma separated)
                    <input
                        value={amenitiesStr}
                        onChange={e => setAmenitiesStr(e.target.value)}
                        placeholder="indoor, parking, cafe"
                    />
                </label>

                <label className="full-width">
                    Images (one URL per line)
                    <textarea
                        value={imagesStr}
                        onChange={e => setImagesStr(e.target.value)}
                        rows={3}
                    />
                </label>

                <label className="full-width">
                    Reviews (Author|Rating|Text per line)
                    <textarea
                        value={reviewsStr}
                        onChange={e => setReviewsStr(e.target.value)}
                        rows={4}
                        placeholder="John|5|Great courts!"
                    />
                </label>

                <div className="modal-actions">
                    <button onClick={onCancel} className="btn-cancel">Cancel</button>
                    <button onClick={handleSave} className="btn-submit">Save</button>
                </div>

                <style jsx>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
          }
          .modal {
            background: white;
            border: 3px solid #1a1a1a;
            padding: 24px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
          }
          .modal h2 {
            margin-bottom: 20px;
            font-weight: 900;
            text-transform: uppercase;
          }
          .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
          }
          label {
            display: flex;
            flex-direction: column;
            font-weight: 600;
            font-size: 0.85rem;
            text-transform: uppercase;
          }
          .full-width { margin-bottom: 16px; }
          input, select, textarea {
            margin-top: 4px;
            padding: 10px;
            border: 2px solid #1a1a1a;
            font-family: inherit;
            font-size: 0.95rem;
          }
          .modal-actions {
            display: flex;
            gap: 12px;
            margin-top: 20px;
          }
          .btn-cancel {
            flex: 1;
            padding: 12px;
            border: 2px solid #1a1a1a;
            background: white;
            font-weight: 700;
            cursor: pointer;
          }
          .btn-submit {
            flex: 2;
            padding: 12px;
            border: 3px solid #1a1a1a;
            background: #ffd500;
            font-weight: 900;
            cursor: pointer;
          }
        `}</style>
            </div>
        </div>
    );
}

function CommunityForm({ community, onSave, onCancel, isNew, countries, platforms }: {
    community: Community;
    onSave: (c: Community) => void;
    onCancel: () => void;
    isNew: boolean;
    countries: { code: string; name: string }[];
    platforms: string[];
}) {
    const [data, setData] = useState(community);

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h2>{isNew ? 'Add Community' : 'Edit Community'}</h2>

                <div className="form-grid">
                    <label>
                        Name
                        <input value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
                    </label>

                    <label>
                        Platform
                        <select value={data.platform} onChange={e => setData({ ...data, platform: e.target.value })}>
                            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </label>

                    <label>
                        Country
                        <select value={data.country} onChange={e => setData({ ...data, country: e.target.value })}>
                            {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                    </label>

                    <label>
                        Members
                        <input
                            type="number"
                            value={data.members}
                            onChange={e => setData({ ...data, members: parseInt(e.target.value) || 0 })}
                        />
                    </label>

                    <label>
                        Link
                        <input value={data.link} onChange={e => setData({ ...data, link: e.target.value })} />
                    </label>

                    <label>
                        Lat / Lng
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="number"
                                step="0.001"
                                value={data.location.lat}
                                onChange={e => setData({ ...data, location: { ...data.location, lat: parseFloat(e.target.value) } })}
                            />
                            <input
                                type="number"
                                step="0.001"
                                value={data.location.lng}
                                onChange={e => setData({ ...data, location: { ...data.location, lng: parseFloat(e.target.value) } })}
                            />
                        </div>
                    </label>
                </div>

                <label className="full-width">
                    Description
                    <textarea
                        value={data.description}
                        onChange={e => setData({ ...data, description: e.target.value })}
                        rows={3}
                    />
                </label>

                <div className="modal-actions">
                    <button onClick={onCancel} className="btn-cancel">Cancel</button>
                    <button onClick={() => onSave(data)} className="btn-submit">Save</button>
                </div>

                <style jsx>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
          }
          .modal {
            background: white;
            border: 3px solid #1a1a1a;
            padding: 24px;
            max-width: 500px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
          }
          .modal h2 {
            margin-bottom: 20px;
            font-weight: 900;
            text-transform: uppercase;
          }
          .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
          }
          label {
            display: flex;
            flex-direction: column;
            font-weight: 600;
            font-size: 0.85rem;
            text-transform: uppercase;
          }
          .full-width { margin-bottom: 16px; }
          input, select, textarea {
            margin-top: 4px;
            padding: 10px;
            border: 2px solid #1a1a1a;
            font-family: inherit;
            font-size: 0.95rem;
          }
          .modal-actions {
            display: flex;
            gap: 12px;
            margin-top: 20px;
          }
          .btn-cancel {
            flex: 1;
            padding: 12px;
            border: 2px solid #1a1a1a;
            background: white;
            font-weight: 700;
            cursor: pointer;
          }
          .btn-submit {
            flex: 2;
            padding: 12px;
            border: 3px solid #1a1a1a;
            background: #ffd500;
            font-weight: 900;
            cursor: pointer;
          }
        `}</style>
            </div>
        </div>
    );
}
