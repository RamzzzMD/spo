import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "Ranzz API Downloader",
  description: "AIO Downloader Web."
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
