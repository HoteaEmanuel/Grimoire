export type EditState = {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string[];
  collectionIds: string[];
};

export function toEditState(item: {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
  collections: { id: string; name: string }[];
}): EditState {
  return {
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    url: item.url ?? "",
    language: item.language ?? "",
    tags: item.tags,
    collectionIds: item.collections.map((c) => c.id),
  };
}
