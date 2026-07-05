/* ================================================================
   TENANT MAINTENANCE REQUEST APP
   PURPOSE: Facilitys Screen Styles
   LOCATION: /facilitys/facilitys_styles.js
   VERSION: v2026_07_05_facilitys_styles_phone_scale
   UPDATED: 2026-07-05
================================================================ */

export function injectFacilitysStyles() {
    const oldStyle = document.getElementById('facilitys-grid-styles');

    if (oldStyle) {
        oldStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'facilitys-grid-styles';

    style.textContent = `
        .facilitys-page {
            width: 100%;
            min-height: 100%;
            padding: 16px;
            box-sizing: border-box;
            background: #dbeafe;
            color: #0f172a;
            font-family: Arial, sans-serif;
        }

        .facilitys-card {
            background: #ffffff;
            border-radius: 16px;
            padding: 18px;
            margin: 0 0 16px 0;
            box-shadow: 0 4px 14px rgba(0,0,0,0.14);
            border: 1px solid #bfdbfe;
        }

        .facilitys-title {
            font-size: 21px;
            margin: 0 0 4px 0;
            color: #0f3b85;
            text-align: center;
            font-weight: 800;
            line-height: 1.15;
        }

        .facilitys-subtitle {
            font-size: 13px;
            margin: 0 0 16px 0;
            color: #334155;
            text-align: center;
            line-height: 1.25;
        }

        .facilitys-section-title {
            font-size: 16px;
            font-weight: 800;
            margin: 0 0 12px 0;
            color: #0f3b85;
            text-align: center;
        }

        .facilitys-input,
        .facilitys-textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #93c5fd;
            border-radius: 12px;
            padding: 14px;
            margin: 0 0 12px 0;
            font-size: 16px;
            background: #eff6ff;
            color: #0f172a;
            outline: none;
        }

        .facilitys-textarea {
            min-height: 86px;
            resize: vertical;
        }

        .facilitys-main-button {
            width: 100%;
            border: none;
            border-radius: 12px;
            padding: 16px 10px !important;
            background: #1d4ed8;
            color: #ffffff;
            font-weight: 800;
            font-size: 16px !important;
            cursor: pointer;
            line-height: 1.15;
        }

        .facilitys-main-button + .facilitys-main-button {
            margin-top: 14px;
        }

        .facilitys-main-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .facilitys-small-button,
        .facilitys-warning-button {
            border: none;
            border-radius: 11px;
            padding: 12px 8px !important;
            font-size: 14px !important;
            font-weight: 800;
            cursor: pointer;
            line-height: 1.15;
        }

        .facilitys-small-button {
            background: #2563eb;
            color: #ffffff;
        }

        .facilitys-warning-button {
            background: #b91c1c;
            color: #ffff00;
        }

        .facilitys-message {
            margin-top: 12px;
            min-height: 20px;
            font-size: 13px;
            font-weight: 800;
            text-align: center;
        }

        .facilitys-message.success {
            color: #166534;
        }

        .facilitys-message.error {
            color: #991b1b;
        }

        .facilitys-list {
            display: flex;
            flex-direction: column;
            gap: 9px;
        }

        .facilitys-item-card {
            border: 1px solid #93c5fd;
            border-radius: 12px;
            padding: 10px;
            background: #eff6ff;
            text-align: left;
        }

        .facilitys-item-header {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            align-items: flex-start;
            margin-bottom: 6px;
        }

        .facilitys-item-name {
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
        }

        .facilitys-item-address {
            font-size: 13px;
            color: #334155;
            margin-top: 2px;
            line-height: 1.3;
        }

        .facilitys-status-active,
        .facilitys-status-inactive {
            font-size: 12px;
            font-weight: 800;
            padding: 4px 8px;
            border-radius: 999px;
            white-space: nowrap;
        }

        .facilitys-status-active {
            background: #dcfce7;
            color: #166534;
        }

        .facilitys-status-inactive {
            background: #fee2e2;
            color: #991b1b;
        }

        .facilitys-item-details {
            font-size: 13px;
            color: #334155;
            line-height: 1.45;
            margin-bottom: 10px;
        }

        .facilitys-button-row {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
            margin-top: 12px;
        }

        .facilitys-loading,
        .facilitys-empty,
        .facilitys-error-box {
            font-size: 14px;
            padding: 12px;
            border-radius: 10px;
            background: #eff6ff;
            color: #334155;
            text-align: center;
        }

        .facilitys-error-box {
            color: #991b1b;
            background: #fee2e2;
        }

        .facilitys-footer-tag {
            text-align: center;
            font-size: 10px;
            color: #475569;
            margin: 14px 0 20px 0;
        }
    `;

    document.head.appendChild(style);
}
