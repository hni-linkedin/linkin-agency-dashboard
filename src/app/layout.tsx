import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Linkin Agency — LinkedIn analytics & capture dashboard",
    template: "%s · Linkin Agency",
  },
  description:
    "Linkin Agency helps you capture and analyze LinkedIn data — impressions, engagements, audience insights, and search appearances.",
  keywords: ["LinkedIn", "analytics", "dashboard", "capture", "agency", "Linkin Agency"],
  authors: [{ name: "Linkin Agency" }],
  openGraph: {
    title: "Linkin Agency — LinkedIn analytics & capture dashboard",
    description:
      "Capture and analyze LinkedIn data: impressions, engagements, audience insights, and search appearances.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('la-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;})();`,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
