/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Tenant Maintenance Request Form
   LOCATION: /tenant_request/tenant_request_form.js
   VERSION: v2026_06_29_tenant_request_form
   UPDATED: 2026-06-29
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

            <label class="tenant-request-label" for="tenantRequestCategory">
                Category
            </label>
            <select id="tenantRequestCategory" class="tenant-request-select">
                <option value="">Select category</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="hvac">A/C or Heating</option>
                <option value="appliance">Appliance</option>
                <option value="door_lock">Door / Lock</option>
                <option value="pest">Pest Issue</option>
                <option value="general">General Maintenance</option>
                <option value="other">Other</option>
            </select>

            <label class="tenant-request-label" for="tenantRequestDescription">
                Describe the problem
            </label>
            <textarea
                id="tenantRequestDescription"
                class="tenant-request-textarea"
                placeholder="Explain what is happening, where it is located, and how long it has been happening."
            ></textarea>

            <label class="tenant-request-label" for="tenantRequestBestDay">
                Best day for assessment or repair
            </label>
            <select id="tenantRequestBestDay" class="tenant-request-select">
                <option value="">Select day</option>
                <option value="any_day">Any day</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
            </select>

            <label class="tenant-request-label" for="tenantRequestBestTime">
                Best time
            </label>
            <select id="tenantRequestBestTime" class="tenant-request-select">
                <option value="">Select time</option>
                <option value="any_time">Any time</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
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
            tenant_request_form.js | v2026_06_29_tenant_request_form
        </div>
    `;
}
