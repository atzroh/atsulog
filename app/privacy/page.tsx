import type { Metadata } from "next";
import { MarkdownRenderer } from "@/app/components/markdown/markdown-renderer";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

const content = `
## Analytics

This site uses Google Analytics, a web analytics service provided by Google, to understand how visitors use the site. Google Analytics uses cookies to collect data. The data is collected anonymously and does not identify individuals.

You can opt out of this collection by disabling cookies in your browser settings. For more information, see [How Google uses information from sites or apps that use our services](https://policies.google.com/technologies/partner-sites).

## Disclaimer

While I strive to provide accurate information in the articles on this site, I make no guarantees as to its accuracy or safety. I accept no liability for any damage arising from the use of information on this site.

I am also not responsible for the information or services provided on sites linked from this site.

## Copyright

The copyright of the text and images on this site belongs to the site owner. Please do not reproduce them beyond the scope of fair quotation without permission.

## Changes to This Policy

This policy may be changed without prior notice when necessary. Any changes take effect as soon as they are posted on this page.
`;

export default function PrivacyPage() {
  return (
    <article className="py-10">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          Privacy Policy
        </h1>
      </header>

      <MarkdownRenderer content={content} />
    </article>
  );
}
