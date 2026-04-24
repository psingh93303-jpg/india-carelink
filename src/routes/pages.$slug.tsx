import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { RenderRichText } from "@/components/RichTextEditor";
import { supabase } from "@/integrations/supabase/client";

type CmsPage = { title: string; slug: string; content: Record<string, unknown> };

export const Route = createFileRoute("/pages/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await (supabase as any)
      .from("cms_pages")
      .select("title,slug,content")
      .eq("slug", params.slug)
      .single();
    if (error || !data) throw notFound();
    return data as CmsPage;
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.title} — CareLink India` },
      { name: "description", content: `${loaderData.title} on CareLink India.` },
    ] : [],
  }),
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <Button asChild className="mt-4"><Link to="/">Go home</Link></Button>
    </div>
  ),
  component: CmsPublicPage,
});

function CmsPublicPage() {
  const page = Route.useLoaderData() as CmsPage;
  return (
    <article className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <RenderRichText content={page.content} />
      </div>
    </article>
  );
}