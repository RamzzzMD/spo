import "./globals.css";

export const metadata = {
  title: "Ranzz AIO Downloader",
  description: "All-in-One downloader with Spotify-style search UI."
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
