import { useState } from "react";
import { Box, Heading, Text, VStack, HStack, Button, Input, SimpleGrid, Alert, AlertIcon, AlertTitle, AlertDescription, Tabs, TabList, TabPanels, Tab, TabPanel, Wrap, Tag, TagLabel, TagCloseButton } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { useCves, useVendors } from "../api/hooks";
import { useWatchlist } from "../hooks/useWatchlist";
import { CveCard } from "../components/cves/CveCard";

export function WatchlistPage() {
  const { watchlist, addVendor, removeVendor } = useWatchlist();
  const [newVendor, setNewVendor] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const hasWatchedCves = watchlist.cveIds.length > 0;
  const hasVendorSubscriptions = watchlist.vendorSubscriptions.length > 0;

  // Fetch the exact starred CVEs by ID, regardless of how recently they were published.
  const watchedCves = useCves(
    { ids: watchlist.cveIds.join(","), pageSize: 100 },
    { enabled: hasWatchedCves }
  );

  // A single query across all subscribed vendors (comma-separated), not one hook per vendor.
  const vendorCves = useCves(
    { vendor: watchlist.vendorSubscriptions.join(","), pageSize: 30, sortBy: "publishedDate", sortDir: "desc" },
    { enabled: hasVendorSubscriptions }
  );

  const addVendorSubscription = () => {
    addVendor(newVendor);
    setNewVendor("");
  };

  const filteredWatchedCves = hasWatchedCves ? watchedCves.data?.data ?? [] : [];
  const subscribedVendorCves = hasVendorSubscriptions ? vendorCves.data?.data ?? [] : [];

  const { data: allVendors } = useVendors();

  return (
    <Box>
      <Heading size="lg" mb={2}>
        CVE Watchlist
      </Heading>
      <Text color="text.muted" mb={6}>
        Track and monitor CVEs and vendors of interest to you.
      </Text>

      {!hasWatchedCves && !hasVendorSubscriptions && (
        <Alert status="info" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>Your watchlist is empty</AlertTitle>
            <AlertDescription>
              Click the star icon on any CVE card in the CVE Database to add it here, or subscribe to a vendor below.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      <Tabs index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab>Watched CVEs ({watchlist.cveIds.length})</Tab>
          <Tab>Vendor Subscriptions ({watchlist.vendorSubscriptions.length})</Tab>
          <Tab>All Activity</Tab>
        </TabList>

        <TabPanels>
          {/* Watched CVEs Tab */}
          <TabPanel>
            {!hasWatchedCves ? (
              <Box p={8} textAlign="center" borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
                <Text color="text.muted">No watched CVEs yet. Click the star icon on any CVE card to add it here.</Text>
              </Box>
            ) : watchedCves.isLoading ? (
              <Text color="text.muted">Loading watched CVEs...</Text>
            ) : filteredWatchedCves.length === 0 ? (
              <Box p={8} textAlign="center" borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
                <Text color="text.muted">Your starred CVEs could not be found — they may have been removed from the database.</Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                {filteredWatchedCves.map(cve => (
                  <CveCard key={cve.id} cve={cve} />
                ))}
              </SimpleGrid>
            )}
          </TabPanel>

          {/* Vendor Subscriptions Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="md" mb={3}>Subscribe to Vendors</Heading>
                <HStack>
                  <Input
                    value={newVendor}
                    onChange={(e) => setNewVendor(e.target.value)}
                    placeholder="Enter vendor name..."
                    onKeyPress={(e) => e.key === 'Enter' && addVendorSubscription()}
                    list="vendor-suggestions"
                  />
                  <datalist id="vendor-suggestions">
                    {allVendors?.data?.map(vendor => (
                      <option key={vendor.vendor} value={vendor.vendor} />
                    ))}
                  </datalist>
                  <Button onClick={addVendorSubscription} colorScheme="orange">
                    <Plus size={18} />
                  </Button>
                </HStack>
              </Box>

              <Box>
                <Heading size="md" mb={3}>Your Subscriptions</Heading>
                {!hasVendorSubscriptions ? (
                  <Text color="text.muted">No vendor subscriptions yet.</Text>
                ) : (
                  <Wrap spacing={2}>
                    {watchlist.vendorSubscriptions.map(vendor => (
                      <Tag
                        key={vendor}
                        size="lg"
                        variant="solid"
                        colorScheme="orange"
                        borderRadius="full"
                      >
                        <TagLabel>{vendor}</TagLabel>
                        <TagCloseButton onClick={() => removeVendor(vendor)} />
                      </Tag>
                    ))}
                  </Wrap>
                )}
              </Box>

              {subscribedVendorCves.length > 0 && (
                <Box>
                  <Heading size="md" mb={3}>Recent CVEs from Subscribed Vendors</Heading>
                  <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                    {subscribedVendorCves.slice(0, 12).map(cve => (
                      <CveCard key={cve.id} cve={cve} />
                    ))}
                  </SimpleGrid>
                </Box>
              )}
            </VStack>
          </TabPanel>

          {/* All Activity Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              {filteredWatchedCves.length > 0 && (
                <Box>
                  <Heading size="md" mb={3}>Watched CVEs</Heading>
                  <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                    {filteredWatchedCves.map(cve => (
                      <CveCard key={cve.id} cve={cve} />
                    ))}
                  </SimpleGrid>
                </Box>
              )}

              {subscribedVendorCves.length > 0 && (
                <Box>
                  <Heading size="md" mb={3}>CVEs from Subscribed Vendors</Heading>
                  <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                    {subscribedVendorCves.slice(0, 12).map(cve => (
                      <CveCard key={cve.id} cve={cve} />
                    ))}
                  </SimpleGrid>
                </Box>
              )}

              {filteredWatchedCves.length === 0 && subscribedVendorCves.length === 0 && (
                <Box p={8} textAlign="center" borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
                  <Text color="text.muted">No activity yet. Star CVEs or add vendor subscriptions to see updates here.</Text>
                </Box>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
