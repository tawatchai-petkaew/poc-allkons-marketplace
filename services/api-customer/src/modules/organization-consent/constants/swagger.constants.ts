export const ORGANIZATION_CONSENT_SWAGGER = {
  EXAMPLES: {
    SUCCESS_RESPONSE: {
      message: 'Organization consent saved successfully',
      data: [
        {
          type: 'privacy_policy',
          version: 'v2.0',
          updated_at: '2025-06-11T09:10:00Z'
        },
        {
          type: 'manufacturer_consent',
          version: 'v1.0',
          updated_at: '2025-06-11T09:10:00Z'
        }
      ]
    },
    REQUEST_SINGLE: {
      organizationId: 1,
      consentIds: [1]
    },
    REQUEST_MULTIPLE: {
      organizeId: 1,
      consentIds: [1, 2, 3]
    },
    VALIDATION_ERROR: {
      statusCode: 400,
      message: 'Consent messages with IDs 999 not found',
      error: 'Bad Request'
    }
  },
  DESCRIPTIONS: {
    OPERATION: 'Save organization consent by organizationId and consent message IDs. This endpoint creates consent records.',
    ORGANIZATION_ID: 'Organization Id of the user',
    CONSENT_IDS: 'Array of consent message IDs that organization accepts',
    SUCCESS: 'Organization consent saved successfully',
    VALIDATION_ERROR: 'Invalid request data or consent IDs not found',
  }
} as const;
