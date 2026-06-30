/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Tenant Maintenance Request Styles
   LOCATION: /tenant_request/tenant_request_styles.js
   VERSION: v2026_06_30_tenant_request_styles_light_blue_inset_inputs
   UPDATED: 2026-06-30
================================================================ */

export function injectTenantRequestStyles() {
    const existingStyle = document.getElementById('tenant-request-styles');
    if (existingStyle) {
        existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'tenant-request-styles';

    style.textContent = `
        .tenant-request-page {
            min-height: 100vh;
            background: #dbeafe;
            font-family: Arial, sans-serif;
            padding: 14px;
            box-sizing: border-box;
        }

        .tenant-request-card {
            max-width: 520px;
            margin: 0 auto;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 16px;
            padding: 18px;
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.65), 0 4px 14px rgba(30, 64, 175, 0.18);
            box-sizing: border-box;
        }

        .tenant-request-title {
            margin: 0 0 6px 0;
            font-size: 22px;
            font-weight: bold;
            color: #1e3a8a;
            text-align: center;
        }

        .tenant-request-subtitle {
            margin: 0 0 16px 0;
            font-size: 14px;
            color: #334155;
            text-align: center;
            line-height: 1.4;
        }

        .tenant-request-tenant-box {
            background: #dbeafe;
            border: 1px solid #93c5fd;
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 14px;
            box-shadow: inset 0 2px 5px rgba(30, 64, 175, 0.12);
        }

        .tenant-request-tenant-line {
            font-size: 14px;
            color: #111827;
            margin-bottom: 5px;
        }

        .tenant-request-tenant-line:last-child {
            margin-bottom: 0;
        }

        .tenant-request-label {
            display: block;
            font-size: 13px;
            font-weight: bold;
            color: #1e3a8a;
            margin: 12px 0 5px 0;
        }

        .tenant-request-input,
        .tenant-request-select,
        .tenant-request-textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #93c5fd;
            border-radius: 10px;
            padding: 11px;
            font-size: 15px;
            font-family: Arial, sans-serif;
            background: #dbeafe;
            color: #111827;
            box-shadow: inset 0 2px 5px rgba(30, 64, 175, 0.18);
        }

        .tenant-request-textarea {
            min-height: 110px;
            resize: vertical;
        }

        .tenant-request-input:focus,
        .tenant-request-select:focus,
        .tenant-request-textarea:focus {
            outline: none;
            border-color: #2563eb;
            background: #ffffff;
            box-shadow: inset 0 2px 5px rgba(30, 64, 175, 0.12), 0 0 0 2px rgba(37, 99, 235, 0.22);
        }

        .tenant-request-button {
            width: 100%;
            border: none;
            border-radius: 10px;
            background: #1d4ed8;
            color: #ffffff;
            font-size: 16px;
            font-weight: bold;
            padding: 13px;
            margin-top: 16px;
            cursor: pointer;
            box-shadow: 0 3px 8px rgba(30, 64, 175, 0.28);
        }

        .tenant-request-button:disabled {
            background: #94a3b8;
            cursor: not-allowed;
            box-shadow: none;
        }

        .tenant-request-message {
            margin-top: 12px;
            padding: 10px;
            border-radius: 9px;
            font-size: 14px;
            display: none;
            line-height: 1.4;
        }

        .tenant-request-message.info,
        .tenant-request-message.success,
        .tenant-request-message.error {
            display: block;
        }

        .tenant-request-message.info {
            background: #eff6ff;
            color: #1e40af;
            border: 1px solid #bfdbfe;
        }

        .tenant-request-message.success {
            background: #ecfdf5;
            color: #065f46;
            border: 1px solid #a7f3d0;
        }

        .tenant-request-message.error {
            background: #fef2f2;
            color: #991b1b;
            border: 1px solid #fecaca;
        }

        .tenant-request-loading {
            max-width: 520px;
            margin: 40px auto;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 14px;
            padding: 18px;
            text-align: center;
            font-size: 16px;
            color: #1e3a8a;
            box-shadow: 0 4px 14px rgba(30, 64, 175, 0.18);
        }

        .tenant-request-error-card {
            max-width: 520px;
            margin: 40px auto;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 14px;
            padding: 18px;
            text-align: center;
            color: #991b1b;
            box-shadow: 0 4px 14px rgba(30, 64, 175, 0.18);
        }

        .tenant-request-footer-tag {
            max-width: 520px;
            margin: 12px auto 0 auto;
            text-align: center;
            font-size: 11px;
            color: #475569;
            padding-bottom: 12px;
        }

        @media (max-width: 600px) {
            .tenant-request-page {
                padding: 10px;
            }

            .tenant-request-card {
                padding: 14px;
                border-radius: 12px;
            }

            .tenant-request-title {
                font-size: 20px;
            }

            .tenant-request-input,
            .tenant-request-select,
            .tenant-request-textarea {
                font-size: 16px;
            }
        }
    `;

    document.head.appendChild(style);
}
