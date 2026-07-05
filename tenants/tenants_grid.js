/* ================================================================
   TENANT MAINTENANCE REQUEST APP
   PURPOSE: Tenants Grid - Add Tenant, Find Unit, Tenant Detail
   LOCATION: /tenants/tenants_grid.js
   VERSION: v2026_07_05_tenants_grid_one_view_search
   UPDATED: 2026-07-05
================================================================ */

import {
    fetchTenantsByFacilityId,
    createTenant,
    updateTenantStatus
} from './tenants_data.js';

import {
    getCurrentSession,
    fetchCurrentManagerProfile
} from '../management/management_auth.js';

import { injectTenantsStyles } from './tenants_styles.js?v=20260705_tenants_search_1';

/* ================================================================
   STATE
================================================================ */

let tenantsContainer = null;
let tenantsCache = [];
let currentManager = null;
let currentFacility = null;
let currentFacilityId = null;
let selectedTenant = null;
let currentTenantMode = 'find';

/* ================================================================
   MAIN RENDER
================================================================ */

export async function renderTenantsGrid(containerOrContext = {}) {
    tenantsContainer = resolveTenantsContainer(containerOrContext);

    if (!tenantsContainer) {
        console.error('Tenants container not found.');
        return;
    }

    injectTenantsStyles();

    const { session } = await getCurrentSession();

    if (!session) {
        renderLoginRequired();
        return;
    }

    const { data: manager, error } = await fetchCurrentManagerProfile();

    if (error || !manager) {
        renderAccessDenied();
        return;
    }

    currentManager = manager;
    currentFacility = containerOrContext?.facility || null;
    currentFacilityId =
        containerOrContext?.facilityId ||
        containerOrContext?.facility?.id ||
        getFacilityIdFromUrl();

    currentTenantMode =
        containerOrContext?.tenantMode ||
        getTenantModeFromUrl() ||
        'find';

    if (!currentFacilityId) {
        renderMissingFacility();
        return;
    }

    if (currentTenantMode === 'add') {
        renderAddTenantView();
        return;
    }

    renderFindTenantView();
    await loadTenantsForSearch();
}

/* ================================================================
   LOGIN REQUIRED
================================================================ */

function renderLoginRequired() {
    tenantsContainer.innerHTML = `
        <div class="tenants-page">
            <div class="tenants-card">
                <h1 class="tenants-title">Tenants</h1>
                <p class="tenants-subtitle">Manager login required.</p>

                <button id="tenantsGoToManagementButton" class="tenants-main-button">
                    Go To Manager Login
                </button>
            </div>

            <div class="tenants-footer-tag">
                tenants_grid.js | v2026_07_05_tenants_grid_one_view_search
            </div>
        </div>
    `;

    const button = document.getElementById('tenantsGoToManagementButton');

    if (button) {
        button.onclick = () => {
            goToView('management');
        };
    }
}

/* ================================================================
   ACCESS DENIED
================================================================ */

function renderAccessDenied() {
    tenantsContainer.innerHTML = `
        <div class="tenants-page">
            <div class="tenants-card">
                <h1 class="tenants-title">Access Denied</h1>
                <p class="tenants-subtitle">
                    This login is not connected to an active manager profile.
                </p>

                <button id="tenantsBackToManagementButton" class="tenants-main-button">
                    Back To Management
                </button>
            </div>

            <div class="tenants-footer-tag">
                tenants_grid.js | v2026_07_05_tenants_grid_one_view_search
            </div>
        </div>
    `;

    const button = document.getElementById('tenantsBackToManagementButton');

    if (button) {
        button.onclick = () => {
            goToView('management');
        };
    }
}

/* ================================================================
   MISSING FACILITY
================================================================ */

function renderMissingFacility() {
    tenantsContainer.innerHTML = `
        <div class="tenants-page">
            <div class="tenants-card">
                <h1 class="tenants-title">Tenants</h1>
                <p class="tenants-subtitle">
                    Missing facility. Go back and select a facility first.
                </p>

                <button id="tenantsBackToFacilitysButton" class="tenants-main-button">
                    Back To Facilitys
                </button>
            </div>

            <div class="tenants-footer-tag">
                tenants_grid.js | v2026_07_05_tenants_grid_one_view_search
            </div>
        </div>
    `;

    const button = document.getElementById('tenantsBackToFacilitysButton');

    if (button) {
        button.onclick = () => {
            goToView('facilitys');
        };
    }
}

