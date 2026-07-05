/* ================================================================
   TENANT MAINTENANCE REQUEST APP
   PURPOSE: Tenants Styles
   LOCATION: /tenants/tenants_styles.js
   VERSION: v2026_07_05_tenants_styles_first_build
   UPDATED: 2026-07-05
================================================================ */

let tenantsStylesInjected = false;

/* ================================================================
   INJECT STYLES
================================================================ */

export function injectTenantsStyles() {
    if (tenantsStylesInjected) return;

    const style = document.createElement('style');
    style.id = 'tenants-styles';

    style.textContent = `
        .tenants-page {
            min-height: 100vh;
            background: #dbeafe;
            font-family: Arial, sans-serif;
            padding: 18px;
            box-sizing: border-box;
        }

        .tenants-card {
            max-width: 520px;
            margin: 0 auto 18px auto;
            background: #ffffff;
            border-radius: 16px;
            padding: 18px;
            box-sizing: border-box;
            box-shadow: 0 4px 14px rgba(0,0,0,0.12);
        }

        .tenants-title {
            margin: 0;
            color: #003b8f;
            font-size: 28px;
            text-align: center;
            font-weight: 800;
        }

        .tenants-subtitle {
            margin: 6px 0 16px 0;
            color: #0f172a;
            font-size: 14px;
            text-align: center;
            line-height: 1.4;
        }

        .tenants-section-title {
            color: #003b8f;
            font-size: 18px;
            font-weight: 800;
            text-align: center;
            margin: 0 0 14px 0;
        }

        .tenants-input,
        .tenants-textarea {
            width: 100%;
            border: 1px solid #93c5fd;
            background: #eff6ff;
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 10px;
            box-sizing: border-box;
            font-size: 15px;
            color: #0f172a;
        }

        .tenants-textarea {
            min-height: 82px;
            resize: vertical;
        }

        .tenants-main-button,
        .tenants-small-button,
        .tenants-warning-button {
            width: 100%;
            border: none;
            border-radius: 12px;
            padding: 14px;
            box-sizing: border-box;
            font-size: 16px;
            font-weight: 800;
            cursor: pointer;
            margin-bottom: 10px;
        }

        .tenants-main-button {
            background: #2454dc;
            color: #ffffff;
        }

        .tenants-small-button {
            background: #2563eb;
            color: #ffffff;
        }

        .tenants-warning-button {
            background: #c81e1e;
            color: #ffff00;
        }

        .tenants-button-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 12px;
        }

        .tenants-button-row.three {
            grid-template-columns: 1fr 1fr 1fr;
        }

        .tenants-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .tenants-unit-button {
            width: 100%;
            border: 1px solid #93c5fd;
            background: #eff6ff;
            border-radius: 12px;
            padding: 14px;
            box-sizing: border-box;
            text-align: left;
            cursor: pointer;
        }

        .tenants-unit-number {
            color: #0f172a;
            font-size: 19px;
            font-weight: 800;
        }

        .tenants-unit-name {
            color: #1e3a8a;
            font-size: 14px;
            margin-top: 4px;
        }

        .tenants-detail-box {
            border: 1px solid #93c5fd;
            background: #eff6ff;
            border-radius: 12px;
            padding: 14px;
            box-sizing: border-box;
            color: #0f172a;
            font-size: 15px;
            line-height: 1.45;
        }

        .tenants-detail-row {
            margin-bottom: 6px;
        }

        .tenants-link-box {
            width: 100%;
            min-height: 76px;
            border: 1px solid #93c5fd;
            background: #ffffff;
            border-radius: 10px;
            padding: 10px;
            box-sizing: border-box;
            font-size: 13px;
            color: #0f172a;
            resize: vertical;
            margin-top: 8px;
        }

        .tenants-status-active {
            display: inline-block;
            background: #dcfce7;
            color: #008000;
            border-radius: 999px;
            padding: 5px 10px;
            font-size: 13px;
            font-weight: 800;
        }

        .tenants-status-inactive {
            display: inline-block;
            background: #fee2e2;
            color: #991b1b;
            border-radius: 999px;
            padding: 5px 10px;
            font-size: 13px;
            font-weight: 800;
        }

        .tenants-message {
            min-height: 20px;
            margin-top: 8px;
            text-align: center;
            font-size: 14px;
            font-weight: 800;
        }

        .tenants-message.success {
            color: #008000;
        }

        .tenants-message.error {
            color: #991b1b;
        }

        .tenants-loading,
        .tenants-empty,
        .tenants-error-box {
            text-align: center;
            color: #0f172a;
            font-size: 15px;
            padding: 12px;
        }

        .tenants-error-box {
            color: #991b1b;
            font-weight: 800;
        }

        .tenants-footer-tag {
            max-width: 520px;
            margin: 12px auto 0 auto;
            color: #1e3a8a;
            text-align: center;
            font-size: 11px;
            line-height: 1.4;
        }
    `;

    document.head.appendChild(style);
    tenantsStylesInjected = true;
}
