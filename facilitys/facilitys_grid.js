/* ================================================================
   TENANT MAINTENANCE REQUEST APP
   PURPOSE: Facilitys Screen - Compact Facility List, Search, and Facility Dashboard
   LOCATION: /facilitys/facilitys_grid.js
   VERSION: v2026_07_05_facilitys_search_current
   UPDATED: 2026-07-05
================================================================ */

import {
    fetchFacilitys,
    createFacility,
    updateFacility,
    deleteFacility
} from './facilitys_data.js';

import {
    getCurrentSession,
    fetchCurrentManagerProfile
} from '../management/management_auth.js';

import { injectFacilitysStyles } from './facilitys_styles.js?v=20260705_facilitys_search_current_1';

/* ================================================================
   STATE
================================================================ */

let facilitysContainer = null;
let facilitysCache = [];
let currentManager = null;
let selectedFacility = null;

/* ================================================================
   MAIN RENDER
================================================================ */

export async function renderFacilitysGrid(containerOrContext = {}) {
    facilitysContainer = resolveFacilitysContainer(containerOrContext);

    if (!facilitysContainer) {
        console.error('Facilitys container not found.');
        return;
    }

    injectFacilitysStyles();

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

    renderFacilitysMenu();
}

/* ================================================================
   LOGIN REQUIRED
================================================================ */

function renderLoginRequired() {
    facilitysContainer.innerHTML = `
        <div class="facilitys-page">
            <div class="facilitys-card">
                <h1 class="facilitys-title">Manager Login Required</h1>
                <p class="facilitys-subtitle">
                    Log in from the management page before opening facilitys.
                </p>

                <button id="facilitysGoToManagementButton" class="facilitys-main-button">
                    Go To Management Login
                </button>
            </div>

            <div class="facilitys-footer-tag">
                facilitys_grid.js | v2026_07_05_facilitys_search_current
            </div>
        </div>
    `;

    const button = document.getElementById('facilitysGoToManagementButton');

    if (button) {
        button.onclick = () => {
            goToManagement();
        };
    }
}

/* ================================================================
   ACCESS DENIED
================================================================ */

function renderAccessDenied() {
    facilitysContainer.innerHTML = `
        <div class="facilitys-page">
            <div class="facilitys-card">
                <h1 class="facilitys-title">Access Denied</h1>
                <p class="facilitys-subtitle">
                    This login is not connected to an active manager profile.
                </p>

                <button id="facilitysBackToManagementButton" class="facilitys-main-button">
                    Back To Management
                </button>
            </div>

            <div class="facilitys-footer-tag">
                facilitys_grid.js | v2026_07_05_facilitys_search_current
            </div>
        </div>
    `;

    const button = document.getElementById('facilitysBackToManagementButton');

    if (button) {
        button.onclick = () => {
            goToManagement();
        };
    }
}

/* ================================================================
   FACILITYS MENU
================================================================ */

function renderFacilitysMenu() {
    selectedFacility = null;

    facilitysContainer.innerHTML = `
        <div class="facilitys-page">
            <div class="facilitys-card">
                <h1 class="facilitys-title">Facilitys</h1>
                <p class="facilitys-subtitle">
                    Logged in as ${escapeHtml(currentManager?.full_name || 'Manager')}
                </p>

                <button id="facilitysBackButton" class="facilitys-small-button" style="width:100%; margin-bottom:14px;">
                    Back To Manager Dashboard
                </button>

                <button id="facilitysAddNewButton" class="facilitys-main-button" style="margin-bottom:14px;">
                    Add New Facility
                </button>

                <button id="facilitysCurrentButton" class="facilitys-main-button">
                    Current Facilitys
                </button>

                <div id="facilitysMessage" class="facilitys-message"></div>
            </div>

            <div class="facilitys-footer-tag">
                facilitys_grid.js | v2026_07_05_facilitys_search_current
            </div>
        </div>
    `;

    attachFacilitysMenuHandlers();
}

