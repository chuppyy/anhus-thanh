"use client";

import { useEffect } from "react";

/**
 * Client component to dynamically load ad scripts after hydration
 * Uses MutationObserver to detect when ad containers appear in dynamically loaded content
 */
export const AdScriptsLoader = () => {
    useEffect(() => {
        let scriptsLoaded = false;
        let observer: MutationObserver | null = null;

        // Helper function to load script dynamically
        const loadScript = (
            src: string,
            options: { defer?: boolean; async?: boolean; id?: string } = {}
        ): Promise<void> => {
            return new Promise((resolve, reject) => {
                // Check if script already exists
                const existing = document.querySelector(`script[src="${src}"]`);
                if (existing) {
                    resolve();
                    return;
                }

                const script = document.createElement("script");
                script.src = src;
                if (options.defer) script.defer = true;
                if (options.async) script.async = true;
                if (options.id) script.id = options.id;

                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Failed to load ${src}`));

                document.body.appendChild(script);
            });
        };

        // Load all ad scripts
        const loadAdScripts = async () => {
            if (scriptsLoaded) return;
            scriptsLoaded = true;

            console.log("[AdScriptsLoader] Loading ad scripts...");

            try {
                // Load scripts in correct order
                // 1. Adsconex Player (defer)
                await loadScript("https://cdn.adsconex.com/js/adsconex-player.js", {
                    defer: true,
                    id: "adsconex-player",
                });

                // 2. Google Publisher Tag (async)
                loadScript("https://securepubads.g.doubleclick.net/tag/js/gpt.js", {
                    async: true,
                    id: "gpt-js",
                });

                // Initialize googletag
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any).googletag = (window as any).googletag || { cmd: [] };

                // 3. Adsconex Banner (defer)
                await loadScript("https://cdn.adsconex.com/js/adsconex-banner-bw-feji-rl.js", {
                    defer: true,
                    id: "adsconex-banner",
                });

                console.log("[AdScriptsLoader] All scripts loaded successfully");
            } catch (error) {
                console.error("[AdScriptsLoader] Error loading scripts:", error);
            }
        };

        // Specific ad container IDs from API content
        const adContainerIds = [
            // Parallax ads
            "js_adsconex_parallax_1",
            "js_adsconex_parallax_2",
            // Inpage ads
            "div_adsconex_inpage_1",
            "div_adsconex_inpage_2",
            // Banner responsive ads (1-18)
            "div_adsconex_banner_responsive_1",
            "div_adsconex_banner_responsive_2",
            "div_adsconex_banner_responsive_3",
            "div_adsconex_banner_responsive_4",
            "div_adsconex_banner_responsive_5",
            "div_adsconex_banner_responsive_6",
            "div_adsconex_banner_responsive_7",
            "div_adsconex_banner_responsive_8",
            "div_adsconex_banner_responsive_9",
            "div_adsconex_banner_responsive_11",
            "div_adsconex_banner_responsive_12",
            "div_adsconex_banner_responsive_13",
            "div_adsconex_banner_responsive_14",
            "div_adsconex_banner_responsive_15",
            "div_adsconex_banner_responsive_16",
            "div_adsconex_banner_responsive_17",
            "div_adsconex_banner_responsive_18",
            // Taboola
            "qctaboo-mid",
            // Video container
            "adsconex-video-container",
        ];

        // Check if any ad container exists in DOM
        const checkForAdContainers = (): boolean => {
            for (const id of adContainerIds) {
                if (document.getElementById(id)) {
                    console.log(`[AdScriptsLoader] Found container: ${id}`);
                    return true;
                }
            }
            return false;
        };

        // Use MutationObserver to wait for ad containers in dynamic content
        const setupObserver = () => {
            // First check if containers already exist
            if (checkForAdContainers()) {
                console.log("[AdScriptsLoader] Ad containers found immediately");
                loadAdScripts();
                return;
            }

            // Set up observer to watch for new elements
            observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                        // Check added nodes and their children
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const element = node as Element;
                                // Check if this element or any child has ad container ID
                                for (const id of adContainerIds) {
                                    if (element.id === id || element.querySelector(`#${id}`)) {
                                        console.log(`[AdScriptsLoader] Detected container via MutationObserver: ${id}`);
                                        loadAdScripts();
                                        observer?.disconnect();
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            });

            // Observe the entire document for changes
            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });

            // Fallback: load scripts after timeout
            setTimeout(() => {
                if (!scriptsLoaded) {
                    console.log("[AdScriptsLoader] Timeout reached, loading scripts anyway");
                    loadAdScripts();
                    observer?.disconnect();
                }
            }, 2000); // 2 second timeout
        };

        // Start observing after initial render
        const timeoutId = setTimeout(setupObserver, 50);

        // Cleanup
        return () => {
            clearTimeout(timeoutId);
            observer?.disconnect();
        };
    }, []);

    return null;
};
