import { VARIABLES } from "@/constant/variables";
import { BACKUP_BASE_URL } from "@/constant/api-config";
import { Article, NewsGroup } from "@/types/article";
import { extractIdFromSlug } from "@/utils/data";
import { fetchWithRetry, fetchWithTimeout } from "@/utils/fetch-helper";
import { unstable_cache } from "next/cache";

type ArticleResponse = {
  data: Article[];
};

/**
 * Backup article structure from R2 JSON files
 */
type BackupArticle = {
  name: string;
  content: string;
  avatarLink: string;
  dateTimeStart: string;
};

/**
 * Fetch article from R2 backup when API fails or returns empty data
 * 
 * Cache Strategy: force-cache for maximum performance
 * - Backup files are static and immutable
 */
const fetchFromBackup = async (id: string): Promise<Article | null> => {
  try {
    // Use fetchWithTimeout with 5s timeout (same as main API)
    const response = await fetchWithTimeout(`${BACKUP_BASE_URL}/${id}.json`, {
      cache: "force-cache", // Aggressively cache backup files
    });

    if (!response.ok) {
      console.warn(`Backup not found for article ${id}`);
      return null;
    }

    const backup: BackupArticle = await response.json();

    // Validate backup has required name field
    if (!backup.name) {
      console.warn(`Backup for article ${id} has empty name`);
      return null;
    }

    // Convert backup format to Article format
    return {
      name: backup.name,
      content: backup.content,
      avatarLink: backup.avatarLink,
      dateTimeStart: backup.dateTimeStart,
      userCode: "", // Default empty userCode for backup articles
    };
  } catch (error) {
    console.error(`Failed to fetch backup for article ${id}:`, error);
    return null;
  }
};

/**
 * Fetch articles from origin API
 * 
 * Cache Strategy: force-cache for maximum performance
 * - Articles are immutable (content doesn't change)
 * - High traffic: ~10M views/month
 * - Minimize API calls to reduce server load
 * 
 * Fallback: If API fails or returns empty name, fetch from R2 backup
 */
export const fetchArticlesFromAPI = async (id: string): Promise<Article[]> => {
  try {
    const response = await fetchWithRetry(
      `${VARIABLES.nextPublicAppApi}/News/news-detailvip?id=${encodeURIComponent(id)}`,
      {
        cache: "force-cache", // Aggressively cache - articles are immutable
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      // API failed, try backup
      console.warn(`API failed for article ${id}, trying backup...`);
      const backupArticle = await fetchFromBackup(id);
      return backupArticle ? [backupArticle] : [];
    }

    const data: ArticleResponse = await response.json();
    const articles = Array.isArray(data.data) ? data.data : [data.data];

    // Check if first article has valid name, if not try backup
    if (!articles.length || !articles[0]?.name) {
      console.warn(`API returned empty data for article ${id}, trying backup...`);
      const backupArticle = await fetchFromBackup(id);
      return backupArticle ? [backupArticle] : [];
    }

    return articles;
  } catch (error) {
    console.error(`Failed to fetch articles ${id}:`, error);

    // API error, try backup as last resort
    console.warn(`Trying backup for article ${id} after error...`);
    const backupArticle = await fetchFromBackup(id);
    return backupArticle ? [backupArticle] : [];
  }
};

/**
 * Get article with smart cache strategy:
 * - Success: Cache for 7 days (articles are immutable)
 * - Failure: Cache for 1 minute (retry soon)
 */
export const getArticles = async (slug: string): Promise<Article[]> => {
  const id = extractIdFromSlug(slug);
  if (!id) return [];

  // Cache for successful fetches - 7 days
  const getCachedArticles = unstable_cache(
    async () => {
      const articles = await fetchArticlesFromAPI(id);
      if (!articles || articles.length === 0) {
        // Throw to prevent caching empty result in success cache
        throw new Error(`Articles ${id} not found`);
      }
      return articles;
    },
    [`articles-${id}`],
    {
      revalidate: 604800, // 7 days
      tags: [`articles-${id}`],
    }
  );

  // Cache for failed fetches - 1 minute (retry soon)
  const getCachedEmptyResult = unstable_cache(
    async () => {
      // Return empty array marker for failed attempts
      return [] as Article[];
    },
    [`articles-failed-${id}`],
    {
      revalidate: 60, // 1 minute - retry soon
      tags: [`articles-failed-${id}`],
    }
  );

  try {
    return await getCachedArticles();
  } catch (error) {
    console.error(`Error getting articles ${id}:`, error);

    // Cache the failure for 1 minute to avoid hammering the API
    // After 1 minute, next request will try again
    return await getCachedEmptyResult();
  }
};

/**
 * Get a new list of articles
 * 
 * Cache Strategy: force-cache with 24-hour revalidate
 * - News list updates periodically but not frequently
 * - Low homepage traffic, high article traffic
 */
export const getNewsList = async (): Promise<NewsGroup[]> => {
  try {
    const response = await fetch(`${VARIABLES.appApi2}/News/news-list`, {
      cache: "force-cache", // Aggressively cache for performance
      next: {
        revalidate: 86400, // 24 hours = 1 day
        tags: ["news-list"], // Allow manual revalidation if needed
      },
    });
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};