function attachFacilitysMenuHandlers() {
    const backButton = document.getElementById('facilitysBackButton');
    const addNewButton = document.getElementById('facilitysAddNewButton');
    const currentButton = document.getElementById('facilitysCurrentButton');

    if (backButton) {
        backButton.onclick = () => {
            goToManagerDashboard();
        };
    }

    if (addNewButton) {
        addNewButton.onclick = () => {
            renderAddFacilityView();
        };
    }

    if (currentButton) {
        currentButton.onclick = async () => {
            renderCurrentFacilitysView();
            await loadFacilitys();
        };
    }
}

/* ================================================================
   ADD FACILITY VIEW
================================================================ */

function renderAddFacilityView() {
    facilitysContainer.innerHTML = `
        <div class="facilitys-page">
            <div class="facilitys-card">
                <h1 class="facilitys-title">Add Facility</h1>
                <p class="facilitys-subtitle">
                    Add one facility at a time.
                </p>

                <button id="facilitysBackToMenuButton" class="facilitys-small-button" style="width:100%; margin-bottom:14px;">
                    Back To Facilitys
                </button>

                <input id="facilityNameInput" class="facilitys-input" placeholder="Facility name">
                <input id="facilityStreetAddressInput" class="facilitys-input" placeholder="Street address">
                <input id="facilityCityInput" class="facilitys-input" placeholder="City">
                <input id="facilityStateInput" class="facilitys-input" placeholder="State">
                <input id="facilityZipInput" class="facilitys-input" placeholder="Zip">
                <input id="facilityPhoneInput" class="facilitys-input" placeholder="Phone">
                <textarea id="facilityNotesInput" class="facilitys-textarea" placeholder="Notes"></textarea>

                <button id="facilityAddButton" class="facilitys-main-button">
                    Add Facility
                </button>

                <div id="facilitysMessage" class="facilitys-message"></div>
            </div>

            <div class="facilitys-footer-tag">
                facilitys_grid.js | v2026_07_05_facilitys_search_current
            </div>
        </div>
    `;

    attachAddFacilityHandlers();
}

function attachAddFacilityHandlers() {
    const backButton = document.getElementById('facilitysBackToMenuButton');
    const addButton = document.getElementById('facilityAddButton');

    if (backButton) {
        backButton.onclick = () => {
            renderFacilitysMenu();
        };
    }

    if (addButton) {
        addButton.onclick = async () => {
            await handleAddFacility();
        };
    }
}

/* ================================================================
   CURRENT FACILITYS VIEW
================================================================ */

function renderCurrentFacilitysView() {
    facilitysContainer.innerHTML = `
        <div class="facilitys-page">
            <div class="facilitys-card">
                <h1 class="facilitys-title">Current Facilitys</h1>
                <p class="facilitys-subtitle">
                    Search or click a facility to open it.
                </p>

                <button id="facilitysBackToMenuButton" class="facilitys-small-button" style="width:100%; margin-bottom:12px;">
                    Back To Facilitys
                </button>

                <input id="facilitySearchInput" class="facilitys-input" placeholder="Search facility name or address">

                <div id="facilitysList" class="facilitys-list" style="gap:7px;">
                    Loading facilitys...
                </div>

                <div id="facilitysMessage" class="facilitys-message"></div>
            </div>

            <div class="facilitys-footer-tag">
                facilitys_grid.js | v2026_07_05_facilitys_search_current
            </div>
        </div>
    `;

    attachCurrentFacilitysHandlers();
}

function attachCurrentFacilitysHandlers() {
    const backButton = document.getElementById('facilitysBackToMenuButton');
    const searchInput = document.getElementById('facilitySearchInput');

    if (backButton) {
        backButton.onclick = () => {
            renderFacilitysMenu();
        };
    }

    if (searchInput) {
        searchInput.oninput = () => {
            renderFacilitysList(searchInput.value);
        };
    }
}

/* ================================================================
   FACILITY DASHBOARD
================================================================ */

