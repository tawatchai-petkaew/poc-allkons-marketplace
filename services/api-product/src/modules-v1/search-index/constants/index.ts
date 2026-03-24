// Search Index Queue Names
export const SEARCH_INDEX_QUEUE = 'search-index';
export const SEARCH_INDEX_JOB_SYNC = 'sync';
export const SEARCH_INDEX_JOB_BULK_REBUILD = 'bulk-rebuild';

// Cache Keys
export const CACHE_KEY_SYNONYMS = 'search:synonyms';
export const CACHE_KEY_PRODUCT_VARIANT = 'search:pv:';
export const CACHE_KEY_CATEGORIES = 'search:categories';
export const PENDING_PV_SET_KEY = 'pending:product_variants';

// Configuration Defaults
export const DEFAULT_CDC_POLL_INTERVAL = 10000; // 10 seconds
export const DEFAULT_AGGREGATION_WINDOW = 30000; // 30 seconds
export const DEFAULT_BATCH_SIZE = 100;
export const DEFAULT_ES_BULK_SIZE = 100;
export const DEFAULT_ES_PARALLEL_WORKERS = 2;

// Error Handling
export const MAX_ERROR_COUNT = 3; // Skip record after 3 failed attempts

// Cache TTL (in seconds)
export const L1_CACHE_TTL = 300; // 5 minutes
export const L2_CACHE_TTL = 1800; // 30 minutes
export const SYNONYM_CACHE_TTL = 3600; // 1 hour

// Dynamic Chunking Thresholds
export const CPU_HIGH_THRESHOLD = 80;
export const CPU_LOW_THRESHOLD = 50;
export const QUEUE_DEPTH_HIGH = 5000;
export const CHUNK_SIZE_SMALL = 500;
export const CHUNK_SIZE_DEFAULT = 1000;
export const CHUNK_SIZE_LARGE = 2000;
