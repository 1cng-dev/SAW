import { Box, Skeleton as ChakraSkeleton, Stack } from "@chakra-ui/react";

export { ChakraSkeleton as Skeleton };

export function SkeletonCard() {
  return (
    <Box borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" p={4}>
      <Stack spacing={3}>
        <ChakraSkeleton height="4" width="65%" />
        <ChakraSkeleton height="3" />
        <ChakraSkeleton height="3" width="85%" />
        <ChakraSkeleton height="3" width="35%" />
      </Stack>
    </Box>
  );
}
