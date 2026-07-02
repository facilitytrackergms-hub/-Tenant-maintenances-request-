/* ================================================================
   TENANT MAINTENANCE REQUEST APP
   PURPOSE: Management Screen - Login, Tenants, and Request Links
   LOCATION: /management/management_grid.js
   VERSION: v2026_07_02_management_grid_login_added
   UPDATED: 2026-07-02
================================================================ */

import {
    fetchTenants,
    createTenant,
    updateTenantActiveStatus
} from './management_data.js';

import {
    getCurrentSession,
    signInManager,
    signOutManager,
    fetchCurrentManagerProfile
} from './management_auth.js';

import { injectManagementStyles } from './management_styles.js';

/* ================================================================
   STATE
================================================================ */

let managementContainer = null;
let tenantsCache = [];
let currentManager = null;

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

    const { session } = await getCurrentSession();

    if (!session) {
        renderManagerLogin();
        return;
    }

    const { data: manager, error } = await fetchCurrentManagerProfile();

    if (error || !manager) {
        renderAccessDenied();
        return;
    }

    currentManager = manager;

    await renderManagementHome();
}

/* ================================================================
   LOGIN SCREEN
================================================================ */

function renderManagerLogin() {
    managementContainer.innerHTML = `
        <div class="management-page">
            <div class="management-card">
                <h1 class="management-title">Manager Login</h1>
                <p class="management-subtitle">
                    Log in to manage tenants and request links.
                </p>

                <input id="managementLoginEmail" class="management-input" type="email" placeholder="Email">
                <input id="managementLoginPassword" class="management-input" type="password" placeholder="Password">

                <button id="managementLoginButton" class="management-main-button">
                    Login
                </button>

                <div id="managementMessage" class="management-message"></div>
            </div>

            <div class="management-footer-tag">
                management_grid.js | v2026_07_02_management_grid_login_added
            </div>
        </div>
    `;

    const loginButton = document.getElementById('managementLoginButton');

    if (loginButton) {
        loginButton.onclick = async () => {
            await handleManagerLogin();
        };
    }
}

async function handleManagerLogin() {
    clearManagementMessage();

    const email = getInputValue('managementLoginEmail');
    const password = getInputValue('managementLoginPassword');

    if (!email) {
        showManagementMessage('Enter email.', 'error');
        return;
    }

    if (!password) {
        showManagementMessage('Enter password.', 'error');
        return;
    }

    setLoginButtonDisabled(true);

    const { error } = await signInManager({
        email,
        password
    });

    setLoginButtonDisabled(false);

    if (error) {
        showManagementMessage(error.message || 'Login failed.', 'error');
        return;
    }

    await renderManagementGrid({
        container: managementContainer
    });
}

/* ================================================================
   ACCESS DENIED
================================================================ */

function renderAccessDenied() {
    managementContainer.innerHTML = `
        <div class="management-page">
            <div class="management-card">
                <h1 class="management-title">Access Denied</h1>
                <p class="management-subtitle">
                    This login is not connected to an active manager profile.
                </p>

                <button id="managementLogoutButton" class="management-main-button">
                    Logout
                </button>

                <div id="managementMessage" class="management-message"></div>
            </div>

            <div class="management-footer-tag">
                management_grid.js | v2026_07_02_management_grid_login_added
            </div>
        </div>
    `;

    const logoutButton = document.getElementById('managementLogoutButton');

    if (logoutButton) {
        logoutButton.onclick = async () => {
            await handleManagerLogout();
        };
    }
}

/* ================================================================
   MANAGEMENT HOME
================================================================ */

async function renderManagementHome() {
    managementContainer.innerHTML = `
        <div class="management-page">
            <div class="management-card">
                <h1 class="management-title">Tenant Management</h1>
                <p class="management-subtitle">
                    Logged in as ${escapeHtml(currentManager?.full_name || 'Manager')}
                </p>

                <button id="managementLogoutButton" class="management-small-button" style="width:100%; margin-bottom:14px;">
                    Logout
                </button>

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
                management_grid.js | v2026_07_02_management_grid_login_added
            </div>
        </div>
    `;

    attachManagementHandlers();

    await loadTenants();
}

/* ================================================================
   ATTACH MAIN HANDLERS
================================================================ */

function attachManagementHandlers() {
    const addButton = document.getElementById('managementAddTenantButton');
    const logoutButton = document.getElementById('managementLogoutButton');

    if (addButton) {
        addButton.onclick = async () => {
            await handleAddTenant();
        };
    }

    if (logoutButton) {
        logoutButton.onclick = async () => {
            await handleManagerLogout();
        };
    }
}

async function handleManagerLogout() {
    await signOutManager();

    currentManager = null;
    tenantsCache = [];

    renderManagerLogin();
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

    const { error } = await createTenant(payload);

    setAddButtonDisabled(false);

    if (error) {
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

    const { data, error } = await fetchTenants();

    if (error) {
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
                    <div><strong>Created by manager ID:</strong> ${escapeHtml(tenant.created_by_manager_id || '')}</div>
                    <div><strong>Assigned manager ID:</strong> ${escapeHtml(tenant.assigned_manager_id || '')}</div>
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
        console.error('Copy tenant link error:', error);
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

    const { error } = await updateTenantActiveStatus({
        tenantId: tenant.id,
        activeStatus: nextStatus
    });

    if (error) {
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

function setLoginButtonDisabled(isDisabled) {
    const button = document.getElementById('managementLoginButton');
    if (!button) return;

    button.disabled = isDisabled;
    button.textContent = isDisabled ? 'Logging in...' : 'Login';
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
   ROUTER COMPATIBILITY EXPORTS
================================================================ */

export default async function managementDefaultExport(containerOrContext = {}) {
    await renderManagementGrid(containerOrContext);
}
