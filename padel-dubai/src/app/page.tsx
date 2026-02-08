'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Menu, Map as MapIcon, Users } from 'lucide-react';
import communitiesData from '../data/communities.json';

const Map = dynamic(() => import('../components/Map'), {
    ssr: false,
    loading: () => <div style={{ width: '100%', height: '100vh', background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>
});

export default function Home() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<'map' | 'communities'>('map');

    return (
        <main className="app-wrapper">

            {/* Sidebar */}
            <div className={`sidebar ${sidebarOpen ? '' : 'closed'}`}>

                {/* Header */}
                <div className="sidebar-header">
                    <h1 className="app-title">Padel Dubai</h1>
                    {/* Close button mostly for mobile, but visible here too if needed */}
                    <button onClick={() => setSidebarOpen(false)} className="close-btn" style={{ fontSize: '1.2rem', cursor: 'pointer', display: sidebarOpen ? 'block' : 'none' }}>
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        onClick={() => setActiveTab('map')}
                        className={`tab-btn ${activeTab === 'map' ? 'active-clubs' : ''}`}
                    >
                        <MapIcon size={18} />
                        Clubs
                    </button>
                    <button
                        onClick={() => setActiveTab('communities')}
                        className={`tab-btn ${activeTab === 'communities' ? 'active-communities' : ''}`}
                    >
                        <Users size={18} />
                        Communities
                    </button>
                </div>

                {/* Content */}
                <div className="content-area">
                    {activeTab === 'map' && (
                        <div className="space-y-4">
                            <p className="text-sub">Explore the best Padel courts in Dubai. Click on markers on the map.</p>
                        </div>
                    )}

                    {activeTab === 'communities' && (
                        <div>
                            {communitiesData.sort((a, b) => b.members - a.members).map(community => (
                                <div key={community.id} className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">{community.name}</h3>
                                        <span className="badge">
                                            {community.platform}
                                        </span>
                                    </div>
                                    <p className="card-desc">{community.description}</p>
                                    <div className="card-footer">
                                        <span className="members-count">
                                            <Users size={14} /> {community.members} members
                                        </span>
                                        <a
                                            href={community.link}
                                            target="_blank"
                                            className="join-link"
                                        >
                                            Join Group →
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Toggle Button (Visible when sidebar is closed) */}
            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="mobile-toggle"
                >
                    <Menu size={24} />
                </button>
            )}

            {/* Map Area */}
            <div className="map-view">
                <Map />
            </div>
        </main>
    );
}
