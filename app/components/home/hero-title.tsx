import { siteConfig } from "@/app/lib/site-config";
import { CanvasSphere } from "@/app/components/home/canvas-sphere";

export function HeroTitle() {
  return (
    <section className="relative flex items-center justify-center py-20 sm:py-[8.333rem] w-full overflow-hidden">
      <CanvasSphere />
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl sm:text-6xl leading-tight tracking-tighter text-foreground">
          <span className="font-light text-muted">Welcome to</span>{" "}
          <span className="font-light">{siteConfig.title}</span>
        </h1>
      </div>
    </section>
  );
}
