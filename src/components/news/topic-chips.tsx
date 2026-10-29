import Link from "next/link";
import type { Topic } from "@/lib/content/types";

export function TopicChips({ topics }: { topics: Topic[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((topic) => (
        <Link
          key={topic.slug}
          href={`/topik/${topic.slug}`}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
        >
          #{topic.name}
        </Link>
      ))}
    </div>
  );
}
