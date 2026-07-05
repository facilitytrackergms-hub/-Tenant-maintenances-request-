/* ================================================================
   TENANT MAINTENANCE REQUEST APP
   PURPOSE: Facilitys Screen - Facility Buttons and Dashboard Navigation
   LOCATION: /facilitys/facilitys_grid.js
   VERSION: v2026_07_05_facility_buttons_dashboard_nav
   UPDATED: 2026-07-05
================================================================ */

import {
    fetchFacilitys,
    createFacility,
    updateFacilityStatus
} from './facilitys_data.js';

import {
    getCurrentSession,
    fetchCurrentManagerProfile
} from '../management/management_auth.js';

import { injectFacilitysStyles } from './facilitys_styles.js';

/* ================================================================
   STATE
================================================================ */

let facilitysContainer = null;
let facilitysCache = [];
let currentManager = null;

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

    renderFacilitysHome();

    await loadFacilitys();
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
                facilitys_grid.js | v2026_07_05_facility_buttons_dashboard_nav
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
                facilitys_grid.js | v2026_07_05_facility_buttons_dashboard_nav
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
   FACILITYS HOME
================================================================ */

function renderFacilitysHome() {
    facilitysContainer.innerHTML = `
        <div class="facilitys-page">
            <div class="facilitys-card">
                <h1 class="facilitys-title">Facilitys</h1>
                <p class="facilitys-subtitle">
                    Logged in as ${escapeHtml(currentManager?.full_name || 'Manager')}
                </p>

                <button id="facilitysBackButton" class="facilitys-small-button" style="width:100%; margin-bottom:14px;">
                    Back To Management
                </button>

                <div class="facilitys-section-title">Add Facility</div>

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

            <div class="facilitys-card">
                <div class="facilitys-section-title">Facility List</div>

                <div id="facilitysList" class="facilitys-list">
                    Loading facilitys...
                </div>
            </div>

            <div class="facilitys-footer-tag">
                facilitys_grid.js | v2026_07_05_facility_buttons_dashboard_nav
            </div>
        </div>
    `;

    attachFacilitysHandlers();
}

/* ================================================================
   HANDLERS
================================================================ */

function attachFacilitysHandlers() {
    const backButton = document.getElementById('facilitysBackButton');
    const addButton = document.getElementById('facilityAddButton');

    if (backButton) {
        backButton.onclick = () => {
            goToManagement();
        };
    }

    if (addButton) {
        addButton.onclick = async () => {
            await handleAddFacility();
        };
    }
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

    setAddButtonDisabled(true);

    const { error } = await createFacility(payload);

    setAddButtonDisabled(false);

    if (error) {
        showFacilitysMessage(error.message || 'Facility could not be added.', 'error');
        return;
    }

    clearFacilityForm();

    showFacilitysMessage('Facility added.', 'success');

    await loadFacilitys();
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

    renderFacilitysList();
}

/* ================================================================
   RENDER FACILITYS LIST
================================================================ */

function renderFacilitysList() {
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

    list.innerHTML = facilitysCache.map((facility) => {
        const isActive = facility.active_status === 'active';

        return `
            <div class="facilitys-item-card facilitys-open-card" data-open-facility="${escapeHtml(facility.id)}">
                <div class="facilitys-item-header">
                    <div>
                        <div class="facilitys-item-name">
                            ${escapeHtml(facility.facility_name || 'Facility')}
                        </div>

                        <div class="facilitys-item-address">
                            ${escapeHtml(facility.street_address || '')}<br>
                            ${escapeHtml(buildCityStateZip(facility))}
                        </div>
                    </div>

                    <div class="${isActive ? 'facilitys-status-active' : 'facilitys-status-inactive'}">
                        ${escapeHtml(facility.active_status || 'inactive')}
                    </div>
                </div>

                <div class="facilitys-button-row">
                    <button class="${isActive ? 'facilitys-warning-button' : 'facilitys-small-button'}" data-toggle-facility="${escapeHtml(facility.id)}">
                        ${isActive ? 'Deactivate Facility' : 'Reactivate Facility'}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    attachFacilityCardHandlers();
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

    document.querySelectorAll('[data-toggle-facility]').forEach((button) => {
        button.onclick = async (event) => {
            event.stopPropagation();

            const facilityId = button.getAttribute('data-toggle-facility');
            await toggleFacilityActiveStatus(facilityId);
        };
    });
}

function openFacilityDashboard(facilityId) {
    const facility = findFacilityById(facilityId);

    if (!facility) {
        showFacilitysMessage('Facility not found.', 'error');
        return;
    }

    if (facility.active_status !== 'active') {
        showFacilitysMessage('This facility is inactive.', 'error');
        return;
    }

    const context = {
        facilityId: facility.id,
        facility: facility
    };

    if (typeof window.navigateTo === 'function') {
        window.navigateTo('manager_home_dashboard', context);
        return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('view', 'manager_home_dashboard');
    url.searchParams.set('facility_id', facility.id);
    window.location.href = url.toString();
}

async function toggleFacilityActiveStatus(facilityId) {
    const facility = findFacilityById(facilityId);

    if (!facility) {
        showFacilitysMessage('Facility not found.', 'error');
        return;
    }

    const nextStatus = facility.active_status === 'active' ? 'inactive' : 'active';

    const { error } = await updateFacilityStatus({
        facilityId: facility.id,
        activeStatus: nextStatus
    });

    if (error) {
        showFacilitysMessage(error.message || 'Facility status could not be updated.', 'error');
        return;
    }

    showFacilitysMessage(`Facility marked ${nextStatus}.`, 'success');

    await loadFacilitys();
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

function goToManagement() {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('management');
        return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('view', 'management');
    window.location.href = url.toString();
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

function setAddButtonDisabled(isDisabled) {
    const button = document.getElementById('facilityAddButton');
    if (!button) return;

    button.disabled = isDisabled;
    button.textContent = isDisabled ? 'Adding...' : 'Add Facility';
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
