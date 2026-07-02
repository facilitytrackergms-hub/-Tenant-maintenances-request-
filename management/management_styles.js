/* ================================================================
   TENANT MAINTENANCE REQUEST APP
   PURPOSE: Management Screen Styles
   LOCATION: /management/management_styles.js
   VERSION: v2026_07_02_management_styles_first_split
   UPDATED: 2026-07-02
================================================================ */

export function injectManagementStyles() {
    if (document.getElementById('management-grid-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'management-grid-styles';

    style.textContent = `
        .management-page {
            width: 100%;
            min-height: 100%;
            padding: 14px;
            box-sizing: border-box;
            background: #dbeafe;
            color: #0f172a;
            font-family: Arial, sans-serif;
        }

        .management-card {
            background: #ffffff;
            border-radius: 14px;
            padding: 14px;
            margin: 0 0 14px 0;
            box-shadow: 0 4px 14px rgba(0,0,0,0.14);
            border: 1px solid #bfdbfe;
        }

        .management-title {
            font-size: 22px;
            margin: 0 0 4px 0;
            color: #0f3b85;
        }

        .management-subtitle {
            font-size: 12px;
            margin: 0 0 14px 0;
            color: #334155;
        }

        .management-section-title {
            font-size: 15px;
            font-weight: 700;
            margin: 0 0 10px 0;
            color: #0f3b85;
        }

        .management-input,
        .management-textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #93c5fd;
            border-radius: 10px;
            padding: 10px;
            margin: 0 0 10px 0;
            font-size: 14px;
            background: #eff6ff;
            color: #0f172a;
            outline: none;
        }

        .management-textarea {
            min-height: 70px;
            resize: vertical;
        }

        .management-main-button {
            width: 100%;
            border: none;
            border-radius: 10px;
            padding: 12px;
            background: #1d4ed8;
            color: #ffffff;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
        }

        .management-main-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .management-message {
            margin-top: 10px;
            min-height: 18px;
            font-size: 12px;
            font-weight: 700;
        }

        .management-message.success {
            color: #166534;
        }

        .management-message.error {
            color: #991b1b;
        }

        .management-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .management-tenant-card {
            border: 1px solid #93c5fd;
            border-radius: 12px;
            padding: 12px;
            background: #eff6ff;
            text-align: left;
        }

        .management-tenant-header {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            align-items: flex-start;
            margin-bottom: 8px;
        }

        .management-tenant-name {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
        }

        .management-tenant-unit {
            font-size: 12px;
            color: #334155;
            margin-top: 2px;
        }

        .management-status-active,
        .management-status-inactive {
            font-size: 11px;
            font-weight: 700;
            padding: 4px 8px;
            border-radius: 999px;
            white-space: nowrap;
        }

        .management-status-active {
            background: #dcfce7;
            color: #166534;
        }

        .management-status-inactive {
            background: #fee2e2;
            color: #991b1b;
        }

        .management-tenant-details {
            font-size: 12px;
            color: #334155;
            line-height: 1.5;
            margin-bottom: 10px;
        }

        .management-link-label {
            display: block;
            font-size: 12px;
            font-weight: 700;
            color: #0f3b85;
            margin-bottom: 5px;
        }

        .management-link-box {
            width: 100%;
            min-height: 62px;
            box-sizing: border-box;
            border: 1px solid #93c5fd;
            border-radius: 10px;
            padding: 8px;
            font-size: 11px;
            background: #ffffff;
            color: #0f172a;
            resize: vertical;
        }

        .management-button-row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 8px;
            margin-top: 10px;
        }

        .management-small-button,
        .management-warning-button {
            border: none;
            border-radius: 9px;
            padding: 9px 6px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
        }

        .management-small-button {
            background: #2563eb;
            color: #ffffff;
        }

        .management-warning-button {
            background: #b91c1c;
            color: #ffff00;
        }

        .management-loading,
        .management-empty,
        .management-error-box {
            font-size: 13px;
            padding: 10px;
            border-radius: 10px;
            background: #eff6ff;
            color: #334155;
        }

        .management-error-box {
            color: #991b1b;
            background: #fee2e2;
        }

        .management-footer-tag {
            text-align: center;
            font-size: 10px;
            color: #475569;
            margin: 14px 0 20px 0;
        }
    `;

    document.head.appendChild(style);
}
