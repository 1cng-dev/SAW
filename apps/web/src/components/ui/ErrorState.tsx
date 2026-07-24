import { Alert, AlertIcon } from "@chakra-ui/react";

export function ErrorState({ message = "Failed to load, retrying..." }: { message?: string }) {
  return (
    <Alert status="error" variant="subtle" borderRadius="lg" fontSize="sm">
      <AlertIcon />
      {message}
    </Alert>
  );
}