/* ================================================================
   ADD TENANT VIEW
================================================================ */

function renderAddTenantView() {
    selectedTenant = null;

    tenantsContainer.innerHTML = `
        <div class="tenants-page">
            <div class="tenants-card">
                <h1 class="tenants-title">Add Tenant</h1>
                <p class="tenants-subtitle">
                    ${escapeHtml(getFacilityTitle())}
                </p>

                <button id="tenantsBackButton" class="tenants-small-button" style="width:100%; margin-bottom:14px;">
                    Back To Facilitys
                </button>

                <input id="tenantUnitInput" class="tenants-input" placeholder="Unit number">
                <input id="tenantNameInput" class="tenants-input" placeholder="Tenant name">
                <input id="tenantPhoneInput" class="tenants-input" placeholder="Phone">
                <input id="tenantEmailInput" class="tenants-input" placeholder="Email">
                <textarea id="tenantNotesInput" class="tenants-textarea" placeholder="Notes"></textarea>

                <button id="tenantAddButton" class="tenants-main-button">
                    Add Tenant
                </button>

                <button id="tenantGoToFindButton" class="tenants-small-button" style="width:100%; margin-top:14px;">
                    Find Tenant / Unit
                </button>

                <div id="tenantsMessage" class="tenants-message"></div>
            </div>

            <div class="tenants-footer-tag">
                tenants_grid.js | v2026_07_05_tenants_grid_one_view_search
            </div>
        </div>
    `;

    attachAddTenantHandlers();
}

function attachAddTenantHandlers() {
    const backButton = document.getElementById('tenantsBackButton');
    const addButton = document.getElementById('tenantAddButton');
    const findButton = document.getElementById('tenantGoToFindButton');

    if (backButton) {
        backButton.onclick = () => {
            goToView('facilitys');
        };
    }

    if (addButton) {
        addButton.onclick = async () => {
            await handleAddTenant();
        };
    }

    if (findButton) {
        findButton.onclick = async () => {
            currentTenantMode = 'find';
            renderFindTenantView();
            await loadTenantsForSearch();
        };
    }
}

/* ================================================================
   FIND TENANT VIEW
================================================================ */

function renderFindTenantView() {
    selectedTenant = null;

    tenantsContainer.innerHTML = `
        <div class="tenants-page">
            <div class="tenants-card">
                <h1 class="tenants-title">Find Tenant / Unit</h1>
                <p class="tenants-subtitle">
                    ${escapeHtml(getFacilityTitle())}
                </p>

                <button id="tenantsBackButton" class="tenants-small-button" style="width:100%; margin-bottom:14px;">
                    Back To Facilitys
                </button>

                <input id="tenantSearchInput" class="tenants-input" placeholder="Search unit number">

                <button id="tenantSearchButton" class="tenants-main-button">
                    Search Unit
                </button>

                <button id="tenantGoToAddButton" class="tenants-small-button" style="width:100%; margin-top:14px;">
                    Add New Tenant
                </button>

                <div id="tenantsMessage" class="tenants-message"></div>
            </div>

            <div class="tenants-card">
                <div class="tenants-section-title">Search Results</div>

                <div id="tenantsList" class="tenants-list">
                    Type a unit number to search.
                </div>
            </div>

            <div class="tenants-footer-tag">
                tenants_grid.js | v2026_07_05_tenants_grid_one_view_search
            </div>
        </div>
    `;

    attachFindTenantHandlers();
}

function attachFindTenantHandlers() {
    const backButton = document.getElementById('tenantsBackButton');
    const searchInput = document.getElementById('tenantSearchInput');
    const searchButton = document.getElementById('tenantSearchButton');
    const addButton = document.getElementById('tenantGoToAddButton');

    if (backButton) {
        backButton.onclick = () => {
            goToView('facilitys');
        };
    }

    if (searchInput) {
        searchInput.oninput = () => {
            renderSearchResults(searchInput.value);
        };

        searchInput.onkeydown = (event) => {
            if (event.key === 'Enter') {
                renderSearchResults(searchInput.value);
            }
        };
    }

    if (searchButton) {
        searchButton.onclick = () => {
            renderSearchResults(getInputValue('tenantSearchInput'));
        };
    }

    if (addButton) {
        addButton.onclick = () => {
            currentTenantMode = 'add';
            renderAddTenantView();
        };
    }
}

