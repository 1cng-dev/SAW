import { useState } from "react";
import { Button, Heading, SimpleGrid, Stack, Text, Wrap } from "@chakra-ui/react";
import { NEWS_CATEGORIES, NEWS_FEEDS } from "@sec1cng/shared";
import { useNews } from "../api/hooks";
import { NewsCard } from "../components/news/NewsCard";
import { ErrorState } from "../components/ui/ErrorState";
import { SkeletonCard } from "../components/ui/Skeleton";

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Button
      size="xs"
      borderRadius="full"
      variant={active ? "solid" : "outline"}
      colorScheme={active ? "blue" : "gray"}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

export function NewsPage() {
  const [source, setSource] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();

  const query = useNews({ source, category, pageSize: 30 });

  return (
    <Stack spacing={4}>
      <Heading size="md">Latest Security News</Heading>

      <Wrap spacing={2}>
        <FilterChip label="All Sources" active={!source} onClick={() => setSource(undefined)} />
        {NEWS_FEEDS.map((feed) => (
          <FilterChip key={feed.name} label={feed.name} active={source === feed.name} onClick={() => setSource(feed.name)} />
        ))}
      </Wrap>

      <Wrap spacing={2}>
        <FilterChip label="All Categories" active={!category} onClick={() => setCategory(undefined)} />
        {NEWS_CATEGORIES.map((cat) => (
          <FilterChip key={cat} label={cat} active={category === cat} onClick={() => setCategory(cat)} />
        ))}
      </Wrap>

      {query.isError && <ErrorState />}
      {query.isLoading ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </SimpleGrid>
      ) : query.data && query.data.data.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {query.data.data.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </SimpleGrid>
      ) : (
        <Text fontSize="sm" color="text.muted">
          No news articles match this filter.
        </Text>
      )}
    </Stack>
  );
}
