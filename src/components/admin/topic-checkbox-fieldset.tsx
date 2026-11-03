import type { Topic } from "@/lib/content/types";

type Props = {
  topics: Topic[];
  legend: string;
  hint: string;
  name?: string;
  defaultSelected?: string[];
};

export function TopicCheckboxFieldset({
  topics,
  legend,
  hint,
  name = "topicSlugs",
  defaultSelected = [],
}: Props) {
  if (topics.length === 0) return null;
  const selected = new Set(defaultSelected);

  return (
    <fieldset className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
      <legend className="px-1 text-sm font-medium">{legend}</legend>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <div className="flex flex-wrap gap-3">
        {topics.map((topic) => (
          <label
            key={topic.slug}
            className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm has-[:checked]:border-primary"
          >
            <input
              type="checkbox"
              name={name}
              value={topic.slug}
              defaultChecked={selected.has(topic.slug)}
              className="mt-0.5 size-4 rounded border-border"
            />
            <span>
              <span className="font-medium">#{topic.name}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {topic.description}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
