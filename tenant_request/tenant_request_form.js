/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Tenant Maintenance Request Form
   LOCATION: /tenant_request/tenant_request_form.js
   VERSION: v2026_06_30_tenant_request_form_remove_category
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

            <label class="tenant-request-label" for="tenantRequestTitle">
                What needs repair?
            </label>
            <input
                id="tenantRequestTitle"
                class="tenant-request-input"
                type="text"
                placeholder="Example: Bathroom sink leaking"
                autocomplete="off"
            >

            <label class="tenant-request-label" for="tenantRequestDescription">
                Describe the problem
            </label>
            <textarea
                id="tenantRequestDescription"
                class="tenant-request-textarea"
                placeholder="Explain what is happening, where it is located, and how long it has been happening."
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
                Best time window
            </label>
            <select id="tenantRequestBestTime" class="tenant-request-select">
                <option value="">Select time</option>
                <option value="8:00 AM - 10:00 AM">8:00 AM - 10:00 AM</option>
                <option value="9:00 AM - 11:00 AM">9:00 AM - 11:00 AM</option>
                <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                <option value="12:00 PM - 2:00 PM">12:00 PM - 2:00 PM</option>
                <option value="1:00 PM - 3:00 PM">1:00 PM - 3:00 PM</option>
                <option value="2:00 PM - 4:00 PM">2:00 PM - 4:00 PM</option>
                <option value="3:00 PM - 5:00 PM">3:00 PM - 5:00 PM</option>
            </select>

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
            tenant_request_form.js | v2026_06_30_tenant_request_form_remove_category
        </div>
    `;
}
