/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Tenant Maintenance Request Submit Logic
   LOCATION: /tenant_request/tenant_request_submit.js
   VERSION: v2026_06_29_tenant_request_submit
   UPDATED: 2026-06-29
================================================================ */

import { createTenantMaintenanceRequest } from './tenant_request_data.js';

import {
    getInputValue,
    getSelectValue,
    showTenantRequestMessage,
    clearTenantRequestMessage,
    disableTenantRequestButton,
    buildTenantRequestPayload
} from './tenant_request_helpers.js';

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

    const formValues = {
        request_title: getInputValue('tenantRequestTitle'),
        request_category: getSelectValue('tenantRequestCategory'),
        request_description: getInputValue('tenantRequestDescription'),
        best_day: getSelectValue('tenantRequestBestDay'),
        best_time: getSelectValue('tenantRequestBestTime'),
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
    if (!formValues.request_title) {
        return 'Please enter what needs repair.';
    }

    if (!formValues.request_category) {
        return 'Please select a category.';
    }

    if (!formValues.request_description) {
        return 'Please describe the problem.';
    }

    if (!formValues.best_day) {
        return 'Please select the best day.';
    }

    if (!formValues.best_time) {
        return 'Please select the best time.';
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
    setValue('tenantRequestTitle', '');
    setValue('tenantRequestCategory', '');
    setValue('tenantRequestDescription', '');
    setValue('tenantRequestBestDay', '');
    setValue('tenantRequestBestTime', '');
    setValue('tenantRequestPermissionToEnter', '');
    setValue('tenantRequestEntryInstructions', '');
}

function setValue(id, value) {
    const input = document.getElementById(id);
    if (!input) return;

    input.value = value;
}