/* ================================================================
   TENANT DETAIL VIEW
================================================================ */

function renderTenantDetail(tenant) {
    selectedTenant = tenant;

    const requestLink = buildTenantRequestLink(tenant);
    const isActive = tenant.active_status === 'active';

    tenantsContainer.innerHTML = `
        <div class="tenants-page">
            <div class="tenants-card">
                <h1 class="tenants-title">
                    Unit ${escapeHtml(tenant.unit_number || '')}
                </h1>

                <p class="tenants-subtitle">
                    ${escapeHtml(tenant.tenant_name || 'Tenant')}
                </p>

                <button id="tenantDetailBackButton" class="tenants-small-button" style="width:100%; margin-bottom:14px;">
                    Back To Find Tenant / Unit
                </button>

                <div class="tenants-detail-box">
                    <div class="tenants-detail-row"><strong>Unit:</strong> ${escapeHtml(tenant.unit_number || '')}</div>
                    <div class="tenants-detail-row"><strong>Name:</strong> ${escapeHtml(tenant.tenant_name || '')}</div>
                    <div class="tenants-detail-row"><strong>Phone:</strong> ${escapeHtml(tenant.phone || '')}</div>
                    <div class="tenants-detail-row"><strong>Email:</strong> ${escapeHtml(tenant.email || '')}</div>
                    <div class="tenants-detail-row"><strong>Status:</strong> <span class="${isActive ? 'tenants-status-active' : 'tenants-status-inactive'}">${escapeHtml(tenant.active_status || 'inactive')}</span></div>
                    <div class="tenants-detail-row"><strong>Notes:</strong> ${escapeHtml(tenant.notes || '')}</div>
                </div>

                <textarea id="tenantRequestLinkBox" class="tenants-link-box" readonly>${escapeHtml(requestLink)}</textarea>

                <div class="tenants-button-row three">
                    <button id="tenantCopyLinkButton" class="tenants-small-button">
                        Copy Link
                    </button>

                    <button id="tenantOpenLinkButton" class="tenants-small-button">
                        Open
                    </button>

                    <button id="tenantTextLinkButton" class="tenants-small-button">
                        Text Link
                    </button>
                </div>

                <button id="tenantStatusButton" class="${isActive ? 'tenants-warning-button' : 'tenants-main-button'}">
                    ${isActive ? 'Deactivate Tenant' : 'Reactivate Tenant'}
                </button>

                <div id="tenantsMessage" class="tenants-message"></div>
            </div>

            <div class="tenants-footer-tag">
                tenants_grid.js | v2026_07_05_tenants_grid_one_view_search
            </div>
        </div>
    `;

    attachTenantDetailHandlers();
}

function attachTenantDetailHandlers() {
    const backButton = document.getElementById('tenantDetailBackButton');
    const copyLinkButton = document.getElementById('tenantCopyLinkButton');
    const openLinkButton = document.getElementById('tenantOpenLinkButton');
    const textLinkButton = document.getElementById('tenantTextLinkButton');
    const statusButton = document.getElementById('tenantStatusButton');

    if (backButton) {
        backButton.onclick = async () => {
            renderFindTenantView();
            await loadTenantsForSearch();
        };
    }

    if (copyLinkButton) {
        copyLinkButton.onclick = async () => {
            await copyTenantRequestLink();
        };
    }

    if (openLinkButton) {
        openLinkButton.onclick = () => {
            openTenantRequestLink();
        };
    }

    if (textLinkButton) {
        textLinkButton.onclick = () => {
            textTenantRequestLink();
        };
    }

    if (statusButton) {
        statusButton.onclick = async () => {
            await handleTenantStatusToggle();
        };
    }
}

/* ================================================================
   ADD TENANT
================================================================ */

