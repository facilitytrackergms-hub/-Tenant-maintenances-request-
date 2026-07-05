/* ================================================================
   TENANT MAINTENANCE REQUEST APP
   PURPOSE: Tenants Data Service
   LOCATION: /tenants/tenants_data.js
   VERSION: v2026_07_05_tenants_data_first_build
   UPDATED: 2026-07-05
================================================================ */

import { supabase } from '../global_engine/supabaseClient.js';

/* ================================================================
   FETCH TENANTS BY FACILITY
================================================================ */

export async function fetchTenantsByFacilityId(facilityId) {
    if (!facilityId) {
        return {
            data: [],
            error: {
                message: 'Missing facility ID.'
            }
        };
    }

    const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('facility_id', facilityId)
        .order('unit_number', { ascending: true });

    if (error) {
        console.error('Fetch tenants by facility error:', error);
    }

    return { data, error };
}

/* ================================================================
   CREATE TENANT
================================================================ */

export async function createTenant(payload) {
    const requestCode = payload.request_code || crypto.randomUUID();

    const insertPayload = {
        facility_id: payload.facility_id,
        tenant_name: payload.tenant_name || '',
        unit_number: payload.unit_number || '',
        phone: payload.phone || '',
        email: payload.email || '',
        active_status: payload.active_status || 'active',
        notes: payload.notes || '',
        request_code: requestCode,
        created_by_manager_id: payload.created_by_manager_id || null,
        assigned_manager_id: payload.assigned_manager_id || null,
        updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('tenants')
        .insert(insertPayload)
        .select()
        .single();

    if (error) {
        console.error('Create tenant error:', error);
    }

    return { data, error };
}

/* ================================================================
   UPDATE TENANT STATUS
================================================================ */

export async function updateTenantStatus({ tenantId, activeStatus }) {
    if (!tenantId) {
        return {
            data: null,
            error: {
                message: 'Missing tenant ID.'
            }
        };
    }

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
        console.error('Update tenant status error:', error);
    }

    return { data, error };
}
