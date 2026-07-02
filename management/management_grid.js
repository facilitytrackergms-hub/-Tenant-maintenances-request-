/* ================================================================
   TENANT MAINTENANCE REQUEST APP
   PURPOSE: Management Screen - Tenants and Request Links
   LOCATION: /management/management_grid.js
   VERSION: v2026_07_02_management_grid_first_build
   UPDATED: 2026-07-02
================================================================ */

import { supabase } from '../global_engine/supabaseClient.js';

/* ================================================================
   STATE
================================================================ */

let managementContainer = null;
let tenantsCache = [];

/* ================================================================
   MAIN RENDER
================================================================ */

export async function renderManagementGrid(containerOrContext = {}) {
    managementContainer = resolveManagementContainer(containerOrContext);

    if (!managementContainer) {
        console.error('Management container not found.');
        return;
    }

    injectManagementStyles();

    managementContainer.innerHTML = `
        <div class="management-page">
            <div class="management-card">
                <h1 class="management-title">Tenant Management</h1>
                <p class="management-subtitle">
                    Create tenants and copy their maintenance request links.
                </p>

                <div class="management-section-title">Add Tenant</div>

                <input id="managementTenantName" class="management-input" placeholder="Tenant name">
                <input id="managementUnitNumber" class="management-input" placeholder="Unit / Apartment">
                <input id="managementPhone" class="management-input" placeholder="Phone">
                <input id="managementEmail" class="management-input" placeholder="Email">
                <input id="managementLocationId" class="management-input" placeholder="Location ID optional">
                <textarea id="managementNotes" class="management-textarea" placeholder="Notes"></textarea>

                <button id="managementAddTenantButton" class="management-main-button">
                    Add Tenant
                </button>

                <div id="managementMessage" class="management-message"></div>
            </div>

            <div class="management-card">
                <div class="management-section-title">Tenants</div>
                <div id="managementTenantsList" class="management-list">
                    Loading tenants...
                </div>
            </div>

            <div class="management-footer-tag">
                management_grid.js | v2026_07_02_management_grid_first_build
            </div>
        </div>
    `;

    attachManagementHandlers();
    await loadTenants();
}

/* ================================================================
   ATTACH HANDLERS
================================================================ */

function attachManagementHandlers() {
    const addButton = document.getElementById('managementAddTenantButton');

    if (addButton) {
        addButton.onclick = async () => {
            await handleAddTenant();
        };
    }
}

/* ================================================================
   ADD TENANT
================================================================ */

async function handleAddTenant() {
    clearManagementMessage();

    const tenantName = getInputValue('managementTenantName');
    const unitNumber = getInputValue('managementUnitNumber');
    const phone = getInputValue('managementPhone');
    const email = getInputValue('managementEmail');
    const locationIdValue = getInputValue('managementLocationId');
    const notes = getInputValue('managementNotes');

    if (!tenantName) {
        showManagementMessage('Enter tenant name.', 'error');
        return;
    }

    if (!unitNumber) {
        showManagementMessage('Enter unit / apartment.', 'error');
        return;
    }

    const payload = {
        tenant_name: tenantName,
        unit_number: unitNumber,
        phone: phone,
        email: email,
        location_id: locationIdValue ? Number(locationIdValue) : null,
        active_status: 'active',
        notes: notes,
        updated_at: new Date().toISOString()
    };

    setAddButtonDisabled(true);

    const { error } = await supabase
        .from('tenants')
        .insert(payload);

    setAddButtonDisabled(false);

    if (error) {
        console.error('Add tenant error:', error);
        showManagementMessage(error.message || 'Tenant could not be added.', 'error');
        return;
    }

    clearTenantForm();
    showManagementMessage('Tenant added.', 'success');

    await loadTenants();
}

/* ================================================================
   LOAD TENANTS
================================================================ */

async function loadTenants() {
    const list = document.getElementById('managementTenantsList');

    if (!list) return;

    list.innerHTML = `
        <div class="management-loading">
            Loading tenants...
        </div>
    `;

    const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Load tenants error:', error);

        list.innerHTML = `
            <div class="management-error-box">
                Could not load tenants. Check Supabase RLS or console error.
            </div>
        `;
        return;
    }

    tenantsCache = Array.isArray(data) ? data : [];

    renderTenantsList();
}

/* ================================================================
   RENDER TENANTS
================================================================ */