async function handleAddTenant() {
    clearTenantsMessage();

    const unitNumber = getInputValue('tenantUnitInput');
    const tenantName = getInputValue('tenantNameInput');
    const phone = getInputValue('tenantPhoneInput');
    const email = getInputValue('tenantEmailInput');
    const notes = getInputValue('tenantNotesInput');

    if (!unitNumber) {
        showTenantsMessage('Enter unit number.', 'error');
        return;
    }

    if (!tenantName) {
        showTenantsMessage('Enter tenant name.', 'error');
        return;
    }

    const payload = {
        facility_id: currentFacilityId,
        tenant_name: tenantName,
        unit_number: unitNumber,
        phone: phone,
        email: email,
        active_status: 'active',
        notes: notes,
        created_by_manager_id: currentManager?.id || null,
        assigned_manager_id: currentManager?.id || null
    };

    setAddButtonDisabled(true);

    const { error } = await createTenant(payload);

    setAddButtonDisabled(false);

    if (error) {
        showTenantsMessage(error.message || 'Tenant could not be added.', 'error');
        return;
    }

    clearTenantForm();

    showTenantsMessage('Tenant added.', 'success');
}

/* ================================================================
   LOAD TENANTS FOR SEARCH
================================================================ */

async function loadTenantsForSearch() {
    const list = document.getElementById('tenantsList');

    if (!list) return;

    const { data, error } = await fetchTenantsByFacilityId(currentFacilityId);

    if (error) {
        list.innerHTML = `
            <div class="tenants-error-box">
                Could not load tenants. Check tenants table, columns, or RLS.
            </div>
        `;
        return;
    }

    tenantsCache = sortTenantsByUnitNumber(Array.isArray(data) ? data : []);

    list.innerHTML = `
        <div class="tenants-empty">
            Type a unit number to search.
        </div>
    `;
}

/* ================================================================
   SEARCH RESULTS
================================================================ */

function renderSearchResults(searchValue) {
    const list = document.getElementById('tenantsList');

    if (!list) return;

    const query = String(searchValue || '').trim().toLowerCase();

    if (!query) {
        list.innerHTML = `
            <div class="tenants-empty">
                Type a unit number to search.
            </div>
        `;
        return;
    }

    const matches = tenantsCache.filter((tenant) => {
        const unitNumber = String(tenant.unit_number || '').toLowerCase();
        const tenantName = String(tenant.tenant_name || '').toLowerCase();

        return (
            unitNumber.includes(query) ||
            tenantName.includes(query)
        );
    });

    if (!matches.length) {
        list.innerHTML = `
            <div class="tenants-empty">
                No tenant found for ${escapeHtml(searchValue)}.
            </div>
        `;
        return;
    }

    list.innerHTML = matches.map((tenant) => {
        return `
            <button class="tenants-unit-button" data-open-tenant="${escapeHtml(tenant.id)}">
                <div class="tenants-unit-number">
                    Unit ${escapeHtml(tenant.unit_number || '')}
                </div>
                <div class="tenants-unit-name">
                    ${escapeHtml(tenant.tenant_name || '')}
                </div>
            </button>
        `;
    }).join('');

    attachTenantButtonHandlers();
}

function attachTenantButtonHandlers() {
    document.querySelectorAll('[data-open-tenant]').forEach((button) => {
        button.onclick = () => {
            const tenantId = button.getAttribute('data-open-tenant');
            const tenant = findTenantById(tenantId);

            if (!tenant) {
                showTenantsMessage('Tenant not found.', 'error');
                return;
            }

            renderTenantDetail(tenant);
        };
    });
}

/* ================================================================
   TENANT DETAIL ACTIONS
================================================================ */

async function copyTenantRequestLink() {
    if (!selectedTenant) return;

    const link = buildTenantRequestLink(selectedTenant);

    try {
        await navigator.clipboard.writeText(link);
        showTenantsMessage('Link copied.', 'success');
    } catch (error) {
        const box = document.getElementById('tenantRequestLinkBox');

        if (box) {
            box.focus();
            box.select();
        }

        showTenantsMessage('Copy blocked. Select and copy the link manually.', 'error');
    }
}

function openTenantRequestLink() {
    if (!selectedTenant) return;

    window.open(buildTenantRequestLink(selectedTenant), '_blank');
}

