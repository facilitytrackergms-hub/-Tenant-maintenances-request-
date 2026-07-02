/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Tenant Maintenance Request Data Service
   LOCATION: /tenant_request/tenant_request_data.js
   VERSION: v2026_07_02_tenant_request_data_hidden_code_support
   UPDATED: 2026-07-02
================================================================ */

import { supabase } from '../global_engine/supabaseClient.js';
import { getSavedTenantRequestCode } from './tenant_request_helpers.js';

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
        .rpc('get_tenant_by_request_code', {
            request_code: requestCode
        })
        .maybeSingle();

    if (error) {
        console.error('Fetch tenant by request code error:', error);
    }

    return { data, error };
}

/* ================================================================
   CREATE TENANT MAINTENANCE REQUEST
================================================================ */

export async function createTenantMaintenanceRequest(payload) {
    const requestCode = getSavedTenantRequestCode();

    if (!requestCode) {
        return {
            data: null,
            error: {
                message: 'Missing tenant request code.'
            }
        };
    }

    const { data, error } = await supabase
        .rpc('submit_tenant_maintenance_request', {
            request_code: requestCode,
            request_title_text: payload.request_title || '',
            request_description_text: payload.request_description || '',
            request_category_text: payload.request_category || '',
            best_day_text: payload.best_day || '',
            best_time_text: payload.best_time || '',
            permission_to_enter_text: payload.permission_to_enter || '',
            entry_instructions_text: payload.entry_instructions || ''
        });

    if (error) {
        console.error('Create tenant maintenance request error:', error);
    }

    return {
        data: data ? { id: data } : null,
        error
    };
}

/* ================================================================
   NOT USED PUBLICLY
   KEEP TABLE LOCKED DOWN
================================================================ */

export async function fetchTenantMaintenanceRequests() {
    return {
        data: [],
        error: {
            message: 'Tenant request history is not public.'
        }
    };
}
