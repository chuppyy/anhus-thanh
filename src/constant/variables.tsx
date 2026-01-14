import Script from "next/script";
import { API_BASE_URL } from "./api-config";

export const VARIABLES = {
  appApi: API_BASE_URL,
  appApi2: API_BASE_URL,
  nextPublicAppApi: API_BASE_URL,
  nextPublicAppApi2: API_BASE_URL,
  verificationCode: "LWw9ipN7kY",

  // Taboola
  tabolaPublisherId: "anhusfejiio",

  // Google Ads
  googleAnalytics: "G-5T8RGH9Y7E",




  // MGID
  mgWidgetId1: "1903360",
  mgWidgetId2: "1903360",
  mgWidgetFeedId: "1903357",
  adsKeeperSrc: "https://jsc.mgid.com/site/1066309.js",

  // Other
  year: "2026",
};

export const SCRIPTS = {
  /**
   * SCRIPTS FOR ARTICLE PAGES ONLY (moved from layout)
   */
  tabolaScript: (
    <Script id="taboola-script" strategy="afterInteractive">
      {`
            window._taboola = window._taboola || [];
            _taboola.push({article:'auto'});
            !function (e, f, u, i) {
              if (!document.getElementById(i)){
                e.async = 1;
                e.src = u;
                e.id = i;
                f.parentNode.insertBefore(e, f);
              }
            }(
              document.createElement('script'),
              document.getElementsByTagName('script')[0],
              '//cdn.taboola.com/libtrc/metaconex-${VARIABLES.tabolaPublisherId}/loader.js',
              'tb_loader_script'
            );

            if(window.performance && typeof window.performance.mark === 'function') {
              window.performance.mark('tbl_ic');
            }
          `.replace('${VARIABLES.tabolaPublisherId}', VARIABLES.tabolaPublisherId)}
    </Script>
  ),
  metaconexScript: (
    <Script
      defer
      src="https://adsconex.com/js/config.js"
      data-config="all"
      strategy="beforeInteractive"
    ></Script>
  ),

  /**
   * GOOGLE ANALYTICS Script - Loaded at the slug page (article detail page)
   */
  googleAnalyticsScript: (
    <>
      <Script
        id="gg-1"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${VARIABLES.googleAnalytics}`}
      />
      <Script id="gg-2" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${VARIABLES.googleAnalytics}');
        `}
      </Script>
    </>
  ),

  /**
   * AD SCRIPTS - Loaded at the slug page (article detail page)
   */
  adsKeeperScript: (
    <Script src={VARIABLES.adsKeeperSrc} strategy="afterInteractive"></Script>
  ),

  adsconexPlayerScript: (
    <Script
      defer
      src="https://cdn.adsconex.com/js/adsconex-player.js"
      strategy="afterInteractive"
    />
  ),
  adsconexBannerScript: (
    <Script
      defer
      src="https://cdn.adsconex.com/js/adsconex-banner-bw-feji-rl.js"
      strategy="afterInteractive"
    />
  ),
  googleAdManagerScript: (
    <>
      <Script
        async
        src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"
        strategy="afterInteractive"
      />
      <Script id="google-ad-manager-init" strategy="afterInteractive">
        {`
          window.googletag = window.googletag || {cmd: []};
        `}
      </Script>
    </>
  ),
};
