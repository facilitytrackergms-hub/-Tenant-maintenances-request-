/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Tenant Maintenance Request Helpers
   LOCATION: /tenant_request/tenant_request_helpers.js
   VERSION: v2026_07_02_tenant_request_helpers_hide_request_code
   UPDATED: 2026-07-02
================================================================ */

const TENANT_REQUEST_CODE_STORAGE_KEY = 'tenant_request_code';
const TENANT_REQUEST_CODE_PARAM_NAMES = [
    'tenant',
    'tenant_code',
    'request_code'
];

export function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

/* ================================================================
   GET TENANT REQUEST CODE
   Reads code from URL first, saves it in session storage,
   then removes it from the visible browser address.
================================================================ */

export function getTenantRequestCode() {
    const requestCodeFromUrl = getTenantRequestCodeFromUrl();

    if (requestCodeFromUrl) {
        saveTenantRequestCode(requestCodeFromUrl);
        hideTenantRequestCodeFromUrl();

        return requestCodeFromUrl;
    }

    return getSavedTenantRequestCode();
}

export function getSavedTenantRequestCode() {
    try {
        return String(sessionStorage.getItem(TENANT_REQUEST_CODE_STORAGE_KEY) || '').trim();
    } catch (error) {
        console.error('Get saved tenant request code error:', error);
        return '';
    }
}

export function clearSavedTenantRequestCode() {
    try {
        sessionStorage.removeItem(TENANT_REQUEST_CODE_STORAGE_KEY);
    } catch (error) {
        console.error('Clear saved tenant request code error:', error);
    }
}

/* ================================================================
   INPUT HELPERS
================================================================ */

export function getInputValue(id) {
    const input = document.getElementById(id);
    return input ? input.value.trim() : '';
}

export function getSelectValue(id) {
    const select = document.getElementById(id);
    return select ? select.value.trim() : '';
}

export function setElementText(id, value) {
    const element = document.getElementById(id);
    if (!element) return;

    element.textContent = value || '';
}

export function showTenantRequestMessage(message, type = 'info') {
    const messageBox = document.getElementById('tenantRequestMessage');
    if (!messageBox) return;

    messageBox.textContent = message || '';
    messageBox.className = `tenant-request-message ${type}`;
}

export function clearTenantRequestMessage() {
    const messageBox = document.getElementById('tenantRequestMessage');
    if (!messageBox) return;

    messageBox.textContent = '';
    messageBox.className = 'tenant-request-message';
}

export function disableTenantRequestButton(isDisabled) {
    const button = document.getElementById('tenantRequestSubmitButton');
    if (!button) return;

    button.disabled = isDisabled;
    button.textContent = isDisabled ? 'Submitting...' : 'Submit Maintenance Request';
}

/* ================================================================
   PAYLOAD BUILDER
================================================================ */

export function buildTenantRequestPayload({ tenant, formValues }) {
    return {
        tenant_id: tenant?.id || null,
        location_id: tenant?.location_id || null,
        unit_number: tenant?.unit_number || formValues.unit_number || '',
        tenant_name: tenant?.tenant_name || formValues.tenant_name || '',
        tenant_phone: tenant?.phone || formValues.tenant_phone || '',
        request_title: formValues.request_title || '',
        request_description: formValues.request_description || '',
        request_category: formValues.request_category || '',
        best_day: formValues.best_day || '',
        best_time: formValues.best_time || '',
        permission_to_enter: formValues.permission_to_enter || '',
        entry_instructions: formValues.entry_instructions || '',
        request_status: 'new',
        request_source: 'tenant_web_form'
    };
}

/* ================================================================
   PRIVATE HELPERS
================================================================ */

function getTenantRequestCodeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);

    for (const paramName of TENANT_REQUEST_CODE_PARAM_NAMES) {
        const value = urlParams.get(paramName);

        if (value && value.trim()) {
            return value.trim();
        }
    }

    return '';
}

function saveTenantRequestCode(requestCode) {
    try {
        sessionStorage.setItem(TENANT_REQUEST_CODE_STORAGE_KEY, requestCode);
    } catch (error) {
        console.error('Save tenant request code error:', error);
    }
}

function hideTenantRequestCodeFromUrl() {
    try {
        const url = new URL(window.location.href);
        let changed = false;

        TENANT_REQUEST_CODE_PARAM_NAMES.forEach((paramName) => {
            if (url.searchParams.has(paramName)) {
                url.searchParams.delete(paramName);
                changed = true;
            }
        });

        if (!changed) return;

        const cleanUrl = `${url.pathname}${url.search}${url.hash}`;

        window.history.replaceState(
            window.history.state,
            '',
            cleanUrl
        );
    } catch (error) {
        console.error('Hide tenant request code from URL error:', error);
    }
}
