export const metadata = {
  title: "FlashBack — History is out of order. Fix it!",
  description: "Sort 7 historical events. Race the clock. Challenge the world.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
            <link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#2D1B4E" />
     <meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />       
      </head>
      <body style={{ margin: 0, background: "#FFFFFF" }}>{children}</body>
    </html>
  );
}
