/* ================================================================
   TENANT MAINTENANCE REQUEST APP
   PURPOSE: Manager Home Dashboard
   LOCATION: /manager_home_dashboard/manager_home_dashboard_grid.js
   VERSION: v2026_07_05_manager_home_dashboard_two_door_method
   UPDATED: 2026-07-05
================================================================ */

import {
    getCurrentSession,
    signOutManager,
    fetchCurrentManagerProfile
} from '../management/management_auth.js';

import { injectManagerHomeDashboardStyles } from './manager_home_dashboard_styles.js?v=20260704_manager_home_2';

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
                manager_home_dashboard_grid.js | v2026_07_05_manager_home_dashboard_two_door_method
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
                manager_home_dashboard_grid.js | v2026_07_05_manager_home_dashboard_two_door_method
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
                    <button id="managerHomeManagersButton" class="manager-home-button">
                        Managers
                    </button>

                    <button id="managerHomeFacilitysButton" class="manager-home-button">
                        Facilitys
                    </button>
                </div>

                <div id="managerHomeMessage" class="manager-home-message"></div>
            </div>

            <div class="manager-home-footer-tag">
                manager_home_dashboard_grid.js | v2026_07_05_manager_home_dashboard_two_door_method
            </div>
        </div>
    `;

    attachDashboardHandlers();
}

/* ================================================================
   HANDLERS
================================================================ */

function attachDashboardHandlers() {
    const managersButton = document.getElementById('managerHomeManagersButton');
    const facilitysButton = document.getElementById('managerHomeFacilitysButton');

    if (managersButton) {
        managersButton.onclick = () => {
            goToView('management');
        };
    }

    if (facilitysButton) {
        facilitysButton.onclick = () => {
            goToView('facilitys');
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
