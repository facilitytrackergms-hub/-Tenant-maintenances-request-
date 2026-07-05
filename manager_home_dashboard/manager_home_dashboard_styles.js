/* ================================================================
   TENANT MAINTENANCE REQUEST APP
   PURPOSE: Manager Home Dashboard Styles
   LOCATION: /manager_home_dashboard/manager_home_dashboard_styles.js
   VERSION: v2026_07_03_manager_home_dashboard_styles_first_build
   UPDATED: 2026-07-03
================================================================ */

export function injectManagerHomeDashboardStyles() {
    if (document.getElementById('manager-home-dashboard-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'manager-home-dashboard-styles';

    style.textContent = `
        .manager-home-page {
            width: 100%;
            min-height: 100%;
            padding: 14px;
            box-sizing: border-box;
            background: #dbeafe;
            color: #0f172a;
            font-family: Arial, sans-serif;
        }

        .manager-home-card {
            background: #ffffff;
            border-radius: 14px;
            padding: 14px;
            margin: 0 0 14px 0;
            box-shadow: 0 4px 14px rgba(0,0,0,0.14);
            border: 1px solid #bfdbfe;
        }

        .manager-home-title {
            font-size: 22px;
            margin: 0 0 4px 0;
            color: #0f3b85;
            text-align: center;
        }

        .manager-home-subtitle {
            font-size: 12px;
            margin: 0 0 14px 0;
            color: #334155;
            text-align: center;
        }

        .manager-home-button-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 10px;
        }

        .manager-home-button {
            width: 100%;
            border: none;
            border-radius: 12px;
            padding: 14px 12px;
            background: #1d4ed8;
            color: #ffffff;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            text-align: center;
        }

        .manager-home-button.secondary {
            background: #2563eb;
        }

        .manager-home-button.warning {
            background: #b91c1c;
            color: #ffff00;
        }

        .manager-home-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .manager-home-message {
            margin-top: 10px;
            min-height: 18px;
            font-size: 12px;
            font-weight: 700;
            text-align: center;
        }

        .manager-home-message.success {
            color: #166534;
        }

        .manager-home-message.error {
            color: #991b1b;
        }

        .manager-home-footer-tag {
            text-align: center;
            font-size: 10px;
            color: #475569;
            margin: 14px 0 20px 0;
        }
    `;

    document.head.appendChild(style);
}
