'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Menu, Map as MapIcon, Users } from 'lucide-react';
import communitiesData from '../data/communities.json';

const Map = dynamic(() => import('../components/Map'), {
    ssr: false,
    loading: () => <div className="w-full h-screen bg-gray-900 flex items-center justify-center text-white">Loading Map...</div>
});

export default function Home() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<'map' | 'communities'>('map');

    return (
        <main className="flex h-screen w-full relative">
            {/* Sidebar / Overlay */}
            <div className={`absolute top-0 left-0 h-full z-[1000] bg-gray-900/95 backdrop-blur-md w-full md:w-[400px] transition-transform duration-300 border-r border-gray-800 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        Padel Dubai
                    </h1>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-2 gap-2 border-b border-gray-800">
                    <button
                        onClick={() => setActiveTab('map')}
                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${activeTab === 'map' ? 'bg-yellow-500/10 text-yellow-500' : 'text-gray-400 hover:bg-gray-800'}`}
                    >
                        <MapIcon size={18} />
                        Clubs
                    </button>
                    <button
                        onClick={() => setActiveTab('communities')}
                        className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${activeTab === 'communities' ? 'bg-blue-500/10 text-blue-500' : 'text-gray-400 hover:bg-gray-800'}`}
                    >
                        <Users size={18} />
                        Communities
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {activeTab === 'map' && (
                        <div className="space-y-4">
                            <p className="text-gray-400 text-sm">Explore the best Padel courts in Dubai. Click on markers for details.</p>
                            {/* List view of clubs could go here if needed, but the map is primary */}
                        </div>
                    )}

                    {activeTab === 'communities' && (
                        <div className="space-y-4">
                            {communitiesData.sort((a, b) => b.members - a.members).map(community => (
                                <div key={community.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-white">{community.name}</h3>
                                        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full">
                                            {community.platform}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-3">{community.description}</p>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 flex items-center gap-1">
                                            <Users size={14} /> {community.members} members
                                        </span>
                                        <a
                                            href={community.link}
                                            target="_blank"
                                            className="text-blue-400 hover:text-blue-300 font-medium"
                                        >
                                            Join {community.platform === 'Telegram' ? 'Channel' : 'Group'} →
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Toggle Button (Mobile) */}
            {!sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="absolute top-4 left-4 z-[1000] bg-gray-900 text-white p-3 rounded-full shadow-lg"
                >
                    <Menu size={24} />
                </button>
            )}

            {/* Map Area */}
            <div className="flex-1 h-full w-full">
                <Map />
            </div>
        </main>
    );
}
