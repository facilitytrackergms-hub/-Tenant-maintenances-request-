/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Tenant Maintenance Request Helpers
   LOCATION: /tenant_request/tenant_request_helpers.js
   VERSION: v2026_06_29_tenant_request_helpers
   UPDATED: 2026-06-29
================================================================ */

export function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export function getTenantRequestCode() {
    const urlParams = new URLSearchParams(window.location.search);

    return (
        urlParams.get('tenant') ||
        urlParams.get('tenant_code') ||
        urlParams.get('request_code') ||
        ''
    ).trim();
}

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
