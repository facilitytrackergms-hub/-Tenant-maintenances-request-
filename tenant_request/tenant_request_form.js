/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Tenant Maintenance Request Form
   LOCATION: /tenant_request/tenant_request_form.js
   VERSION: v2026_06_30_tenant_request_form_one_time_box
   UPDATED: 2026-06-30
================================================================ */

import { escapeHtml } from './tenant_request_helpers.js';

export function renderTenantRequestForm({ tenant }) {
    return `
        <div class="tenant-request-card">
            <h1 class="tenant-request-title">Maintenance Request</h1>
            <p class="tenant-request-subtitle">
                Submit your maintenance request below. Include as much detail as possible.
            </p>

            <div class="tenant-request-tenant-box">
                <div class="tenant-request-tenant-line">
                    <strong>Tenant:</strong> ${escapeHtml(tenant?.tenant_name || 'Tenant')}
                </div>
                <div class="tenant-request-tenant-line">
                    <strong>Unit:</strong> ${escapeHtml(tenant?.unit_number || '')}
                </div>
                <div class="tenant-request-tenant-line">
                    <strong>Phone:</strong> ${escapeHtml(tenant?.phone || '')}
                </div>
            </div>

            <label class="tenant-request-label" for="tenantRequestDescription">
                What needs repair?
            </label>
            <textarea
                id="tenantRequestDescription"
                class="tenant-request-textarea"
                placeholder="Example: Bathroom sink is leaking under the cabinet."
            ></textarea>

            <label class="tenant-request-label" for="tenantRequestBestDay">
                Best date for assessment or repair
            </label>
            <input
                id="tenantRequestBestDay"
                class="tenant-request-input"
                type="date"
            >

            <label class="tenant-request-label" for="tenantRequestBestTime">
                Best time
            </label>
            <input
                id="tenantRequestBestTime"
                class="tenant-request-input"
                type="time"
            >

            <label class="tenant-request-label" for="tenantRequestPermissionToEnter">
                Permission to enter apartment if you are not home?
            </label>
            <select id="tenantRequestPermissionToEnter" class="tenant-request-select">
                <option value="">Select answer</option>
                <option value="yes_permission_to_enter">Yes, you may enter</option>
                <option value="call_first">Call me first</option>
                <option value="tenant_must_be_home">No, I must be home</option>
            </select>

            <label class="tenant-request-label" for="tenantRequestEntryInstructions">
                Special instructions for entering
            </label>
            <textarea
                id="tenantRequestEntryInstructions"
                class="tenant-request-textarea"
                placeholder="Example: Dog inside, call before entering, key under mat, etc."
            ></textarea>

            <button id="tenantRequestSubmitButton" class="tenant-request-button">
                Submit Maintenance Request
            </button>

            <div id="tenantRequestMessage" class="tenant-request-message"></div>
        </div>

        <div class="tenant-request-footer-tag">
            tenant_request_form.js | v2026_06_30_tenant_request_form_one_time_box
        </div>
    `;
}
