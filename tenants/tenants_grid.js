/* ================================================================
   TENANT MAINTENANCE REQUEST APP
   PURPOSE: Tenants Grid - Add Tenant, Auto Find Unit, Tenant Detail, Request History, Edit Tenant
   LOCATION: /tenants/tenants_grid.js
   VERSION: v2026_07_05_tenants_grid_edit_text_call
   UPDATED: 2026-07-05
================================================================ */

import {
    fetchTenantsByFacilityId,
    createTenant,
    updateTenant,
    updateTenantStatus,
    markTenantMovedOut,
    deleteTenant,
    generateNewTenantRequestLink,
    fetchTenantMaintenanceRequestsByTenantId,
    updateTenantMaintenanceRequest
} from './tenants_data.js';from './tenants_data.js';


import {
    getCurrentSession,
    fetchCurrentManagerProfile
} from '../management/management_auth.js';

import { injectTenantsStyles } from './tenants_styles.js?v=20260705_tenants_edit_text_call_1';

/* ================================================================
   STATE
================================================================ */

let tenantsContainer = null;
let tenantsCache = [];
let tenantRequestsCache = [];
let currentManager = null;
let currentFacility = null;
let currentFacilityId = null;
let selectedTenant = null;
let selectedTenantRequest = null;
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
                tenants_grid.js | v2026_07_05_tenants_grid_edit_text_call
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
                tenants_grid.js | v2026_07_05_tenants_grid_edit_text_call
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
                tenants_grid.js | v2026_07_05_tenants_grid_edit_text_call
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
    selectedTenantRequest = null;

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
                tenants_grid.js | v2026_07_05_tenants_grid_edit_text_call
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
    selectedTenantRequest = null;

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

                <button id="tenantGoToAddButton" class="tenants-small-button" style="width:100%; margin-top:4px;">
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
                tenants_grid.js | v2026_07_05_tenants_grid_edit_text_call
            </div>
        </div>
    `;

    attachFindTenantHandlers();
}

function attachFindTenantHandlers() {
    const backButton = document.getElementById('tenantsBackButton');
    const searchInput = document.getElementById('tenantSearchInput');
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
    selectedTenantRequest = null;

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

                <button id="tenantGenerateNewLinkButton" class="tenants-main-button" style="width:100%; margin-top:12px; margin-bottom:12px;">
                    Generate New Link
                </button>

                <div class="tenants-button-row three">
                    <button id="tenantCopyLinkButton" class="tenants-small-button">
                        Copy Link
                    </button>

                    <button id="tenantRequestsButton" class="tenants-small-button">
                        Requests
                    </button>

                    <button id="tenantTextCallButton" class="tenants-small-button">
                        Text / Call
                    </button>
                </div>

                <button id="tenantEditButton" class="tenants-main-button" style="margin-top:12px;">
                    Edit Tenant
                </button>

                <button id="tenantMoveOutButton" class="tenants-warning-button" style="width:100%; margin-top:12px;">
                    Move Out / Empty Unit
                </button>

                <button id="tenantDeleteButton" class="tenants-warning-button" style="width:100%; margin-top:12px;">
                    Delete Tenant
                </button>

                <button id="tenantStatusButton" class="${isActive ? 'tenants-warning-button' : 'tenants-main-button'}" style="width:100%; margin-top:12px;">
                    ${isActive ? 'Deactivate Tenant' : 'Reactivate Tenant'}
                </button>

                <div id="tenantsMessage" class="tenants-message"></div>
            </div>

            <div class="tenants-footer-tag">
                tenants_grid.js | v2026_07_05_tenants_grid_generate_new_link
            </div>
        </div>
    `;

    attachTenantDetailHandlers();
}


