import type { Topic } from "@/lib/content/types";
import { TopicLinkList } from "@/lib/topics/topic-link";

export function TopicChips({ topics }: { topics: Topic[] }) {
  return <TopicLinkList topics={topics} />;
}
