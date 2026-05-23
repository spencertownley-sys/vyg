import { SiteHeader } from "@/components/header";
import { SiteFooter } from "@/components/footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteHeader />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