function attachTenantDetailHandlers() {
    const backButton = document.getElementById('tenantDetailBackButton');
    const generateNewLinkButton = document.getElementById('tenantGenerateNewLinkButton');
    const copyLinkButton = document.getElementById('tenantCopyLinkButton');
    const requestsButton = document.getElementById('tenantRequestsButton');
    const textCallButton = document.getElementById('tenantTextCallButton');
    const editButton = document.getElementById('tenantEditButton');
    const moveOutButton = document.getElementById('tenantMoveOutButton');
    const deleteButton = document.getElementById('tenantDeleteButton');
    const statusButton = document.getElementById('tenantStatusButton');

    if (backButton) {
        backButton.onclick = async () => {
            renderFindTenantView();
            await loadTenantsForSearch();
        };
    }

    if (generateNewLinkButton) {
        generateNewLinkButton.onclick = async () => {
            await handleGenerateNewTenantLink();
        };
    }

    if (copyLinkButton) {
        copyLinkButton.onclick = async () => {
            await copyTenantRequestLink();
        };
    }

    if (requestsButton) {
        requestsButton.onclick = async () => {
            await renderTenantRequestsView();
        };
    }

    if (textCallButton) {
        textCallButton.onclick = () => {
            renderTenantTextCallView();
        };
    }

    if (editButton) {
        editButton.onclick = () => {
            renderEditTenantView();
        };
    }

    if (moveOutButton) {
        moveOutButton.onclick = () => {
            renderMoveOutWarningView();
        };
    }

    if (deleteButton) {
        deleteButton.onclick = () => {
            renderDeleteTenantWarningView();
        };
    }

    if (statusButton) {
        statusButton.onclick = async () => {
            await handleTenantStatusToggle();
        };
    }
}
/* ================================================================
   EDIT TENANT VIEW
================================================================ */

function renderEditTenantView() {
    if (!selectedTenant) {
        renderFindTenantView();
        return;
    }

    tenantsContainer.innerHTML = `
        <div class="tenants-page">
            <div class="tenants-card">
                <h1 class="tenants-title">Edit Tenant</h1>
                <p class="tenants-subtitle">
                    Unit ${escapeHtml(selectedTenant.unit_number || '')}
                </p>

                <button id="tenantEditBackButton" class="tenants-small-button" style="width:100%; margin-bottom:14px;">
                    Back To Unit Detail
                </button>

                <input id="tenantEditUnitInput" class="tenants-input" placeholder="Unit number" value="${escapeHtml(selectedTenant.unit_number || '')}">
                <input id="tenantEditNameInput" class="tenants-input" placeholder="Tenant name" value="${escapeHtml(selectedTenant.tenant_name || '')}">
                <input id="tenantEditPhoneInput" class="tenants-input" placeholder="Phone" value="${escapeHtml(selectedTenant.phone || '')}">
                <input id="tenantEditEmailInput" class="tenants-input" placeholder="Email" value="${escapeHtml(selectedTenant.email || '')}">
                <textarea id="tenantEditNotesInput" class="tenants-textarea" placeholder="Notes">${escapeHtml(selectedTenant.notes || '')}</textarea>

                <button id="tenantSaveEditButton" class="tenants-main-button">
                    Save Tenant
                </button>

                <div id="tenantsMessage" class="tenants-message"></div>
            </div>

            <div class="tenants-footer-tag">
                tenants_grid.js | v2026_07_05_tenants_grid_edit_text_call
            </div>
        </div>
    `;

    attachEditTenantHandlers();
}

function attachEditTenantHandlers() {
    const backButton = document.getElementById('tenantEditBackButton');
    const saveButton = document.getElementById('tenantSaveEditButton');

    if (backButton) {
        backButton.onclick = () => {
            renderTenantDetail(selectedTenant);
        };
    }

    if (saveButton) {
        saveButton.onclick = async () => {
            await handleUpdateTenant();
        };
    }
}

