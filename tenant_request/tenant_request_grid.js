/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Tenant Maintenance Request Grid Controller
   LOCATION: /tenant_request/tenant_request_grid.js
   VERSION: v2026_07_05_tenant_request_grid_public_uuid_fix
   UPDATED: 2026-07-05
================================================================ */

import { fetchTenantByRequestCode } from './tenant_request_data.js?v=20260705_public_uuid_fix_1';
import { renderTenantRequestForm } from './tenant_request_form.js';
import { attachTenantRequestSubmitHandler } from './tenant_request_submit.js';
import { injectTenantRequestStyles } from './tenant_request_styles.js';
import { getTenantRequestCode } from './tenant_request_helpers.js';

/* ================================================================
   MAIN RENDER
================================================================ */

export async function renderTenantRequestGrid(containerOrContext = {}) {
    injectTenantRequestStyles();

    const container = resolveTenantRequestContainer(containerOrContext);

    if (!container) {
        console.error('Tenant request container not found.');
        return;
    }

    container.innerHTML = `
        <div class="tenant-request-page">
            <div class="tenant-request-loading">
                Loading maintenance request form...
            </div>
        </div>
    `;

    const requestCode = getTenantRequestCode();

    if (!requestCode) {
        renderTenantRequestError(container, 'Invalid request link. Please contact the office for the correct maintenance request link.');
        return;
    }

    const { data: tenant, error } = await fetchTenantByRequestCode(requestCode);

    if (error || !tenant) {
        renderTenantRequestError(container, 'Tenant request link was not found or is no longer active.');
        return;
    }

    container.innerHTML = `
        <div class="tenant-request-page">
            ${renderTenantRequestForm({ tenant })}

            <div class="tenant-request-footer-tag">
                tenant_request_grid.js | v2026_07_05_tenant_request_grid_public_uuid_fix
            </div>
        </div>
    `;

    attachTenantRequestSubmitHandler({ tenant });
}

/* ================================================================
   ROUTER COMPATIBILITY EXPORTS
================================================================ */

export async function renderTenantRequest(containerOrContext = {}) {
    await renderTenantRequestGrid(containerOrContext);
}

export default async function tenantRequestDefaultExport(containerOrContext = {}) {
    await renderTenantRequestGrid(containerOrContext);
}

/* ================================================================
   CONTAINER RESOLUTION
================================================================ */

function resolveTenantRequestContainer(containerOrContext) {
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

/* ================================================================
   ERROR SCREEN
================================================================ */

function renderTenantRequestError(container, message) {
    container.innerHTML = `
        <div class="tenant-request-page">
            <div class="tenant-request-error-card">
                ${message}
            </div>

            <div class="tenant-request-footer-tag">
                tenant_request_grid.js | v2026_07_05_tenant_request_grid_public_uuid_fix
            </div>
        </div>
    `;
}
