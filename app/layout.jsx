import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Ranzz Play",
  description: "Professional web play music with background player and AIO downloader."
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
