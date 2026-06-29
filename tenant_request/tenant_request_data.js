/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Tenant Maintenance Request Data Service
   LOCATION: /tenant_request/tenant_request_data.js
   VERSION: v2026_06_29_tenant_request_data
   UPDATED: 2026-06-29
================================================================ */

import { supabase } from '../global_engine/supabaseClient.js';

/* ================================================================
   FETCH TENANT BY PRIVATE REQUEST CODE
================================================================ */

export async function fetchTenantByRequestCode(requestCode) {
    if (!requestCode) {
        return {
            data: null,
            error: {
                message: 'Missing tenant request code.'
            }
        };
    }

    const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('request_public_uuid', requestCode)
        .eq('active_status', 'active')
        .single();

    if (error) {
        console.error('Fetch tenant by request code error:', error);
    }

    return { data, error };
}

/* ================================================================
   CREATE TENANT MAINTENANCE REQUEST
================================================================ */

export async function createTenantMaintenanceRequest(payload) {
    const { data, error } = await supabase
        .from('tenant_maintenance_requests')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error('Create tenant maintenance request error:', error);
    }

    return { data, error };
}

/* ================================================================
   FETCH TENANT REQUESTS BY TENANT
   OPTIONAL FOR LATER USE
================================================================ */

export async function fetchTenantMaintenanceRequests(tenantId) {
    if (!tenantId) {
        return {
            data: [],
            error: {
                message: 'Missing tenant id.'
            }
        };
    }

    const { data, error } = await supabase
        .from('tenant_maintenance_requests')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch tenant maintenance requests error:', error);
    }

    return { data: data || [], error };
}
