/* ================================================================
   TENANT MAINTENANCE REQUEST APP
   PURPOSE: Management Screen - Manager Login Redirect To Facilitys
   LOCATION: /management/management_grid.js
   VERSION: v2026_07_05_management_login_to_facilitys
   UPDATED: 2026-07-05
================================================================ */

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

    goToFacilitys();
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
                    Log in to manage facilitys, tenants, and request links.
                </p>

                <input id="managementLoginEmail" class="management-input" type="email" placeholder="Email">
                <input id="managementLoginPassword" class="management-input" type="password" placeholder="Password">

                <button id="managementLoginButton" class="management-main-button">
                    Login
                </button>

                <div id="managementMessage" class="management-message"></div>
            </div>

            <div class="management-footer-tag">
                management_grid.js | v2026_07_05_management_login_to_facilitys
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

    goToFacilitys();
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
                management_grid.js | v2026_07_05_management_login_to_facilitys
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

async function handleManagerLogout() {
    await signOutManager();

    currentManager = null;

    renderManagerLogin();
}

/* ================================================================
   NAVIGATION
================================================================ */

function goToFacilitys() {
    if (typeof window.navigateTo === 'function') {
        window.navigateTo('facilitys');
        return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('view', 'facilitys');
    window.location.href = url.toString();
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

function getInputValue(id) {
    const input = document.getElementById(id);
    return input ? input.value.trim() : '';
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

function setLoginButtonDisabled(isDisabled) {
    const button = document.getElementById('managementLoginButton');
    if (!button) return;

    button.disabled = isDisabled;
    button.textContent = isDisabled ? 'Logging in...' : 'Login';
}

/* ================================================================
   ROUTER COMPATIBILITY EXPORTS
================================================================ */

export default async function managementDefaultExport(containerOrContext = {}) {
    await renderManagementGrid(containerOrContext);
}