function renderFacilityDashboard(facility) {
    selectedFacility = facility;

    facilitysContainer.innerHTML = `
        <div class="facilitys-page">
            <div class="facilitys-card">
                <h1 class="facilitys-title">
                    ${escapeHtml(facility.facility_name || 'Facility')}
                </h1>

                <p class="facilitys-subtitle">
                    ${escapeHtml(facility.street_address || '')}<br>
                    ${escapeHtml(buildCityStateZip(facility))}
                </p>

                <button id="facilityDashboardBackButton" class="facilitys-small-button" style="
                    width:100%;
                    margin-bottom:14px;
                    padding:8px;
                    font-size:12px;
                    background:#64748b;
                ">
                    Back To Current Facilitys
                </button>

                <div style="
                    display:grid;
                    grid-template-columns:1fr 1fr;
                    gap:10px;
                ">
                    <button id="facilityAddTenantButton" class="facilitys-main-button" style="padding:12px 6px;">
                        Add Tenant
                    </button>

                    <button id="facilityFindTenantButton" class="facilitys-main-button" style="padding:12px 6px;">
                        Find Unit
                    </button>

                    <button id="facilityEditButton" class="facilitys-main-button" style="padding:12px 6px;">
                        Edit Facility
                    </button>

                    <button id="facilityDeleteButton" class="facilitys-warning-button" style="width:100%; padding:12px 6px;">
                        Delete Facility
                    </button>
                </div>

                <div id="facilitysMessage" class="facilitys-message"></div>
            </div>

            <div class="facilitys-footer-tag">
                facilitys_grid.js | v2026_07_05_facilitys_search_current
            </div>
        </div>
    `;

    attachFacilityDashboardHandlers();
}

function attachFacilityDashboardHandlers() {
    const backButton = document.getElementById('facilityDashboardBackButton');
    const addTenantButton = document.getElementById('facilityAddTenantButton');
    const findTenantButton = document.getElementById('facilityFindTenantButton');
    const editButton = document.getElementById('facilityEditButton');
    const deleteButton = document.getElementById('facilityDeleteButton');

    if (backButton) {
        backButton.onclick = async () => {
            renderCurrentFacilitysView();
            await loadFacilitys();
        };
    }

    if (addTenantButton) {
        addTenantButton.onclick = () => {
            openTenantsViewForFacility('add');
        };
    }

    if (findTenantButton) {
        findTenantButton.onclick = () => {
            openTenantsViewForFacility('find');
        };
    }

    if (editButton) {
        editButton.onclick = () => {
            renderEditFacilityView();
        };
    }

    if (deleteButton) {
        deleteButton.onclick = () => {
            renderDeleteFacilityWarningView();
        };
    }
}

/* ================================================================
   EDIT FACILITY VIEW
================================================================ */

function renderEditFacilityView() {
    if (!selectedFacility) {
        renderFacilitysMenu();
        return;
    }

    facilitysContainer.innerHTML = `
        <div class="facilitys-page">
            <div class="facilitys-card">
                <h1 class="facilitys-title">Edit Facility</h1>
                <p class="facilitys-subtitle">
                    ${escapeHtml(selectedFacility.facility_name || 'Facility')}
                </p>

                <button id="facilityEditBackButton" class="facilitys-small-button" style="width:100%; margin-bottom:14px;">
                    Back To Facility
                </button>

                <input id="facilityEditNameInput" class="facilitys-input" placeholder="Facility name" value="${escapeHtml(selectedFacility.facility_name || '')}">
                <input id="facilityEditStreetAddressInput" class="facilitys-input" placeholder="Street address" value="${escapeHtml(selectedFacility.street_address || '')}">
                <input id="facilityEditCityInput" class="facilitys-input" placeholder="City" value="${escapeHtml(selectedFacility.city || '')}">
                <input id="facilityEditStateInput" class="facilitys-input" placeholder="State" value="${escapeHtml(selectedFacility.state || '')}">
                <input id="facilityEditZipInput" class="facilitys-input" placeholder="Zip" value="${escapeHtml(selectedFacility.zip || '')}">
                <input id="facilityEditPhoneInput" class="facilitys-input" placeholder="Phone" value="${escapeHtml(selectedFacility.phone || '')}">
                <textarea id="facilityEditNotesInput" class="facilitys-textarea" placeholder="Notes">${escapeHtml(selectedFacility.notes || '')}</textarea>

                <button id="facilitySaveEditButton" class="facilitys-main-button">
                    Save Facility
                </button>

                <div id="facilitysMessage" class="facilitys-message"></div>
            </div>

            <div class="facilitys-footer-tag">
                facilitys_grid.js | v2026_07_05_facilitys_search_current
            </div>
        </div>
    `;

    attachEditFacilityHandlers();
}