async function handleUpdateTenant() {
    clearTenantsMessage();

    if (!selectedTenant) {
        showTenantsMessage('Tenant not found.', 'error');
        return;
    }

    const unitNumber = getInputValue('tenantEditUnitInput');
    const tenantName = getInputValue('tenantEditNameInput');
    const phone = getInputValue('tenantEditPhoneInput');
    const email = getInputValue('tenantEditEmailInput');
    const notes = getInputValue('tenantEditNotesInput');

    if (!unitNumber) {
        showTenantsMessage('Enter unit number.', 'error');
        return;
    }

    if (!tenantName) {
        showTenantsMessage('Enter tenant name.', 'error');
        return;
    }

    setEditTenantButtonDisabled(true);

    const { data, error } = await updateTenant({
        tenantId: selectedTenant.id,
        payload: {
            unit_number: unitNumber,
            tenant_name: tenantName,
            phone,
            email,
            notes
        }
    });

    setEditTenantButtonDisabled(false);

    if (error) {
        showTenantsMessage(error.message || 'Tenant could not be updated.', 'error');
        return;
    }

    selectedTenant = data || {
        ...selectedTenant,
        unit_number: unitNumber,
        tenant_name: tenantName,
        phone,
        email,
        notes
    };

    tenantsCache = tenantsCache.map((tenant) => {
        if (String(tenant.id) === String(selectedTenant.id)) {
            return selectedTenant;
        }

        return tenant;
    });

    renderTenantDetail(selectedTenant);
    showTenantsMessage('Tenant updated.', 'success');
}
/* ================================================================
   MOVE OUT / EMPTY UNIT VIEW
================================================================ */

function renderMoveOutWarningView() {
    if (!selectedTenant) {
        renderFindTenantView();
        return;
    }

    tenantsContainer.innerHTML = `
        <div class="tenants-page">
            <div class="tenants-card">
                <h1 class="tenants-title">Move Out / Empty Unit</h1>

                <p class="tenants-subtitle">
                    This marks the tenant inactive and keeps maintenance history.
                </p>

                <div class="tenants-detail-box">
                    <div class="tenants-detail-row"><strong>Unit:</strong> ${escapeHtml(selectedTenant.unit_number || '')}</div>
                    <div class="tenants-detail-row"><strong>Name:</strong> ${escapeHtml(selectedTenant.tenant_name || '')}</div>
                    <div class="tenants-detail-row"><strong>Phone:</strong> ${escapeHtml(selectedTenant.phone || '')}</div>
                </div>

                <button id="tenantMoveOutCancelButton" class="tenants-small-button" style="width:100%; margin-bottom:14px;">
                    Cancel - Back To Unit Detail
                </button>

                <button id="tenantConfirmMoveOutButton" class="tenants-warning-button" style="width:100%;">
                    Confirm Move Out / Empty Unit
                </button>

                <div id="tenantsMessage" class="tenants-message"></div>
            </div>

            <div class="tenants-footer-tag">
                tenants_grid.js | v2026_07_05_tenants_grid_edit_text_call
            </div>
        </div>
    `;

    attachMoveOutWarningHandlers();
}

function attachMoveOutWarningHandlers() {
    const cancelButton = document.getElementById('tenantMoveOutCancelButton');
    const confirmButton = document.getElementById('tenantConfirmMoveOutButton');

    if (cancelButton) {
        cancelButton.onclick = () => {
            renderTenantDetail(selectedTenant);
        };
    }

    if (confirmButton) {
        confirmButton.onclick = async () => {
            await handleMoveOutTenant();
        };
    }
}

async function handleMoveOutTenant() {
    clearTenantsMessage();

    if (!selectedTenant) {
        showTenantsMessage('Tenant not found.', 'error');
        return;
    }

    setMoveOutButtonDisabled(true);

    const { data, error } = await markTenantMovedOut({
        tenantId: selectedTenant.id,
        currentNotes: selectedTenant.notes || ''
    });

    setMoveOutButtonDisabled(false);

    if (error) {
        showTenantsMessage(error.message || 'Tenant could not be marked moved out.', 'error');
        return;
    }

    selectedTenant = data || {
        ...selectedTenant,
        active_status: 'inactive'
    };

    tenantsCache = tenantsCache.map((tenant) => {
        if (String(tenant.id) === String(selectedTenant.id)) {
            return selectedTenant;
        }

        return tenant;
    });

    renderTenantDetail(selectedTenant);
    showTenantsMessage('Unit marked empty.', 'success');
}

