/* ================================================================
   TENANT MAINTENANCE REQUEST APP
   PURPOSE: Manager Home Dashboard
   LOCATION: /manager_home_dashboard/manager_home_dashboard_grid.js
   VERSION: v2026_07_03_manager_home_dashboard_grid_first_build
   UPDATED: 2026-07-03
================================================================ */

import {
    getCurrentSession,
    signOutManager,
    fetchCurrentManagerProfile
} from '../management/management_auth.js';

import { injectManagerHomeDashboardStyles } from './manager_home_dashboard_styles.js';

/* ================================================================
   STATE
================================================================ */

let managerHomeContainer = null;
let currentManager = null;

/* ================================================================
   MAIN RENDER
================================================================ */

export async function renderManagerHomeDashboardGrid(containerOrContext = {}) {
    managerHomeContainer = resolveManagerHomeContainer(containerOrContext);

    if (!managerHomeContainer) {
        console.error('Manager home dashboard container not found.');
        return;
    }

    injectManagerHomeDashboardStyles();

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

    renderManagerHomeDashboard();
}

/* ================================================================
   LOGIN REQUIRED
================================================================ */

function renderLoginRequired() {
    managerHomeContainer.innerHTML = `
        <div class="manager-home-page">
            <div class="manager-home-card">
                <h1 class="manager-home-title">Manager Dashboard</h1>
                <p class="manager-home-subtitle">
                    Login required.
                </p>

                <button id="managerHomeLoginButton" class="manager-home-button">
                    Go To Manager Login
                </button>

                <div id="managerHomeMessage" class="manager-home-message"></div>
            </div>

            <div class="manager-home-footer-tag">
                manager_home_dashboard_grid.js | v2026_07_03_manager_home_dashboard_grid_first_build
            </div>
        </div>
    `;

    const loginButton = document.getElementById('managerHomeLoginButton');

    if (loginButton) {
        loginButton.onclick = () => {
            goToView('management');
        };
    }
}

/* ================================================================
   ACCESS DENIED
================================================================ */

function renderAccessDenied() {
    managerHomeContainer.innerHTML = `
        <div class="manager-home-page">
            <div class="manager-home-card">
                <h1 class="manager-home-title">Access Denied</h1>
                <p class="manager-home-subtitle">
                    This login is not connected to an active manager profile.
                </p>

                <button id="managerHomeLogoutButton" class="manager-home-button warning">
                    Logout
                </button>

                <div id="managerHomeMessage" class="manager-home-message"></div>
            </div>

            <div class="manager-home-footer-tag">
                manager_home_dashboard_grid.js | v2026_07_03_manager_home_dashboard_grid_first_build
            </div>
        </div>
    `;

    const logoutButton = document.getElementById('managerHomeLogoutButton');

    if (logoutButton) {
        logoutButton.onclick = async () => {
            await handleLogout();
        };
    }
}

/* ================================================================
   DASHBOARD
================================================================ */

function renderManagerHomeDashboard() {
    managerHomeContainer.innerHTML = `
        <div class="manager-home-page">
            <div class="manager-home-card">
                <h1 class="manager-home-title">Manager Dashboard</h1>
                <p class="manager-home-subtitle">
                    Logged in as ${escapeHtml(currentManager?.full_name || 'Manager')}
                </p>

                <div class="manager-home-button-grid">
                    <button id="managerHomeFacilitysButton" class="manager-home-button">
                        Add / Delete Facilitys
                    </button>

                    <button id="managerHomeTenantsButton" class="manager-home-button">
                        Add / Delete Tenants
                    </button>

                    <button id="managerHomeRequestsButton" class="manager-home-button secondary">
                        Tenant Maintenance Requests
                    </button>

                    <button id="managerHomeAssignWorkButton" class="manager-home-button secondary">
                        Assign Work
                    </button>

                    <button id="managerHomeManagersButton" class="manager-home-button secondary">
                        Managers
                    </button>

                    <button id="managerHomeLogoutButton" class="manager-home-button warning">
                        Logout
                    </button>
                </div>

                <div id="managerHomeMessage" class="manager-home-message"></div>
            </div>

            <div class="manager-home-footer-tag">
                manager_home_dashboard_grid.js | v2026_07_03_manager_home_dashboard_grid_first_build
            </div>
        </div>
    `;

    attachDashboardHandlers();
}

/* ================================================================
   HANDLERS
================================================================ */

function attachDashboardHandlers() {
    const facilitysButton = document.getElementById('managerHomeFacilitysButton');
    const tenantsButton = document.getElementById('managerHomeTenantsButton');
    const requestsButton = document.getElementById('managerHomeRequestsButton');
    const assignWorkButton = document.getElementById('managerHomeAssignWorkButton');
    const managersButton = document.getElementById('managerHomeManagersButton');
    const logoutButton = document.getElementById('managerHomeLogoutButton');

    if (facilitysButton) {
        facilitysButton.onclick = () => {
            goToView('facilitys');
        };
    }

    if (tenantsButton) {
        tenantsButton.onclick = () => {
            goToView('management');
        };
    }

    if (requestsButton) {
        requestsButton.onclick = () => {
            showManagerHomeMessage('Tenant Maintenance Requests dashboard is next.', 'success');
        };
    }

    if (assignWorkButton) {
        assignWorkButton.onclick = () => {
            showManagerHomeMessage('Assign Work dashboard is next.', 'success');
        };
    }

    if (managersButton) {
        managersButton.onclick = () => {
            showManagerHomeMessage('Managers dashboard is next.', 'success');
        };
    }

    if (logoutButton) {
        logoutButton.onclick = async () => {
            await handleLogout();
        };
    }
}

async function handleLogout() {
    await signOutManager();

    currentManager = null;

    goToView('management');
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

function resolveManagerHomeContainer(containerOrContext) {
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

function showManagerHomeMessage(message, type = 'info') {
    const messageBox = document.getElementById('managerHomeMessage');
    if (!messageBox) return;

    messageBox.textContent = message || '';
    messageBox.className = `manager-home-message ${type}`;
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

export default async function managerHomeDashboardDefaultExport(containerOrContext = {}) {
    await renderManagerHomeDashboardGrid(containerOrContext);
}
