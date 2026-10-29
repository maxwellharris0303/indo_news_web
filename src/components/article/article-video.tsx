export function ArticleVideo({ url, title }: { url: string; title: string }) {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-border">
      <div className="aspect-video w-full bg-black">
        <iframe
          src={url}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
