import { Link } from "@tanstack/react-router";
import { Box, HStack, LinkBox, LinkOverlay, Tag, Text, Wrap, Badge, useColorModeValue, VStack, Flex } from "@chakra-ui/react";
import { ExternalLink, Skull, Clock, Newspaper } from "lucide-react";
import type { NewsArticle } from "../../api/types";

export function NewsCard({ article }: { article: NewsArticle }) {
  const cardBg = useColorModeValue("white", "charcoal.800");
  const hoverShadow = useColorModeValue("0 4px 12px rgba(0,0,0,0.08)", "0 0 0 1px #2a2a2a, 0 8px 20px rgba(249,115,22,0.08)");

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'malware': return 'red';
      case 'ransomware': return 'orange';
      case 'vulnerability': return 'yellow';
      case 'breach': return 'purple';
      case 'apt': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <LinkBox
      as={Box}
      borderWidth="1px"
      borderColor="border.default"
      bg={cardBg}
      borderRadius="xl"
      p={5}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{ 
        borderColor: "accent.solid",
        boxShadow: hoverShadow,
        transform: 'translateY(-2px)'
      }}
      position="relative"
      overflow="hidden"
    >
      {/* Animated gradient overlay on hover */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient="linear-gradient(135deg, rgba(249, 115, 22, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%)"
        opacity={0}
        transition="opacity 0.3s ease"
        _hover={{ opacity: 1 }}
        pointerEvents="none"
      />
      
      <VStack spacing={3} align="stretch" position="relative">
        {/* Header with source and category */}
        <Flex justify="space-between" align="start">
          <HStack spacing={2}>
            <Newspaper size={14} color="#22d3ee" />
            <Text fontSize="xs" fontWeight="medium" color="text.muted">
              {article.sourceName}
            </Text>
          </HStack>
          {article.category && (
            <Badge 
              colorScheme={getCategoryColor(article.category)} 
              variant="subtle"
              fontSize="xs"
              px={2}
              py={1}
              borderRadius="md"
            >
              {article.category}
            </Badge>
          )}
        </Flex>

        {/* Title with external link */}
        <HStack align="start" justify="space-between" spacing={2}>
          <LinkOverlay href={article.sourceUrl} isExternal flex={1}>
            <Text 
              fontSize="sm" 
              fontWeight="semibold" 
              noOfLines={2}
              lineHeight="tall"
              _hover={{ color: "accent.400" }}
              transition="color 0.2s ease"
            >
              {article.title}
            </Text>
          </LinkOverlay>
          <ExternalLink 
            size={14} 
            style={{ flexShrink: 0, marginTop: 2, opacity: 0.5 }} 
            color="text.muted"
          />
        </HStack>

        {/* Excerpt */}
        {article.excerpt && (
          <Text fontSize="sm" color="text.muted" noOfLines={3} lineHeight="tall">
            {article.excerpt}
          </Text>
        )}

        {/* Related CVEs and Ransomware Groups */}
        {(article.relatedCveIds.length > 0 || article.relatedRansomwareGroups.length > 0) && (
          <Wrap spacing={1}>
            {article.relatedCveIds.slice(0, 3).map((id) => (
              <Tag 
                key={id} 
                size="sm" 
                fontFamily="mono" 
                fontSize="10px" 
                variant="subtle"
                colorScheme="orange"
                px={2}
                py={1}
                borderRadius="md"
              >
                {id}
              </Tag>
            ))}
            {article.relatedCveIds.length > 3 && (
              <Tag size="sm" fontSize="10px" variant="subtle" colorScheme="gray">
                +{article.relatedCveIds.length - 3}
              </Tag>
            )}
            {article.relatedRansomwareGroups.slice(0, 2).map((group) => (
              <Link key={group} to="/ransomware-tracker">
                <Tag 
                  size="sm" 
                  fontSize="10px" 
                  variant="subtle" 
                  colorScheme="red"
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  <HStack spacing={1}>
                    <Skull size={10} />
                    <Text as="span">{group}</Text>
                  </HStack>
                </Tag>
              </Link>
            ))}
          </Wrap>
        )}

        {/* Footer with timestamp */}
        {article.publishedDate && (
          <HStack spacing={1} fontSize="xs" color="text.muted">
            <Clock size={12} />
            <Text>{getTimeAgo(article.publishedDate)}</Text>
          </HStack>
        )}
      </VStack>
    </LinkBox>
  );
}
