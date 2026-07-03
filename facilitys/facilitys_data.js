/* ================================================================
   TENANT MAINTENANCE REQUEST APP
   PURPOSE: Facilitys Data Service
   LOCATION: /facilitys/facilitys_data.js
   VERSION: v2026_07_03_facilitys_data_first_build
   UPDATED: 2026-07-03
================================================================ */

import { supabase } from '../global_engine/supabaseClient.js';

/* ================================================================
   FETCH FACILITYS
================================================================ */

export async function fetchFacilitys() {
    const { data, error } = await supabase
        .from('facilitys')
        .select('*')
        .order('facility_name', { ascending: true });

    if (error) {
        console.error('Fetch facilitys error:', error);
    }

    return {
        data: Array.isArray(data) ? data : [],
        error
    };
}

/* ================================================================
   FETCH ACTIVE FACILITYS
================================================================ */

export async function fetchActiveFacilitys() {
    const { data, error } = await supabase
        .from('facilitys')
        .select('*')
        .eq('active_status', 'active')
        .order('facility_name', { ascending: true });

    if (error) {
        console.error('Fetch active facilitys error:', error);
    }

    return {
        data: Array.isArray(data) ? data : [],
        error
    };
}

/* ================================================================
   CREATE FACILITY
================================================================ */

export async function createFacility(payload) {
    const { data, error } = await supabase
        .from('facilitys')
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.error('Create facility error:', error);
    }

    return { data, error };
}

/* ================================================================
   UPDATE FACILITY STATUS
================================================================ */

export async function updateFacilityStatus({ facilityId, activeStatus }) {
    const { data, error } = await supabase
        .from('facilitys')
        .update({
            active_status: activeStatus,
            updated_at: new Date().toISOString()
        })
        .eq('id', facilityId)
        .select()
        .single();

    if (error) {
        console.error('Update facility status error:', error);
    }

    return { data, error };
}
