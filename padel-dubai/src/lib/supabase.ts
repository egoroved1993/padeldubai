import { createClient } from '@supabase/supabase-js';

// Supabase credentials - замените на свои после создания проекта
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Review {
    author: string;
    rating: number;
    text: string;
}

export interface Club {
    id: string;
    name: string;
    location: { lat: number; lng: number; address: string; zone: string };
    rating: number;
    reviews_count: number;
    price_per_hour: number;
    price_level: number;
    amenities: string[];
    images: string[];
    socials: Record<string, string>;
    booking_url: string;
    reviews: Review[];
}

export interface Community {
    id: string;
    name: string;
    platform: string;
    members: number;
    link: string;
    description: string;
    country: string;
    location: { lat: number; lng: number };
}

// API functions
export async function getClubs(): Promise<Club[]> {
    const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching clubs:', error);
        return [];
    }
    return data || [];
}

export async function getCommunities(): Promise<Community[]> {
    const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('members', { ascending: false });

    if (error) {
        console.error('Error fetching communities:', error);
        return [];
    }
    return data || [];
}

export async function upsertClub(club: Club): Promise<boolean> {
    const { error } = await supabase
        .from('clubs')
        .upsert(club, { onConflict: 'id' });

    if (error) {
        console.error('Error saving club:', error);
        return false;
    }
    return true;
}

export async function upsertCommunity(community: Community): Promise<boolean> {
    const { error } = await supabase
        .from('communities')
        .upsert(community, { onConflict: 'id' });

    if (error) {
        console.error('Error saving community:', error);
        return false;
    }
    return true;
}

export async function deleteClub(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting club:', error);
        return false;
    }
    return true;
}

export async function deleteCommunity(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting community:', error);
        return false;
    }
    return true;
}