/* ================================================================
   DELETE TENANT VIEW
================================================================ */

function renderDeleteTenantWarningView() {
    if (!selectedTenant) {
        renderFindTenantView();
        return;
    }

    tenantsContainer.innerHTML = `
        <div class="tenants-page">
            <div class="tenants-card">
                <h1 class="tenants-title">Delete Tenant</h1>

                <p class="tenants-subtitle">
                    Delete only test tenants or duplicate tenants.
                </p>

                <div class="tenants-detail-box">
                    <div class="tenants-detail-row"><strong>Unit:</strong> ${escapeHtml(selectedTenant.unit_number || '')}</div>
                    <div class="tenants-detail-row"><strong>Name:</strong> ${escapeHtml(selectedTenant.tenant_name || '')}</div>
                    <div class="tenants-detail-row"><strong>Phone:</strong> ${escapeHtml(selectedTenant.phone || '')}</div>
                </div>

                <button id="tenantDeleteCancelButton" class="tenants-small-button" style="width:100%; margin-bottom:14px;">
                    Cancel - Back To Unit Detail
                </button>

                <button id="tenantConfirmDeleteButton" class="tenants-warning-button" style="width:100%;">
                    I Understand - Delete Tenant
                </button>

                <div id="tenantsMessage" class="tenants-message"></div>
            </div>

            <div class="tenants-footer-tag">
                tenants_grid.js | v2026_07_05_tenants_grid_edit_text_call
            </div>
        </div>
    `;

    attachDeleteTenantWarningHandlers();
}

function attachDeleteTenantWarningHandlers() {
    const cancelButton = document.getElementById('tenantDeleteCancelButton');
    const confirmButton = document.getElementById('tenantConfirmDeleteButton');

    if (cancelButton) {
        cancelButton.onclick = () => {
            renderTenantDetail(selectedTenant);
        };
    }

    if (confirmButton) {
        confirmButton.onclick = async () => {
            await handleDeleteTenant();
        };
    }
}

async function handleDeleteTenant() {
    clearTenantsMessage();

    if (!selectedTenant) {
        showTenantsMessage('Tenant not found.', 'error');
        return;
    }

    const tenantId = selectedTenant.id;

    const confirmButton = document.getElementById('tenantConfirmDeleteButton');

    if (confirmButton) {
        confirmButton.disabled = true;
        confirmButton.textContent = 'Deleting...';
    }

    try {
        const { error } = await deleteTenant(tenantId);

        if (error) {
            showTenantsMessage(error.message || 'Tenant could not be deleted. Use Move Out / Empty Unit instead.', 'error');

            if (confirmButton) {
                confirmButton.disabled = false;
                confirmButton.textContent = 'I Understand - Delete Tenant';
            }

            return;
        }

        selectedTenant = null;
        selectedTenantRequest = null;

        renderFindTenantView();
        await loadTenantsForSearch();

        showTenantsMessage('Tenant deleted.', 'success');
    } catch (error) {
        console.error('Delete tenant button error:', error);

        showTenantsMessage('Delete failed. Check console error.', 'error');

        if (confirmButton) {
            confirmButton.disabled = false;
            confirmButton.textContent = 'I Understand - Delete Tenant';
        }
    }
}
/* ================================================================
   TENANT TEXT / CALL VIEW
================================================================ */

