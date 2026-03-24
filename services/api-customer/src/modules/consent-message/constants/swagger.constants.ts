export const CONSENT_MESSAGE_SWAGGER = {
  TYPES: ['privacy_policy', 'manufacturer_consent', 'agent_consent', 'marketing_consent'] as const,
  LANGUAGES: ['th', 'en'] as const,
  EXAMPLES: {
    SUCCESS_RESPONSE: {
      type: 'privacy_policy',
      version: 'v2.0',
      language: 'th',
      content: 'เราเก็บรวบรวมข้อมูลส่วนบุคคลของคุณสำหรับการสร้างบัญชีและการวิเคราะห์',
      createdAt: '2024-12-01T10:00:00Z'
    },
    VALIDATION_ERROR: {
      statusCode: 400,
      message: ['type must be one of the following values: privacy_policy, manufacturer_consent, agent_consent, marketing_consent'],
      error: 'Bad Request'
    },
    NOT_FOUND_ERROR: {
      statusCode: 404,
      message: 'Consent message not found for the specified criteria',
      error: 'Not Found'
    }
  },
  DESCRIPTIONS: {
    TYPE: 'Type of consent message',
    VERSION: 'Specific version of consent message (e.g., v1.0, v2.1)',
    LATEST: 'Get the latest version of the consent type',
    LANGUAGE: 'Language of consent message (defaults to Thai)',
    SUCCESS: 'Consent message retrieved successfully',
    VALIDATION_ERROR: 'Invalid request parameters',
    NOT_FOUND: 'Consent message not found'
  }
} as const;
