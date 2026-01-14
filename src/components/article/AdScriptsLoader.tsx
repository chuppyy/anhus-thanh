"use client";

import { useEffect } from "react";

/**
 * Client component to dynamically load ad scripts after hydration
 * This ensures DOM containers exist before scripts execute
 */
export const AdScriptsLoader = () => {
    useEffect(() => {
        // Helper function to load script dynamically
        const loadScript = (
            src: string,
            options: { defer?: boolean; async?: boolean; id?: string } = {}
        ) => {
            // Check if script already exists
            if (document.querySelector(`script[src="${src}"]`)) {
                return;
            }
            const script = document.createElement("script");
            script.src = src;
            if (options.defer) script.defer = true;
            if (options.async) script.async = true;
            if (options.id) script.id = options.id;
            document.body.appendChild(script);
        };

        // Load ad scripts in the correct order
        // 1. Adsconex Player (defer)
        loadScript("https://cdn.adsconex.com/js/adsconex-player.js", {
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
        loadScript("https://cdn.adsconex.com/js/adsconex-banner-bw-feji-rl.js", {
            defer: true,
            id: "adsconex-banner",
        });
    }, []);

    return null;
};