function renderTenantTextCallView() {
    if (!selectedTenant) {
        renderFindTenantView();
        return;
    }

    const requestLink = buildTenantRequestLink(selectedTenant);

    tenantsContainer.innerHTML = `
        <div class="tenants-page">
            <div class="tenants-card">
                <h1 class="tenants-title">Text / Call</h1>
                <p class="tenants-subtitle">
                    Unit ${escapeHtml(selectedTenant.unit_number || '')} - ${escapeHtml(selectedTenant.tenant_name || 'Tenant')}
                </p>

                <button id="tenantTextCallBackButton" class="tenants-small-button" style="width:100%; margin-bottom:14px;">
                    Back To Unit Detail
                </button>

                <div class="tenants-detail-box">
                    <div class="tenants-detail-row"><strong>Phone:</strong> ${escapeHtml(selectedTenant.phone || '')}</div>
                    <div class="tenants-detail-row"><strong>Link:</strong> ${escapeHtml(requestLink)}</div>
                </div>

                <button id="tenantSendTextButton" class="tenants-main-button">
                    Text Request Link
                </button>

                <button id="tenantCallButton" class="tenants-main-button">
                    Call Tenant
                </button>

                <div id="tenantsMessage" class="tenants-message"></div>
            </div>

            <div class="tenants-footer-tag">
                tenants_grid.js | v2026_07_05_tenants_grid_edit_text_call
            </div>
        </div>
    `;

    attachTenantTextCallHandlers();
}

function attachTenantTextCallHandlers() {
    const backButton = document.getElementById('tenantTextCallBackButton');
    const textButton = document.getElementById('tenantSendTextButton');
    const callButton = document.getElementById('tenantCallButton');

    if (backButton) {
        backButton.onclick = () => {
            renderTenantDetail(selectedTenant);
        };
    }

    if (textButton) {
        textButton.onclick = () => {
            textTenantRequestLink();
        };
    }

    if (callButton) {
        callButton.onclick = () => {
            callTenantPhone();
        };
    }
}

/* ================================================================
   TENANT REQUEST HISTORY VIEW
================================================================ */

async function renderTenantRequestsView() {
    if (!selectedTenant) {
        renderFindTenantView();
        await loadTenantsForSearch();
        return;
    }

    selectedTenantRequest = null;

    tenantsContainer.innerHTML = `
        <div class="tenants-page">
            <div class="tenants-card">
                <h1 class="tenants-title">
                    Unit ${escapeHtml(selectedTenant.unit_number || '')} Requests
                </h1>

                <p class="tenants-subtitle">
                    ${escapeHtml(selectedTenant.tenant_name || 'Tenant')}
                </p>

                <button id="tenantRequestsBackButton" class="tenants-small-button" style="width:100%; margin-bottom:14px;">
                    Back To Unit Detail
                </button>

                <div id="tenantsMessage" class="tenants-message"></div>
            </div>

            <div class="tenants-card">
                <div class="tenants-section-title">Maintenance Request History</div>

                <div id="tenantRequestsList" class="tenants-list">
                    Loading requests...
                </div>
            </div>

            <div class="tenants-footer-tag">
                tenants_grid.js | v2026_07_05_tenants_grid_edit_text_call
            </div>
        </div>
    `;

    const backButton = document.getElementById('tenantRequestsBackButton');

    if (backButton) {
        backButton.onclick = () => {
            renderTenantDetail(selectedTenant);
        };
    }

    await loadTenantRequests();
}