function renderTenantsList() {
    const list = document.getElementById('managementTenantsList');

    if (!list) return;

    if (!tenantsCache.length) {
        list.innerHTML = `
            <div class="management-empty">
                No tenants yet.
            </div>
        `;
        return;
    }

    list.innerHTML = tenantsCache.map((tenant) => {
        const tenantLink = buildTenantRequestLink(tenant.request_public_uuid);
        const isActive = tenant.active_status === 'active';

        return `
            <div class="management-tenant-card" data-tenant-id="${escapeHtml(tenant.id)}">
                <div class="management-tenant-header">
                    <div>
                        <div class="management-tenant-name">
                            ${escapeHtml(tenant.tenant_name || 'Tenant')}
                        </div>
                        <div class="management-tenant-unit">
                            Unit: ${escapeHtml(tenant.unit_number || '')}
                        </div>
                    </div>

                    <div class="${isActive ? 'management-status-active' : 'management-status-inactive'}">
                        ${escapeHtml(tenant.active_status || 'inactive')}
                    </div>
                </div>

                <div class="management-tenant-details">
                    <div><strong>Phone:</strong> ${escapeHtml(tenant.phone || '')}</div>
                    <div><strong>Email:</strong> ${escapeHtml(tenant.email || '')}</div>
                    <div><strong>Location ID:</strong> ${escapeHtml(tenant.location_id || '')}</div>
                </div>

                <label class="management-link-label">
                    Tenant Request Link
                </label>

                <textarea class="management-link-box" readonly>${escapeHtml(tenantLink)}</textarea>

                <div class="management-button-row">
                    <button class="management-small-button" data-copy-link="${escapeHtml(tenant.id)}">
                        Copy Link
                    </button>

                    <button class="management-small-button" data-open-link="${escapeHtml(tenant.id)}">
                        Open
                    </button>

                    <button class="${isActive ? 'management-warning-button' : 'management-small-button'}" data-toggle-active="${escapeHtml(tenant.id)}">
                        ${isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    attachTenantCardHandlers();
}

/* ================================================================
   TENANT CARD HANDLERS
================================================================ */

function attachTenantCardHandlers() {
    document.querySelectorAll('[data-copy-link]').forEach((button) => {
        button.onclick = async () => {
            const tenantId = button.getAttribute('data-copy-link');
            await copyTenantLink(tenantId);
        };
    });

    document.querySelectorAll('[data-open-link]').forEach((button) => {
        button.onclick = () => {
            const tenantId = button.getAttribute('data-open-link');
            openTenantLink(tenantId);
        };
    });

    document.querySelectorAll('[data-toggle-active]').forEach((button) => {
        button.onclick = async () => {
            const tenantId = button.getAttribute('data-toggle-active');
            await toggleTenantActiveStatus(tenantId);
        };
    });
}

async function copyTenantLink(tenantId) {
    const tenant = findTenantById(tenantId);

    if (!tenant) {
        showManagementMessage('Tenant not found.', 'error');
        return;
    }

    const tenantLink = buildTenantRequestLink(tenant.request_public_uuid);

    try {
        await navigator.clipboard.writeText(tenantLink);
        showManagementMessage('Tenant link copied.', 'success');
    } catch (error) {
        console.error('Copy link error:', error);
        showManagementMessage('Copy failed. Select and copy the link manually.', 'error');
    }
}

function openTenantLink(tenantId) {
    const tenant = findTenantById(tenantId);

    if (!tenant) {
        showManagementMessage('Tenant not found.', 'error');
        return;
    }

    const tenantLink = buildTenantRequestLink(tenant.request_public_uuid);

    window.open(tenantLink, '_blank');
}

async function toggleTenantActiveStatus(tenantId) {
    const tenant = findTenantById(tenantId);

    if (!tenant) {
        showManagementMessage('Tenant not found.', 'error');
        return;
    }

    const nextStatus = tenant.active_status === 'active' ? 'inactive' : 'active';

    const { error } = await supabase
        .from('tenants')
        .update({
            active_status: nextStatus,
            updated_at: new Date().toISOString()
        })
        .eq('id', tenant.id);

    if (error) {
        console.error('Toggle tenant status error:', error);
        showManagementMessage(error.message || 'Tenant status could not be updated.', 'error');
        return;
    }

    showManagementMessage(`Tenant marked ${nextStatus}.`, 'success');

    await loadTenants();
}

/* ================================================================
   LINK BUILDER
================================================================ */

function buildTenantRequestLink(requestPublicUuid) {
    const baseUrl = `${window.location.origin}${window.location.pathname}`;

    return `${baseUrl}?request_code=${encodeURIComponent(requestPublicUuid || '')}`;
}

/* ================================================================
   HELPERS
================================================================ */

function resolveManagementContainer(containerOrContext) {
    if (containerOrContext instanceof HTMLElement) {
        return containerOrContext;
    }

    if (containerOrContext?.container instanceof HTMLElement) {
        return containerOrContext.container;
    }

    if (containerOrContext?.app instanceof HTMLElement) {
        return containerOrContext.app;
    }

    return (
        document.getElementById('app') ||
        document.getElementById('main') ||
        document.getElementById('root') ||
        document.body
    );
}

function findTenantById(tenantId) {
    return tenantsCache.find((tenant) => String(tenant.id) === String(tenantId));
}

function getInputValue(id) {
    const input = document.getElementById(id);
    return input ? input.value.trim() : '';
}

function clearTenantForm() {
    setInputValue('managementTenantName', '');
    setInputValue('managementUnitNumber', '');
    setInputValue('managementPhone', '');
    setInputValue('managementEmail', '');
    setInputValue('managementLocationId', '');
    setInputValue('managementNotes', '');
}

function setInputValue(id, value) {
    const input = document.getElementById(id);
    if (!input) return;

    input.value = value;
}

function showManagementMessage(message, type = 'info') {
    const messageBox = document.getElementById('managementMessage');
    if (!messageBox) return;

    messageBox.textContent = message || '';
    messageBox.className = `management-message ${type}`;
}

function clearManagementMessage() {
    const messageBox = document.getElementById('managementMessage');
    if (!messageBox) return;

    messageBox.textContent = '';
    messageBox.className = 'management-message';
}

function setAddButtonDisabled(isDisabled) {
    const button = document.getElementById('managementAddTenantButton');
    if (!button) return;

    button.disabled = isDisabled;
    button.textContent = isDisabled ? 'Adding...' : 'Add Tenant';
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

/* ================================================================
   STYLES
================================================================ */

function injectManagementStyles() {
    if (document.getElementById('management-grid-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'management-grid-styles';

    style.textContent = `
        .management-page {
            width: 100%;
            min-height: 100%;
            padding: 14px;
            box-sizing: border-box;
            background: #dbeafe;
            color: #0f172a;
            font-family: Arial, sans-serif;
        }

        .management-card {
            background: #ffffff;
            border-radius: 14px;
            padding: 14px;
            margin: 0 0 14px 0;
            box-shadow: 0 4px 14px rgba(0,0,0,0.14);
            border: 1px solid #bfdbfe;
        }

        .management-title {
            font-size: 22px;
            margin: 0 0 4px 0;
            color: #0f3b85;
        }

        .management-subtitle {
            font-size: 12px;
            margin: 0 0 14px 0;
            color: #334155;
        }

        .management-section-title {
            font-size: 15px;
            font-weight: 700;
            margin: 0 0 10px 0;
            color: #0f3b85;
        }

        .management-input,
        .management-textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #93c5fd;
            border-radius: 10px;
            padding: 10px;
            margin: 0 0 10px 0;
            font-size: 14px;
            background: #eff6ff;
            color: #0f172a;
            outline: none;
        }

        .management-textarea {
            min-height: 70px;
            resize: vertical;
        }

        .management-main-button {
            width: 100%;
            border: none;
            border-radius: 10px;
            padding: 12px;
            background: #1d4ed8;
            color: #ffffff;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
        }

        .management-main-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .management-message {
            margin-top: 10px;
            min-height: 18px;
            font-size: 12px;
            font-weight: 700;
        }

        .management-message.success {
            color: #166534;
        }

        .management-message.error {
            color: #991b1b;
        }

        .management-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .management-tenant-card {
            border: 1px solid #93c5fd;
            border-radius: 12px;
            padding: 12px;
            background: #eff6ff;
            text-align: left;
        }

        .management-tenant-header {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            align-items: flex-start;
            margin-bottom: 8px;
        }

        .management-tenant-name {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
        }

        .management-tenant-unit {
            font-size: 12px;
            color: #334155;
            margin-top: 2px;
        }

        .management-status-active,
        .management-status-inactive {
            font-size: 11px;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 999px;
            white-space: nowrap;
        }

        .management-status-active {
            background: #dcfce7;
            color: #166534;
        }

        .management-status-inactive {
            background: #fee2e2;
            color: #991b1b;
        }

        .management-tenant-details {
            font-size: 12px;
            color: #334155;
            line-height: 1.5;
            margin-bottom: 10px;
        }

        .management-link-label {
            display: block;
            font-size: 12px;
            font-weight: 700;
            color: #0f3b85;
            margin-bottom: 5px;
        }

        .management-link-box {
            width: 100%;
            min-height: 62px;
            box-sizing: border-box;
            border: 1px solid #93c5fd;
            border-radius: 10px;
            padding: 8px;
            font-size: 11px;
            background: #ffffff;
            color: #0f172a;
            resize: vertical;
        }

        .management-button-row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 8px;
            margin-top: 10px;
        }

        .management-small-button,
        .management-warning-button {
            border: none;
            border-radius: 9px;
            padding: 9px 6px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
        }

        .management-small-button {
            background: #2563eb;
            color: #ffffff;
        }

        .management-warning-button {
            background: #b91c1c;
            color: #ffff00;
        }

        .management-loading,
        .management-empty,
        .management-error-box {
            font-size: 13px;
            padding: 10px;
            border-radius: 10px;
            background: #eff6ff;
            color: #334155;
        }

        .management-error-box {
            color: #991b1b;
            background: #fee2e2;
        }

        .management-footer-tag {
            text-align: center;
            font-size: 10px;
            color: #475569;
            margin: 14px 0 20px 0;
        }
    `;

    document.head.appendChild(style);
}

/* ================================================================
   ROUTER COMPATIBILITY EXPORTS
================================================================ */

export default async function managementDefaultExport(containerOrContext = {}) {
    await renderManagementGrid(containerOrContext);
}
