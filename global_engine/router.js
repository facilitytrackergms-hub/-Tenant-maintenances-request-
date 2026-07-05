/* ================================================================
   TENANT MAINTENANCE REQUEST APP
   PURPOSE: Tenant Request App Router
   LOCATION: /global_engine/router.js
   VERSION: v2026_07_05_router_tenants_auto_search_cache
   UPDATED: 2026-07-05
================================================================ */

/* ================================================================
   ROUTES
================================================================ */

const routes = {
    manager_home_dashboard: {
        path: '../manager_home_dashboard/manager_home_dashboard_grid.js?v=20260705_manager_home_facilitys_only',
        renderFunction: 'renderManagerHomeDashboardGrid'
    },

    tenant_request: {
        path: '../tenant_request/tenant_request_grid.js',
        renderFunction: 'renderTenantRequestGrid'
    },

    management: {
        path: '../management/management_grid.js',
        renderFunction: 'renderManagementGrid'
    },

    facilitys: {
        path: '../facilitys/facilitys_grid.js?v=20260705_facilitys_compact_dashboard_buttons',
        renderFunction: 'renderFacilitysGrid'
    },

    tenants: {
        path: '../tenants/tenants_grid.js?v=20260705_tenants_auto_search_no_button',
        renderFunction: 'renderTenantsGrid'
    }
};

/* ================================================================
   START ROUTER
================================================================ */

export async function startRouter() {
    const app = getAppContainer();

    if (!app) {
        console.error('App container not found. Add <div id="app"></div> to index.html.');
        return;
    }

    const viewName = getCurrentViewName();

    await loadView(viewName, {
        container: app
    });

    window.onpopstate = async () => {
        const nextViewName = getCurrentViewName();

        await loadView(nextViewName, {
            container: app
        });
    };
}

/* ================================================================
   NAVIGATE TO VIEW
================================================================ */

export async function navigateTo(viewName, context = {}) {
    const app = getAppContainer();

    if (!app) {
        console.error('App container not found.');
        return;
    }

    const safeViewName = routes[viewName] ? viewName : 'manager_home_dashboard';

    const url = new URL(window.location.href);

    url.searchParams.set('view', safeViewName);

    if (safeViewName !== 'tenant_request') {
        url.searchParams.delete('tenant');
        url.searchParams.delete('tenant_code');
        url.searchParams.delete('request_code');
    }

    if (context?.facilityId) {
        url.searchParams.set('facility_id', context.facilityId);
    } else {
        url.searchParams.delete('facility_id');
    }

    if (context?.tenantMode) {
        url.searchParams.set('tenant_mode', context.tenantMode);
    } else {
        url.searchParams.delete('tenant_mode');
    }

    window.history.pushState(
        {
            view: safeViewName
        },
        '',
        url.toString()
    );

    await loadView(safeViewName, {
        container: app,
        ...context
    });
}

/* ================================================================
   LOAD VIEW
================================================================ */

async function loadView(viewName, context = {}) {
    const app = getAppContainer();
    const safeViewName = routes[viewName] ? viewName : 'manager_home_dashboard';
    const route = routes[safeViewName];

    if (!route) {
        renderRouterError(app, `Route not found: ${safeViewName}`);
        return;
    }

    try {
        app.innerHTML = `
            <div style="padding:20px;font-family:Arial,sans-serif;text-align:center;">
                Loading...
            </div>
        `;

        const module = await import(route.path);

        const renderFunction =
            module[route.renderFunction] ||
            module.default;

        if (typeof renderFunction !== 'function') {
            renderRouterError(app, `Render function missing for route: ${safeViewName}`);
            return;
        }

        await renderFunction({
            container: app,
            view: safeViewName,
            ...context
        });

    } catch (error) {
        console.error('Router load view error:', error);

        renderRouterError(
            app,
            'This page could not be loaded. Check the router path and console error.'
        );
    }
}

/* ================================================================
   GET CURRENT VIEW
================================================================ */

function getCurrentViewName() {
    const urlParams = new URLSearchParams(window.location.search);
    const viewFromUrl = urlParams.get('view');

    if (hasTenantRequestCode(urlParams)) {
        return 'tenant_request';
    }

    if (viewFromUrl && routes[viewFromUrl]) {
        return viewFromUrl;
    }

    return 'manager_home_dashboard';
}

function hasTenantRequestCode(urlParams) {
    return (
        urlParams.has('tenant') ||
        urlParams.has('tenant_code') ||
        urlParams.has('request_code')
    );
}

/* ================================================================
   GET APP CONTAINER
================================================================ */

function getAppContainer() {
    return (
        document.getElementById('app') ||
        document.getElementById('main') ||
        document.getElementById('root')
    );
}

/* ================================================================
   ROUTER ERROR SCREEN
================================================================ */

function renderRouterError(container, message) {
    if (!container) return;

    container.innerHTML = `
        <div style="
            min-height:100vh;
            background:#eef2f6;
            font-family:Arial,sans-serif;
            padding:20px;
            box-sizing:border-box;
        ">
            <div style="
                max-width:520px;
                margin:40px auto;
                background:#ffffff;
                border-radius:14px;
                padding:18px;
                color:#991b1b;
                text-align:center;
                box-shadow:0 4px 14px rgba(0,0,0,0.12);
            ">
                ${escapeHtml(message)}
            </div>

            <div style="
                max-width:520px;
                margin:12px auto 0 auto;
                text-align:center;
                font-size:11px;
                color:#64748b;
            ">
                router.js | v2026_07_05_router_tenants_auto_search_cache
            </div>
        </div>
    `;
}

/* ================================================================
   HELPERS
================================================================ */

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

/* ================================================================
   AUTO START
================================================================ */

window.navigateTo = navigateTo;

document.addEventListener('DOMContentLoaded', async () => {
    await startRouter();
});
