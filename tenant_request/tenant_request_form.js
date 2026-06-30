/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Tenant Maintenance Request Form
   LOCATION: /tenant_request/tenant_request_form.js
   VERSION: v2026_06_30_tenant_request_form_time_select_fix
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

            <label class="tenant-request-label">
                Best time
            </label>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div>
                    <label class="tenant-request-label" for="tenantRequestBestTimeFrom" style="margin-top:0;">
                        From
                    </label>
                    <select id="tenantRequestBestTimeFrom" class="tenant-request-select">
                        <option value="">From</option>
                        <option value="08:00">8:00 AM</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="17:00">5:00 PM</option>
                        <option value="18:00">6:00 PM</option>
                    </select>
                </div>

                <div>
                    <label class="tenant-request-label" for="tenantRequestBestTimeTo" style="margin-top:0;">
                        To
                    </label>
                    <select id="tenantRequestBestTimeTo" class="tenant-request-select">
                        <option value="">To</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="17:00">5:00 PM</option>
                        <option value="18:00">6:00 PM</option>
                        <option value="19:00">7:00 PM</option>
                    </select>
                </div>
            </div>

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
            tenant_request_form.js | v2026_06_30_tenant_request_form_time_select_fix
        </div>
    `;
}
