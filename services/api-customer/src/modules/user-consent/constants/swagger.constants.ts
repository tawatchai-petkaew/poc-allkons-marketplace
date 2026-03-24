export const USER_CONSENT_SWAGGER = {
  EXAMPLES: {
    SUCCESS_RESPONSE: {
      message: 'User consent saved successfully',
      saved: [
        {
          type: 'privacy_policy',
          version: 'v2.0',
          accepted_at: '2025-06-11T09:10:00Z'
        },
        {
          type: 'manufacturer_consent',
          version: 'v1.0',
          accepted_at: '2025-06-11T09:10:00Z'
        }
      ]
    },
    REQUEST_SINGLE: {
      phone: '0891234567',
      consentIds: [1]
    },
    REQUEST_MULTIPLE: {
      phone: '0891234567',
      consentIds: [1, 2, 3]
    },
    VALIDATION_ERROR: {
      statusCode: 400,
      message: 'Consent messages with IDs 999 not found',
      error: 'Bad Request'
    },
    NOT_FOUND_ERROR: {
      statusCode: 404,
      message: 'User with phone number 0891234567 not found',
      error: 'Not Found'
    }
  },
  DESCRIPTIONS: {
    OPERATION: 'Save user consent by phone number and consent message IDs. This endpoint finds the user by phone number and creates consent records.',
    PHONE: 'Phone number of the user',
    CONSENT_IDS: 'Array of consent message IDs that user accepts',
    SUCCESS: 'User consent saved successfully',
    VALIDATION_ERROR: 'Invalid request data or consent IDs not found',
    NOT_FOUND: 'User not found'
  }
} as const;
