/* ================================================================
   TENANT MAINTENANCE REQUEST APP
   PURPOSE: Facilitys Screen Styles
   LOCATION: /facilitys/facilitys_styles.js
   VERSION: v2026_07_03_facilitys_styles_first_build
   UPDATED: 2026-07-03
================================================================ */

export function injectFacilitysStyles() {
    if (document.getElementById('facilitys-grid-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'facilitys-grid-styles';

    style.textContent = `
        .facilitys-page {
            width: 100%;
            min-height: 100%;
            padding: 14px;
            box-sizing: border-box;
            background: #dbeafe;
            color: #0f172a;
            font-family: Arial, sans-serif;
        }

        .facilitys-card {
            background: #ffffff;
            border-radius: 14px;
            padding: 14px;
            margin: 0 0 14px 0;
            box-shadow: 0 4px 14px rgba(0,0,0,0.14);
            border: 1px solid #bfdbfe;
        }

        .facilitys-title {
            font-size: 22px;
            margin: 0 0 4px 0;
            color: #0f3b85;
            text-align: center;
        }

        .facilitys-subtitle {
            font-size: 12px;
            margin: 0 0 14px 0;
            color: #334155;
            text-align: center;
        }

        .facilitys-section-title {
            font-size: 15px;
            font-weight: 700;
            margin: 0 0 10px 0;
            color: #0f3b85;
            text-align: center;
        }

        .facilitys-input,
        .facilitys-textarea {
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

        .facilitys-textarea {
            min-height: 70px;
            resize: vertical;
        }

        .facilitys-main-button {
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

        .facilitys-main-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .facilitys-small-button,
        .facilitys-warning-button {
            border: none;
            border-radius: 9px;
            padding: 9px 6px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
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
            margin-top: 10px;
            min-height: 18px;
            font-size: 12px;
            font-weight: 700;
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
            gap: 12px;
        }

        .facilitys-item-card {
            border: 1px solid #93c5fd;
            border-radius: 12px;
            padding: 12px;
            background: #eff6ff;
            text-align: left;
        }

        .facilitys-item-header {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            align-items: flex-start;
            margin-bottom: 8px;
        }

        .facilitys-item-name {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
        }

        .facilitys-item-address {
            font-size: 12px;
            color: #334155;
            margin-top: 2px;
            line-height: 1.4;
        }

        .facilitys-status-active,
        .facilitys-status-inactive {
            font-size: 11px;
            font-weight: 700;
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
            font-size: 12px;
            color: #334155;
            line-height: 1.5;
            margin-bottom: 10px;
        }

        .facilitys-button-row {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
            margin-top: 10px;
        }

        .facilitys-loading,
        .facilitys-empty,
        .facilitys-error-box {
            font-size: 13px;
            padding: 10px;
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
