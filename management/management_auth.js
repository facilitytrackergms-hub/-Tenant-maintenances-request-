/* ================================================================
   TENANT MAINTENANCE REQUEST APP
   PURPOSE: Management Auth Service
   LOCATION: /management/management_auth.js
   VERSION: v2026_07_02_management_auth_first_build
   UPDATED: 2026-07-02
================================================================ */

import { supabase } from '../global_engine/supabaseClient.js';

/* ================================================================
   GET CURRENT SESSION
================================================================ */

export async function getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        console.error('Get current session error:', error);
    }

    return {
        session: data?.session || null,
        error
    };
}

/* ================================================================
   SIGN IN MANAGER
================================================================ */

export async function signInManager({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error('Manager sign in error:', error);
    }

    return {
        session: data?.session || null,
        user: data?.user || null,
        error
    };
}

/* ================================================================
   SIGN OUT MANAGER
================================================================ */

export async function signOutManager() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Manager sign out error:', error);
    }

    return { error };
}

/* ================================================================
   FETCH CURRENT MANAGER PROFILE
================================================================ */

export async function fetchCurrentManagerProfile() {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
        console.error('Get auth user error:', userError);
        return {
            data: null,
            error: userError
        };
    }

    const authUserId = userData?.user?.id;

    if (!authUserId) {
        return {
            data: null,
            error: {
                message: 'No logged in user.'
            }
        };
    }

    const { data, error } = await supabase
        .from('managers')
        .select('*')
        .eq('auth_user_id', authUserId)
        .eq('active_status', 'active')
        .maybeSingle();

    if (error) {
        console.error('Fetch current manager profile error:', error);
    }

    return { data, error };
}