async function loadTenantRequests() {
    const list = document.getElementById('tenantRequestsList');

    if (!list || !selectedTenant) return;

    list.innerHTML = `
        <div class="tenants-empty">
            Loading requests...
        </div>
    `;

    const { data, error } = await fetchTenantMaintenanceRequestsByTenantId(selectedTenant.id);

    if (error) {
        list.innerHTML = `
            <div class="tenants-error-box">
                Could not load maintenance requests.
            </div>
        `;
        return;
    }

    tenantRequestsCache = Array.isArray(data) ? data : [];

    if (!tenantRequestsCache.length) {
        list.innerHTML = `
            <div class="tenants-empty">
                No maintenance requests for this unit yet.
            </div>
        `;
        return;
    }

    list.innerHTML = tenantRequestsCache.map((request) => {
        return `
            <button class="tenants-unit-button" data-open-request="${escapeHtml(request.id)}" style="text-align:left;">
                <div class="tenants-unit-number">
                    ${escapeHtml(formatRequestDate(request.created_at))}
                </div>

                <div class="tenants-unit-name" style="font-weight:800;">
                    ${escapeHtml(request.request_title || 'Maintenance request')}
                </div>

                <div style="font-size:13px; margin-top:6px; color:#0f172a;">
                    <strong>Status:</strong> ${escapeHtml(request.request_status || 'open')}
                </div>

                <div style="font-size:13px; margin-top:4px; color:#0f172a;">
                    <strong>Assigned:</strong> ${escapeHtml(request.assigned_to_text || 'Not assigned')}
                </div>

                <div style="font-size:13px; margin-top:4px; color:#0f172a;">
                    <strong>Next:</strong> ${escapeHtml(request.next_step_text || request.handled_status || 'new')}
                </div>
            </button>
        `;
    }).join('');

    attachTenantRequestCardHandlers();
}

function attachTenantRequestCardHandlers() {
    document.querySelectorAll('[data-open-request]').forEach((button) => {
        button.onclick = () => {
            const requestId = button.getAttribute('data-open-request');
            const request = findTenantRequestById(requestId);

            if (!request) {
                showTenantsMessage('Request not found.', 'error');
                return;
            }

            renderTenantRequestDashboard(request);
        };
    });
}

/* ================================================================
   TENANT REQUEST DASHBOARD
================================================================ */

function renderTenantRequestDashboard(request) {
    selectedTenantRequest = request;

    tenantsContainer.innerHTML = `
        <div class="tenants-page">
            <div class="tenants-card">
                <h1 class="tenants-title">
                    Request Dashboard
                </h1>

                <p class="tenants-subtitle">
                    Unit ${escapeHtml(request.unit_number || selectedTenant?.unit_number || '')}
                </p>

                <button id="requestDashboardBackButton" class="tenants-small-button" style="width:100%; margin-bottom:14px;">
                    Back To Requests
                </button>

                <div class="tenants-detail-box">
                    <div class="tenants-detail-row"><strong>Date:</strong> ${escapeHtml(formatRequestDate(request.created_at))}</div>
                    <div class="tenants-detail-row"><strong>Title:</strong> ${escapeHtml(request.request_title || '')}</div>
                    <div class="tenants-detail-row"><strong>Status:</strong> ${escapeHtml(request.request_status || 'open')}</div>
                    <div class="tenants-detail-row"><strong>Best Day:</strong> ${escapeHtml(request.best_day || '')}</div>
                    <div class="tenants-detail-row"><strong>Best Time:</strong> ${escapeHtml(request.best_time || '')}</div>
                    <div class="tenants-detail-row"><strong>Permission:</strong> ${escapeHtml(request.permission_to_enter || '')}</div>
                    <div class="tenants-detail-row"><strong>Entry Notes:</strong> ${escapeHtml(request.entry_instructions || '')}</div>
                    <div class="tenants-detail-row"><strong>Problem:</strong> ${escapeHtml(request.request_description || '')}</div>
                </div>

                <label class="tenants-section-title" style="display:block; margin-top:14px;">Request Status</label>
                <select id="requestStatusInput" class="tenants-input">
                    <option value="open">open</option>
                    <option value="assigned">assigned</option>
                    <option value="in_progress">in progress</option>
                    <option value="waiting">waiting</option>
                    <option value="completed">completed</option>
                </select>

                <label class="tenants-section-title" style="display:block; margin-top:10px;">Assigned To</label>
                <input id="requestAssignedToInput" class="tenants-input" placeholder="Assigned to" value="${escapeHtml(request.assigned_to_text || '')}">

                <label class="tenants-section-title" style="display:block; margin-top:10px;">Handled Status</label>
                <select id="requestHandledStatusInput" class="tenants-input">
                    <option value="new">new</option>
                    <option value="reviewed">reviewed</option>
                    <option value="scheduled">scheduled</option>
                    <option value="parts_needed">parts needed</option>
                    <option value="vendor_needed">vendor needed</option>
                    <option value="follow_up_needed">follow up needed</option>
                    <option value="done">done</option>
                </select>

                <label class="tenants-section-title" style="display:block; margin-top:10px;">Next Step</label>
                <textarea id="requestNextStepInput" class="tenants-textarea" placeholder="Next step">${escapeHtml(request.next_step_text || '')}</textarea>

                <label class="tenants-section-title" style="display:block; margin-top:10px;">Follow-Up Notes</label>
                <textarea id="requestFollowUpNotesInput" class="tenants-textarea" placeholder="Follow-up notes">${escapeHtml(request.follow_up_notes || '')}</textarea>

                <label class="tenants-section-title" style="display:block; margin-top:10px;">Manager Notes</label>
                <textarea id="requestManagerNotesInput" class="tenants-textarea" placeholder="Manager notes">${escapeHtml(request.manager_notes || '')}</textarea>

                <button id="requestSaveButton" class="tenants-main-button">
                    Save Request
                </button>

                <div id="tenantsMessage" class="tenants-message"></div>
            </div>

            <div class="tenants-footer-tag">
                tenants_grid.js | v2026_07_05_tenants_grid_edit_text_call
            </div>
        </div>
    `;

    setInputValue('requestStatusInput', request.request_status || 'open');
    setInputValue('requestHandledStatusInput', request.handled_status || 'new');

    attachTenantRequestDashboardHandlers();
}

