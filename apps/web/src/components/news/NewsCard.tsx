import { Link } from "@tanstack/react-router";
import { Box, HStack, LinkBox, LinkOverlay, Tag, Text, Wrap } from "@chakra-ui/react";
import { ExternalLink, Skull } from "lucide-react";
import type { NewsArticle } from "../../api/types";

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <LinkBox
      as={Box}
      borderWidth="1px"
      borderColor="border.default"
      bg="bg.surface"
      borderRadius="xl"
      p={4}
      transition="border-color 0.15s ease"
      _hover={{ borderColor: "accent.solid" }}
    >
      <HStack justify="space-between" fontSize="xs" color="text.muted" mb={2}>
        <Text>{article.sourceName}</Text>
        {article.category && (
          <Tag size="sm" variant="subtle">
            {article.category}
          </Tag>
        )}
      </HStack>
      <HStack align="start" justify="space-between" spacing={2}>
        <LinkOverlay href={article.sourceUrl} isExternal>
          <Text fontSize="sm" fontWeight="medium">
            {article.title}
          </Text>
        </LinkOverlay>
        <ExternalLink size={14} style={{ flexShrink: 0, marginTop: 2, opacity: 0.5 }} />
      </HStack>
      {article.excerpt && (
        <Text mt={2} fontSize="sm" color="text.muted" noOfLines={3}>
          {article.excerpt}
        </Text>
      )}
      {(article.relatedCveIds.length > 0 || article.relatedRansomwareGroups.length > 0) && (
        <Wrap mt={2} spacing={1}>
          {article.relatedCveIds.map((id) => (
            <Tag key={id} size="sm" fontFamily="mono" fontSize="10px" variant="subtle">
              {id}
            </Tag>
          ))}
          {article.relatedRansomwareGroups.map((group) => (
            <Link key={group} to="/ransomware-tracker">
              <Tag size="sm" fontSize="10px" variant="subtle" colorScheme="red">
                <HStack spacing={1}>
                  <Skull size={10} />
                  <Text as="span">{group}</Text>
                </HStack>
              </Tag>
            </Link>
          ))}
        </Wrap>
      )}
      {article.publishedDate && (
        <Text mt={2} fontSize="xs" color="text.muted">
          {new Date(article.publishedDate).toLocaleDateString()}
        </Text>
      )}
    </LinkBox>
  );
}
