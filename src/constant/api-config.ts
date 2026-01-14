/**
 * ⚙️ CENTRAL API CONFIGURATION
 * 
 * Thay đổi domain API tại đây - CHỈ 1 CHỖ DUY NHẤT!
 * Change API domain here - ONLY ONE PLACE!
 */
export const API_BASE_URL = "https://apisporttestt.vbonews.com";

/**
 * Backup URL for fallback when API fails or returns empty data
 * Format: {BACKUP_BASE_URL}/{articleId}.json
 */
export const BACKUP_BASE_URL = "https://file.lifenews247.com/sportnews/backup";

/**
 * Extract hostname from URL for Next.js config
 */
export const API_HOSTNAME = new URL(API_BASE_URL).hostname;