function attachEditFacilityHandlers() {
    const backButton = document.getElementById('facilityEditBackButton');
    const saveButton = document.getElementById('facilitySaveEditButton');

    if (backButton) {
        backButton.onclick = () => {
            renderFacilityDashboard(selectedFacility);
        };
    }

    if (saveButton) {
        saveButton.onclick = async () => {
            await handleUpdateFacility();
        };
    }
}

/* ================================================================
   DELETE FACILITY WARNING VIEW
================================================================ */

function renderDeleteFacilityWarningView() {
    if (!selectedFacility) {
        renderFacilitysMenu();
        return;
    }

    facilitysContainer.innerHTML = `
        <div class="facilitys-page">
            <div class="facilitys-card">
                <h1 class="facilitys-title">Delete Facility</h1>
                <p class="facilitys-subtitle">
                    You are about to delete this facility.
                </p>

                <div class="facilitys-item-card" style="margin-bottom:14px;">
                    <div class="facilitys-item-name">
                        ${escapeHtml(selectedFacility.facility_name || 'Facility')}
                    </div>
                    <div class="facilitys-item-address">
                        ${escapeHtml(selectedFacility.street_address || '')}<br>
                        ${escapeHtml(buildCityStateZip(selectedFacility))}
                    </div>
                </div>

                <button id="facilityDeleteBackButton" class="facilitys-small-button" style="width:100%; margin-bottom:14px;">
                    Cancel - Back To Facility
                </button>

                <button id="facilityConfirmDeleteButton" class="facilitys-warning-button" style="width:100%; padding:12px;">
                    I Understand - Delete Facility
                </button>

                <div id="facilitysMessage" class="facilitys-message"></div>
            </div>

            <div class="facilitys-footer-tag">
                facilitys_grid.js | v2026_07_05_facilitys_search_current
            </div>
        </div>
    `;

    attachDeleteFacilityHandlers();
}

function attachDeleteFacilityHandlers() {
    const backButton = document.getElementById('facilityDeleteBackButton');
    const confirmButton = document.getElementById('facilityConfirmDeleteButton');

    if (backButton) {
        backButton.onclick = () => {
            renderFacilityDashboard(selectedFacility);
        };
    }

    if (confirmButton) {
        confirmButton.onclick = async () => {
            const confirmed = window.confirm(
                'You are about to delete this facility. This cannot be undone. Continue?'
            );

            if (!confirmed) return;

            await handleDeleteFacility();
        };
    }
}

/* ================================================================
   TENANT NAVIGATION
================================================================ */

