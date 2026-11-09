import { siteConfig } from "@/app/lib/site-config";
import { CanvasSphere } from "@/app/components/home/canvas-sphere";

/** The home page opener: a small turning sphere beside two lines of caps. */
export function HeroTitle({ count }: { count: number }) {
  return (
    <section className="flex items-center gap-6 py-16">
      {/* The header already shows the name, so the heading is for screen readers. */}
      <h1 className="sr-only">{siteConfig.title}</h1>
      <div className="relative size-14 shrink-0">
        <CanvasSphere />
      </div>
      <div className="flex flex-col gap-2.5 text-xs uppercase tracking-[0.32em]">
        <p className="text-foreground">{siteConfig.tagline}</p>
        <p className="text-muted">
          {count} {count === 1 ? "entry" : "entries"} since{" "}
          {siteConfig.sinceYear}
        </p>
      </div>
    </section>
  );
}
