"use client";

import { useEffect } from "react";

/**
 * Client component to dynamically load ad scripts after hydration
 * This ensures DOM containers exist before scripts execute
 * 
 * Uses requestIdleCallback and retries to ensure reliability
 */
export const AdScriptsLoader = () => {
    useEffect(() => {
        // Wait for DOM to be fully ready and containers to exist
        const waitForContainers = (
            containerIds: string[],
            callback: () => void,
            maxRetries = 10,
            retryDelay = 200
        ) => {
            let retries = 0;

            const check = () => {
                const allExist = containerIds.every((id) =>
                    document.getElementById(id)
                );

                if (allExist) {
                    callback();
                } else if (retries < maxRetries) {
                    retries++;
                    setTimeout(check, retryDelay);
                } else {
                    // Load anyway after max retries
                    console.warn("[AdScriptsLoader] Containers not found, loading scripts anyway");
                    callback();
                }
            };

            // Use requestIdleCallback if available for better performance
            if ("requestIdleCallback" in window) {
                (window as unknown as { requestIdleCallback: (cb: () => void) => void })
                    .requestIdleCallback(check);
            } else {
                setTimeout(check, 100);
            }
        };

        // Helper function to load script dynamically
        const loadScript = (
            src: string,
            options: { defer?: boolean; async?: boolean; id?: string } = {}
        ): Promise<void> => {
            return new Promise((resolve, reject) => {
                // Check if script already exists
                if (document.querySelector(`script[src="${src}"]`)) {
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

        // Container IDs that ads need
        const adContainerIds = [
            "div_adsconex_banner_responsive_1",
            "adsconex-video-container",
        ];

        // Wait for containers then load scripts
        waitForContainers(adContainerIds, async () => {
            try {
                // Load scripts in correct order with proper timing
                // 1. Adsconex Player (defer) - must load first
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

                // 3. Adsconex Banner (defer) - load after player
                await loadScript("https://cdn.adsconex.com/js/adsconex-banner-bw-feji-rl.js", {
                    defer: true,
                    id: "adsconex-banner",
                });

            } catch (error) {
                console.error("[AdScriptsLoader] Error loading scripts:", error);
            }
        });
    }, []);

    return null;
};