function openTenantsViewForFacility(mode = 'find') {
    if (!selectedFacility) {
        showFacilitysMessage('Facility not found.', 'error');
        return;
    }

    const context = {
        facilityId: selectedFacility.id,
        facility: selectedFacility,
        tenantMode: mode
    };

    if (typeof window.navigateTo === 'function') {
        window.navigateTo('tenants', context);
        return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('view', 'tenants');
    url.searchParams.set('facility_id', selectedFacility.id);
    url.searchParams.set('tenant_mode', mode);
    window.location.href = url.toString();
}

/* ================================================================
   ADD FACILITY
================================================================ */

async function handleAddFacility() {
    clearFacilitysMessage();

    const facilityName = getInputValue('facilityNameInput');
    const streetAddress = getInputValue('facilityStreetAddressInput');
    const city = getInputValue('facilityCityInput');
    const state = getInputValue('facilityStateInput');
    const zip = getInputValue('facilityZipInput');
    const phone = getInputValue('facilityPhoneInput');
    const notes = getInputValue('facilityNotesInput');

    if (!facilityName) {
        showFacilitysMessage('Enter facility name.', 'error');
        return;
    }

    if (!streetAddress) {
        showFacilitysMessage('Enter street address.', 'error');
        return;
    }

    const payload = {
        facility_name: facilityName,
        street_address: streetAddress,
        city: city,
        state: state,
        zip: zip,
        phone: phone,
        active_status: 'active',
        notes: notes,
        created_by_manager_id: currentManager?.id || null,
        assigned_manager_id: currentManager?.id || null,
        updated_at: new Date().toISOString()
    };

    setButtonDisabled('facilityAddButton', true, 'Adding...');

    const { error } = await createFacility(payload);

    setButtonDisabled('facilityAddButton', false, 'Add Facility');

    if (error) {
        showFacilitysMessage(error.message || 'Facility could not be added.', 'error');
        return;
    }

    clearFacilityForm();

    showFacilitysMessage('Facility added.', 'success');
}

/* ================================================================
   UPDATE FACILITY
================================================================ */

async function handleUpdateFacility() {
    clearFacilitysMessage();

    if (!selectedFacility) {
        showFacilitysMessage('Facility not found.', 'error');
        return;
    }

    const facilityName = getInputValue('facilityEditNameInput');
    const streetAddress = getInputValue('facilityEditStreetAddressInput');
    const city = getInputValue('facilityEditCityInput');
    const state = getInputValue('facilityEditStateInput');
    const zip = getInputValue('facilityEditZipInput');
    const phone = getInputValue('facilityEditPhoneInput');
    const notes = getInputValue('facilityEditNotesInput');

    if (!facilityName) {
        showFacilitysMessage('Enter facility name.', 'error');
        return;
    }

    if (!streetAddress) {
        showFacilitysMessage('Enter street address.', 'error');
        return;
    }

    const payload = {
        facility_name: facilityName,
        street_address: streetAddress,
        city: city,
        state: state,
        zip: zip,
        phone: phone,
        notes: notes
    };

    setButtonDisabled('facilitySaveEditButton', true, 'Saving...');

    const { data, error } = await updateFacility({
        facilityId: selectedFacility.id,
        payload
    });

    setButtonDisabled('facilitySaveEditButton', false, 'Save Facility');

    if (error) {
        showFacilitysMessage(error.message || 'Facility could not be updated.', 'error');
        return;
    }

    selectedFacility = data || {
        ...selectedFacility,
        ...payload
    };

    renderFacilityDashboard(selectedFacility);
}

/* ================================================================
   DELETE FACILITY
================================================================ */

async function handleDeleteFacility() {
    clearFacilitysMessage();

    if (!selectedFacility) {
        showFacilitysMessage('Facility not found.', 'error');
        return;
    }

    const facilityId = selectedFacility.id;

    setButtonDisabled('facilityConfirmDeleteButton', true, 'Deleting...');

    const { error } = await deleteFacility(facilityId);

    if (error) {
        setButtonDisabled('facilityConfirmDeleteButton', false, 'I Understand - Delete Facility');
        showFacilitysMessage(error.message || 'Facility could not be deleted.', 'error');
        return;
    }

    selectedFacility = null;

    renderCurrentFacilitysView();
    await loadFacilitys();

    showFacilitysMessage('Facility deleted.', 'success');
}

/* ================================================================
   LOAD FACILITYS
================================================================ */

async function loadFacilitys() {
    const list = document.getElementById('facilitysList');

    if (!list) return;

    list.innerHTML = `
        <div class="facilitys-loading">
            Loading facilitys...
        </div>
    `;

    const { data, error } = await fetchFacilitys();

    if (error) {
        list.innerHTML = `
            <div class="facilitys-error-box">
                Could not load facilitys. Check Supabase RLS or console error.
            </div>
        `;
        return;
    }

    facilitysCache = Array.isArray(data) ? data : [];

    renderFacilitysList(getInputValue('facilitySearchInput'));
}

/* ================================================================
   RENDER FACILITYS LIST
================================================================ */

function renderFacilitysList(searchValue = '') {
    const list = document.getElementById('facilitysList');

    if (!list) return;

    if (!facilitysCache.length) {
        list.innerHTML = `
            <div class="facilitys-empty">
                No facilitys yet.
            </div>
        `;
        return;
    }

    const filteredFacilitys = filterFacilitys(searchValue);

    if (!filteredFacilitys.length) {
        list.innerHTML = `
            <div class="facilitys-empty">
                No facility found.
            </div>
        `;
        return;
    }

    list.innerHTML = filteredFacilitys.map((facility) => {
        return `
            <button
                data-open-facility="${escapeHtml(facility.id)}"
                style="
                    width:100%;
                    text-align:left;
                    cursor:pointer;
                    border:1px solid #93c5fd;
                    background:#eff6ff;
                    border-radius:10px;
                    padding:8px 10px;
                    box-sizing:border-box;
                    margin:0;
                "
            >
                <div style="
                    font-size:15px;
                    font-weight:800;
                    color:#0f172a;
                    line-height:1.2;
                ">
                    ${escapeHtml(facility.facility_name || 'Facility')}
                </div>

                <div style="
                    font-size:12px;
                    color:#334155;
                    line-height:1.25;
                    margin-top:2px;
                ">
                    ${escapeHtml(facility.street_address || '')}
                    ${buildCityStateZip(facility) ? ' - ' + escapeHtml(buildCityStateZip(facility)) : ''}
                </div>
            </button>
        `;
    }).join('');

    attachFacilityCardHandlers();
}

function filterFacilitys(searchValue) {
    const query = String(searchValue || '').trim().toLowerCase();

    if (!query) {
        return facilitysCache;
    }

    return facilitysCache.filter((facility) => {
        const searchableText = [
            facility?.facility_name || '',
            facility?.street_address || '',
            facility?.city || '',
            facility?.state || '',
            facility?.zip || '',
            facility?.phone || ''
        ].join(' ').toLowerCase();

        return searchableText.includes(query);
    });
}

/* ================================================================
   FACILITY CARD HANDLERS
================================================================ */

function attachFacilityCardHandlers() {
    document.querySelectorAll('[data-open-facility]').forEach((card) => {
        card.onclick = () => {
            const facilityId = card.getAttribute('data-open-facility');
            openFacilityDashboard(facilityId);
        };
    });
}

function openFacilityDashboard(facilityId) {
    const facility = findFacilityById(facilityId);

    if (!facility) {
        showFacilitysMessage('Facility not found.', 'error');
        return;
    }

    renderFacilityDashboard(facility);
}

/* ================================================================
   NAVIGATION
================================================================ */

function goToManagement() {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('management');
        return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('view', 'management');
    window.location.href = url.toString();
}

function goToManagerDashboard() {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('manager_home_dashboard');
        return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('view', 'manager_home_dashboard');
    window.location.href = url.toString();
}

/* ================================================================
   HELPERS
================================================================ */

function resolveFacilitysContainer(containerOrContext) {
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

function findFacilityById(facilityId) {
    return facilitysCache.find((facility) => String(facility.id) === String(facilityId));
}

function buildCityStateZip(facility) {
    return [
        facility?.city || '',
        facility?.state || '',
        facility?.zip || ''
    ].filter(Boolean).join(', ');
}

function getInputValue(id) {
    const input = document.getElementById(id);
    return input ? input.value.trim() : '';
}

function clearFacilityForm() {
    setInputValue('facilityNameInput', '');
    setInputValue('facilityStreetAddressInput', '');
    setInputValue('facilityCityInput', '');
    setInputValue('facilityStateInput', '');
    setInputValue('facilityZipInput', '');
    setInputValue('facilityPhoneInput', '');
    setInputValue('facilityNotesInput', '');
}

function setInputValue(id, value) {
    const input = document.getElementById(id);
    if (!input) return;

    input.value = value;
}

function showFacilitysMessage(message, type = 'info') {
    const messageBox = document.getElementById('facilitysMessage');
    if (!messageBox) return;

    messageBox.textContent = message || '';
    messageBox.className = `facilitys-message ${type}`;
}

function clearFacilitysMessage() {
    const messageBox = document.getElementById('facilitysMessage');
    if (!messageBox) return;

    messageBox.textContent = '';
    messageBox.className = 'facilitys-message';
}

function setButtonDisabled(buttonId, isDisabled, text) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    button.disabled = isDisabled;

    if (text) {
        button.textContent = text;
    }
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

export default async function facilitysDefaultExport(containerOrContext = {}) {
    await renderFacilitysGrid(containerOrContext);
}