function textTenantRequestLink() {
    if (!selectedTenant) return;

    const phone = normalizePhoneForSms(selectedTenant.phone || '');
    const link = buildTenantRequestLink(selectedTenant);

    if (!phone) {
        showTenantsMessage('Tenant phone number is missing.', 'error');
        return;
    }

    const message = `Use this link to send a maintenance request: ${link}`;
    const smsUrl = `sms:${encodeURIComponent(phone)}?&body=${encodeURIComponent(message)}`;

    window.location.href = smsUrl;
}

async function handleTenantStatusToggle() {
    if (!selectedTenant) {
        showTenantsMessage('Tenant not found.', 'error');
        return;
    }

    const nextStatus = selectedTenant.active_status === 'active' ? 'inactive' : 'active';

    const { data, error } = await updateTenantStatus({
        tenantId: selectedTenant.id,
        activeStatus: nextStatus
    });

    if (error) {
        showTenantsMessage(error.message || 'Tenant status could not be updated.', 'error');
        return;
    }

    selectedTenant = data || {
        ...selectedTenant,
        active_status: nextStatus
    };

    showTenantsMessage(`Tenant marked ${nextStatus}.`, 'success');

    renderTenantDetail(selectedTenant);
}

/* ================================================================
   NAVIGATION
================================================================ */

function goToView(viewName) {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo(viewName);
        return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('view', viewName);
    window.location.href = url.toString();
}

/* ================================================================
   HELPERS
================================================================ */

function resolveTenantsContainer(containerOrContext) {
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

function getFacilityIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('facility_id') || '';
}

function getTenantModeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tenant_mode') || '';
}

function getFacilityTitle() {
    if (!currentFacility) {
        return `Facility ID: ${currentFacilityId}`;
    }

    return [
        currentFacility.facility_name || 'Facility',
        currentFacility.street_address || ''
    ].filter(Boolean).join(' - ');
}

function findTenantById(tenantId) {
    return tenantsCache.find((tenant) => String(tenant.id) === String(tenantId));
}

function sortTenantsByUnitNumber(tenants) {
    return [...tenants].sort((a, b) => {
        return naturalUnitCompare(a.unit_number, b.unit_number);
    });
}

function naturalUnitCompare(a, b) {
    const left = String(a || '').trim();
    const right = String(b || '').trim();

    return left.localeCompare(right, undefined, {
        numeric: true,
        sensitivity: 'base'
    });
}

function buildTenantRequestLink(tenant) {
    const requestCode = tenant?.request_code || tenant?.tenant_request_code || '';

    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    url.searchParams.delete('facility_id');
    url.searchParams.delete('tenant_mode');
    url.searchParams.delete('tenant_code');
    url.searchParams.delete('request_code');
    url.searchParams.set('tenant', requestCode);

    return url.toString();
}

function normalizePhoneForSms(phone) {
    return String(phone || '')
        .replace(/[^\d+]/g, '')
        .trim();
}

function getInputValue(id) {
    const input = document.getElementById(id);
    return input ? input.value.trim() : '';
}

function clearTenantForm() {
    setInputValue('tenantUnitInput', '');
    setInputValue('tenantNameInput', '');
    setInputValue('tenantPhoneInput', '');
    setInputValue('tenantEmailInput', '');
    setInputValue('tenantNotesInput', '');
}

function setInputValue(id, value) {
    const input = document.getElementById(id);
    if (!input) return;

    input.value = value;
}

function showTenantsMessage(message, type = 'info') {
    const messageBox = document.getElementById('tenantsMessage');
    if (!messageBox) return;

    messageBox.textContent = message || '';
    messageBox.className = `tenants-message ${type}`;
}

function clearTenantsMessage() {
    const messageBox = document.getElementById('tenantsMessage');
    if (!messageBox) return;

    messageBox.textContent = '';
    messageBox.className = 'tenants-message';
}

function setAddButtonDisabled(isDisabled) {
    const button = document.getElementById('tenantAddButton');
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
   ROUTER COMPATIBILITY EXPORTS
================================================================ */

export default async function tenantsDefaultExport(containerOrContext = {}) {
    await renderTenantsGrid(containerOrContext);
}
