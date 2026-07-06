/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Tenant Maintenance Request Submit Logic
   LOCATION: /tenant_request/tenant_request_submit.js
   VERSION: v2026_06_30_tenant_request_submit_time_from_to
   UPDATED: 2026-06-30
================================================================ */

import { createTenantMaintenanceRequest } from './tenant_request_data.js?v=20260705_public_uuid_fix_1';

import {
    getInputValue,
    getSelectValue,
    showTenantRequestMessage,
    clearTenantRequestMessage,
    disableTenantRequestButton,
    buildTenantRequestPayload
} from './tenant_request_helpers.js?v=20260705_payload_request_code_fix_1';

/* ================================================================
   ATTACH SUBMIT BUTTON
================================================================ */

export function attachTenantRequestSubmitHandler({ tenant }) {
    const submitButton = document.getElementById('tenantRequestSubmitButton');

    if (!submitButton) {
        console.error('Tenant request submit button not found.');
        return;
    }

    submitButton.onclick = async () => {
        await handleTenantRequestSubmit({ tenant });
    };
}

/* ================================================================
   HANDLE SUBMIT
================================================================ */

async function handleTenantRequestSubmit({ tenant }) {
    clearTenantRequestMessage();

    const repairDescription = getInputValue('tenantRequestDescription');
    const bestTimeFrom = getInputValue('tenantRequestBestTimeFrom');
    const bestTimeTo = getInputValue('tenantRequestBestTimeTo');

    const formValues = {
        request_title: buildRequestTitle(repairDescription),
        request_category: '',
        request_description: repairDescription,
        best_day: getInputValue('tenantRequestBestDay'),
        best_time: buildBestTimeText(bestTimeFrom, bestTimeTo),
        best_time_from: bestTimeFrom,
        best_time_to: bestTimeTo,
        permission_to_enter: getSelectValue('tenantRequestPermissionToEnter'),
        entry_instructions: getInputValue('tenantRequestEntryInstructions')
    };

    const validationError = validateTenantRequestForm(formValues);

    if (validationError) {
        showTenantRequestMessage(validationError, 'error');
        return;
    }

    disableTenantRequestButton(true);

    const payload = buildTenantRequestPayload({
        tenant,
        formValues
    });

    const { error } = await createTenantMaintenanceRequest(payload);

    disableTenantRequestButton(false);

    if (error) {
        showTenantRequestMessage(
            'Request could not be submitted. Please try again or contact the office.',
            'error'
        );
        return;
    }

    resetTenantRequestForm();

    showTenantRequestMessage(
        'Maintenance request submitted successfully.',
        'success'
    );
}

/* ================================================================
   VALIDATION
================================================================ */

function validateTenantRequestForm(formValues) {
    if (!formValues.request_description) {
        return 'Please enter what needs repair.';
    }

    if (!formValues.best_day) {
        return 'Please select the best date.';
    }

    if (!formValues.best_time_from) {
        return 'Please select the start time.';
    }

    if (!formValues.best_time_to) {
        return 'Please select the end time.';
    }

    if (formValues.best_time_from >= formValues.best_time_to) {
        return 'Please choose a valid time window.';
    }

    if (!formValues.permission_to_enter) {
        return 'Please answer the permission to enter question.';
    }

    return '';
}

/* ================================================================
   RESET FORM
================================================================ */

function resetTenantRequestForm() {
    setValue('tenantRequestDescription', '');
    setValue('tenantRequestBestDay', '');
    setValue('tenantRequestBestTimeFrom', '');
    setValue('tenantRequestBestTimeTo', '');
    setValue('tenantRequestPermissionToEnter', '');
    setValue('tenantRequestEntryInstructions', '');
}

function setValue(id, value) {
    const input = document.getElementById(id);
    if (!input) return;

    input.value = value;
}

/* ================================================================
   HELPERS
================================================================ */

function buildRequestTitle(description) {
    if (!description) return 'Tenant maintenance request';

    const cleanDescription = description.trim();

    if (cleanDescription.length <= 60) {
        return cleanDescription;
    }

    return `${cleanDescription.slice(0, 60)}...`;
}

function buildBestTimeText(fromValue, toValue) {
    if (!fromValue || !toValue) return '';

    return `${formatTimeToAmPm(fromValue)} - ${formatTimeToAmPm(toValue)}`;
}

function formatTimeToAmPm(timeValue) {
    const [hourText, minuteText] = String(timeValue || '').split(':');

    let hour = Number(hourText);
    const minute = minuteText || '00';

    if (Number.isNaN(hour)) {
        return timeValue;
    }

    const suffix = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12;

    if (hour === 0) {
        hour = 12;
    }

    return `${hour}:${minute} ${suffix}`;
}
