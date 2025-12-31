import Head from "next/head";
import App, { AppProps, AppContext } from "next/app";
import Layout from "../layouts/layout";
import '../globals.css'
import Script from "next/script";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
      <script defer src="https://cdn.adsconex.com/js/adsconex-banner-bw-feji-rl.js"></script>  
        
        {/* --- HẾT Mã FEJI (HEAD) --- */}
      </Head>
{/* 🔥 TABOOLA SCRIPT — đặt ngoài HEAD */}
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
      '//cdn.taboola.com/libtrc/metaconex-anhusfejiio/loader.js',
      'tb_loader_script'
    );

    if(window.performance && typeof window.performance.mark === 'function') {
      window.performance.mark('tbl_ic');
    }
  `}
</Script>



  {/* <!-- Metaconex tag (gtag.js) --> */}
<Script defer src="https://adsconex.com/js/config.js" data-config="all" strategy="beforeInteractive"></Script>
<meta name="verification" content="LWw9ipN7kY"></meta>

      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

MyApp.getInitialProps = async (context: AppContext) => {
  const appProps = await App.getInitialProps(context);
  return {
    ...appProps,
  };
};
