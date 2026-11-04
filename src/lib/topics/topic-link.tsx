import Link from "next/link";
import type { Topic } from "@/lib/content/types";
import { cn } from "@/lib/utils";

const chipClass =
  "border border-border bg-card px-2.5 py-1 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary";

export function TopicLink({
  topic,
  className,
}: {
  topic: Pick<Topic, "slug" | "name">;
  className?: string;
}) {
  return (
    <Link href={`/topik/${topic.slug}`} className={cn(chipClass, className)}>
      {topic.name}
    </Link>
  );
}

export function TopicLinkList({ topics }: { topics: Topic[] }) {
  if (topics.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((topic) => (
        <TopicLink key={topic.slug} topic={topic} />
      ))}
    </div>
  );
}
