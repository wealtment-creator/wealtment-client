// import type { Metadata } from "next";
import "./globals.css";
// import { ConditionalShell } from "@/components/layout/ConditionalShell";
// import { Toaster } from "react-hot-toast";

// export const metadata: Metadata = {
//   title: "Wealtment Limited – Professional Forex & Crypto Trading",
//   description: "Grow your capital with Wealtment Limited. Professional trading on Forex markets. UK registered. Instant withdrawals.",
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <head>
//         <link rel="preconnect" href="https://fonts.googleapis.com" />
//         <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
//         <link
//           href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap"
//           rel="stylesheet"
//         />
//       </head>
//       <body>
//         <Toaster
//           position="top-right"
//           toastOptions={{
//             style: {
//               background: "#0b1623",
//               color: "#e8edf5",
//               border: "1px solid rgba(255,255,255,0.1)",
//               fontFamily: "DM Sans, sans-serif",
//               fontSize: "0.875rem",
//             },
//           }}
//         />
//         <ConditionalShell>{children}</ConditionalShell>
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import Script from "next/script";
import { ConditionalShell } from "@/components/layout/ConditionalShell";
import { Toaster } from "react-hot-toast";
// import { useInactivityLogout } from "@/hooks/useInactivityLogout";

export const metadata: Metadata = {
  title: "Wealtment Limited – Professional Forex & Crypto Trading",
  description:
    "Grow your capital with Wealtment Limited. Professional trading on Forex markets. UK registered. Instant withdrawals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />

        {/* Google Analytics */}
        <Script
         src="https://www.googletagmanager.com/gtag/js?id=G-EPJJ19H7B1"
          strategy="afterInteractive"
        />
        <Script id="ga-script" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Y5H6DHDF0W');
          `}
        </Script>
      </head>

      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0b1623",
              color: "#e8edf5",
              border: "1px solid rgba(255,255,255,0.1)",
              fontFamily: "DM Sans, sans-serif",
              fontSize: "0.875rem",
            },
          }}
        />

        <ConditionalShell>{children}
          
          <Script id="tawkto" strategy="afterInteractive">
  {`
    var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
    (function () {
      var s1 = document.createElement("script"),
          s0 = document.getElementsByTagName("script")[0];
      s1.async = true;
      s1.src='https://embed.tawk.to/69e97ee870bd931c2d03b858/1jms1ffkd';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      s0.parentNode.insertBefore(s1, s0);
    })();
  `}
</Script>
        </ConditionalShell>
      </body>
    </html>
  );
}


