/* ================================================================
   TENANT MAINTENANCE REQUEST APP
   PURPOSE: Management Data Service
   LOCATION: /management/management_data.js
   VERSION: v2026_07_03_management_data_facility_dropdown
   UPDATED: 2026-07-03
================================================================ */

import { supabase } from '../global_engine/supabaseClient.js';

/* ================================================================
   FETCH TENANTS
================================================================ */

export async function fetchTenants() {
    const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch tenants error:', error);
    }

    return {
        data: Array.isArray(data) ? data : [],
        error
    };
}

/* ================================================================
   FETCH ACTIVE FACILITYS FOR TENANT DROPDOWN
================================================================ */

export async function fetchActiveFacilitysForDropdown() {
    const { data, error } = await supabase
        .from('facilitys')
        .select('id, facility_name, street_address, city, state, zip, active_status')
        .eq('active_status', 'active')
        .order('facility_name', { ascending: true });

    if (error) {
        console.error('Fetch active facilitys for dropdown error:', error);
    }

    return {
        data: Array.isArray(data) ? data : [],
        error
    };
}

/* ================================================================
   CREATE TENANT
================================================================ */

export async function createTenant(payload) {
    const { data, error } = await supabase
        .from('tenants')
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.error('Create tenant error:', error);
    }

    return { data, error };
}

/* ================================================================
   UPDATE TENANT ACTIVE STATUS
================================================================ */

export async function updateTenantActiveStatus({ tenantId, activeStatus }) {
    const { data, error } = await supabase
        .from('tenants')
        .update({
            active_status: activeStatus,
            updated_at: new Date().toISOString()
        })
        .eq('id', tenantId)
        .select()
        .single();

    if (error) {
        console.error('Update tenant active status error:', error);
    }

    return { data, error };
}