function attachTenantRequestDashboardHandlers() {
    const backButton = document.getElementById('requestDashboardBackButton');
    const saveButton = document.getElementById('requestSaveButton');

    if (backButton) {
        backButton.onclick = async () => {
            await renderTenantRequestsView();
        };
    }

    if (saveButton) {
        saveButton.onclick = async () => {
            await handleSaveTenantRequest();
        };
    }
}

async function handleSaveTenantRequest() {
    clearTenantsMessage();

    if (!selectedTenantRequest) {
        showTenantsMessage('Request not found.', 'error');
        return;
    }

    const requestStatus = getInputValue('requestStatusInput') || 'open';
    const assignedToText = getInputValue('requestAssignedToInput');
    const handledStatus = getInputValue('requestHandledStatusInput') || 'new';
    const nextStepText = getInputValue('requestNextStepInput');
    const followUpNotes = getInputValue('requestFollowUpNotesInput');
    const managerNotes = getInputValue('requestManagerNotesInput');

    setRequestSaveButtonDisabled(true);

    const { data, error } = await updateTenantMaintenanceRequest({
        requestId: selectedTenantRequest.id,
        requestStatus,
        assignedToText,
        handledStatus,
        nextStepText,
        followUpNotes,
        managerNotes,
        managerId: currentManager?.id || null
    });

    setRequestSaveButtonDisabled(false);

    if (error) {
        showTenantsMessage(error.message || 'Request could not be saved.', 'error');
        return;
    }

    selectedTenantRequest = data || {
        ...selectedTenantRequest,
        request_status: requestStatus,
        assigned_to_text: assignedToText,
        handled_status: handledStatus,
        next_step_text: nextStepText,
        follow_up_notes: followUpNotes,
        manager_notes: managerNotes,
        updated_at: new Date().toISOString()
    };

    tenantRequestsCache = tenantRequestsCache.map((request) => {
        if (String(request.id) === String(selectedTenantRequest.id)) {
            return selectedTenantRequest;
        }

        return request;
    });

    renderTenantRequestDashboard(selectedTenantRequest);
    showTenantsMessage('Request saved.', 'success');
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

    const { data, error } = await createTenant(payload);

    setAddButtonDisabled(false);

    if (error) {
        showTenantsMessage(error.message || 'Tenant could not be added.', 'error');
        return;
    }

    let createdTenant = normalizeCreatedTenantData(data);

    const refreshedResult = await fetchTenantsByFacilityId(currentFacilityId);

    if (!refreshedResult.error) {
        tenantsCache = sortTenantsByUnitNumber(Array.isArray(refreshedResult.data) ? refreshedResult.data : []);

        if (!createdTenant) {
            createdTenant = findCreatedTenantFromCache(payload);
        }
    }

    if (createdTenant) {
        renderTenantDetail(createdTenant);
        showTenantsMessage('Tenant added.', 'success');
        return;
    }

    clearTenantForm();

    showTenantsMessage('Tenant added. Open Find Tenant / Unit to view it.', 'success');
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

async function handleGenerateNewTenantLink() {
    clearTenantsMessage();

    if (!selectedTenant) {
        showTenantsMessage('Tenant not found.', 'error');
        return;
    }

    const button = document.getElementById('tenantGenerateNewLinkButton');

    if (button) {
        button.disabled = true;
        button.textContent = 'Generating...';
    }

    const { data, error } = await generateNewTenantRequestLink(selectedTenant.id);

    if (button) {
        button.disabled = false;
        button.textContent = 'Generate New Link';
    }

    if (error) {
        showTenantsMessage(error.message || 'New link could not be generated.', 'error');
        return;
    }

    selectedTenant = data || selectedTenant;

    tenantsCache = tenantsCache.map((tenant) => {
        if (String(tenant.id) === String(selectedTenant.id)) {
            return selectedTenant;
        }

        return tenant;
    });

    renderTenantDetail(selectedTenant);
    showTenantsMessage('New link generated. Old link no longer works.', 'success');
}



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

function callTenantPhone() {
    if (!selectedTenant) return;

    const phone = normalizePhoneForSms(selectedTenant.phone || '');

    if (!phone) {
        showTenantsMessage('Tenant phone number is missing.', 'error');
        return;
    }

    window.location.href = `tel:${phone}`;
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

function findTenantRequestById(requestId) {
    return tenantRequestsCache.find((request) => String(request.id) === String(requestId));
}

function normalizeCreatedTenantData(data) {
    if (Array.isArray(data)) {
        return data[0] || null;
    }

    return data || null;
}

function findCreatedTenantFromCache(payload) {
    const matches = tenantsCache.filter((tenant) => {
        return (
            String(tenant.facility_id || '') === String(payload.facility_id || '') &&
            normalizeCompareValue(tenant.unit_number) === normalizeCompareValue(payload.unit_number) &&
            normalizeCompareValue(tenant.tenant_name) === normalizeCompareValue(payload.tenant_name)
        );
    });

    return matches[matches.length - 1] || null;
}

function normalizeCompareValue(value) {
    return String(value || '').trim().toLowerCase();
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
    const requestCode =
        tenant?.request_public_uuid ||
        tenant?.request_code ||
        tenant?.tenant_request_code ||
        '';

    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    url.searchParams.delete('facility_id');
    url.searchParams.delete('tenant_mode');
    url.searchParams.delete('tenant_code');
    url.searchParams.delete('request_code');
    url.searchParams.set('tenant', requestCode);

    return url.toString();
}

function formatRequestDate(value) {
    if (!value) return 'No date';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString();
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

function setEditTenantButtonDisabled(isDisabled) {
    const button = document.getElementById('tenantSaveEditButton');
    if (!button) return;

    button.disabled = isDisabled;
    button.textContent = isDisabled ? 'Saving...' : 'Save Tenant';
}

function setDeleteTenantButtonDisabled(isDisabled) {
    const button = document.getElementById('tenantConfirmDeleteButton');
    if (!button) return;

    button.disabled = isDisabled;
    button.textContent = isDisabled ? 'Deleting...' : 'I Understand - Delete Tenant';
}

function setRequestSaveButtonDisabled(isDisabled) {
    const button = document.getElementById('requestSaveButton');
    if (!button) return;

    button.disabled = isDisabled;
    button.textContent = isDisabled ? 'Saving...' : 'Save Request';
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
