import { useState, useEffect } from "react";
import { Box, Heading, Text, VStack, HStack, Button, Badge, Input, SimpleGrid, Alert, AlertIcon, AlertTitle, AlertDescription, Tabs, TabList, TabPanels, Tab, TabPanel, Wrap, Tag, TagLabel, TagCloseButton } from "@chakra-ui/react";
import { Star, StarOff, Search, Plus, X } from "lucide-react";
import { useCves, useVendors } from "../api/hooks";
import { CveCard } from "../components/cves/CveCard";
import { VendorChip } from "../components/vendors/VendorChip";

const WATCHLIST_STORAGE_KEY = "sec1cng_watchlist";
const VENDOR_SUBSCRIPTIONS_KEY = "sec1cng_vendor_subscriptions";

interface WatchlistData {
  cveIds: string[];
  vendorSubscriptions: string[];
}

export function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistData>({ cveIds: [], vendorSubscriptions: [] });
  const [newVendor, setNewVendor] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse watchlist:", e);
      }
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleCveWatch = (cveId: string) => {
    setWatchlist(prev => ({
      ...prev,
      cveIds: prev.cveIds.includes(cveId)
        ? prev.cveIds.filter(id => id !== cveId)
        : [...prev.cveIds, cveId]
    }));
  };

  const addVendorSubscription = () => {
    if (newVendor.trim() && !watchlist.vendorSubscriptions.includes(newVendor.trim())) {
      setWatchlist(prev => ({
        ...prev,
        vendorSubscriptions: [...prev.vendorSubscriptions, newVendor.trim()]
      }));
      setNewVendor("");
    }
  };

  const removeVendorSubscription = (vendor: string) => {
    setWatchlist(prev => ({
      ...prev,
      vendorSubscriptions: prev.vendorSubscriptions.filter(v => v !== vendor)
    }));
  };

  // Fetch watched CVEs
  const watchedCves = useCves({
    pageSize: 20,
    sortBy: "publishedDate",
    sortDir: "desc"
  });

  // Fetch CVEs from subscribed vendors
  const vendorCvesQueries = watchlist.vendorSubscriptions.map(vendor =>
    useCves({ vendor, pageSize: 10, sortBy: "publishedDate", sortDir: "desc" })
  );

  // Filter watched CVEs from the results
  const filteredWatchedCves = watchedCves.data?.data.filter(cve =>
    watchlist.cveIds.includes(cve.id)
  ) || [];

  // Combine vendor CVEs
  const vendorCves = vendorCvesQueries.flatMap(query => query.data?.data || []);

  // Get all vendors for autocomplete
  const { data: allVendors } = useVendors();

  const isCveWatched = (cveId: string) => watchlist.cveIds.includes(cveId);

  return (
    <Box>
      <Heading size="lg" mb={2}>
        CVE Watchlist
      </Heading>
      <Text color="text.muted" mb={6}>
        Track and monitor CVEs and vendors of interest to you.
      </Text>

      {watchlist.cveIds.length === 0 && watchlist.vendorSubscriptions.length === 0 && (
        <Alert status="info" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>Your watchlist is empty</AlertTitle>
            <AlertDescription>
              Star CVEs from the CVE Database or subscribe to vendors to build your personalized security feed.
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
            {filteredWatchedCves.length === 0 ? (
              <Box p={8} textAlign="center" borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
                <Text color="text.muted">No watched CVEs yet. Browse the CVE Database to add items to your watchlist.</Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                {filteredWatchedCves.map(cve => (
                  <Box key={cve.id} position="relative">
                    <Button
                      position="absolute"
                      top={2}
                      right={2}
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleCveWatch(cve.id)}
                      zIndex={1}
                      bg="bg.surface"
                    >
                      <StarOff size={16} color="#f97316" />
                    </Button>
                    <CveCard cve={cve} />
                  </Box>
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
                {watchlist.vendorSubscriptions.length === 0 ? (
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
                        <TagCloseButton onClick={() => removeVendorSubscription(vendor)} />
                      </Tag>
                    ))}
                  </Wrap>
                )}
              </Box>

              {vendorCves.length > 0 && (
                <Box>
                  <Heading size="md" mb={3}>Recent CVEs from Subscribed Vendors</Heading>
                  <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                    {vendorCves.slice(0, 12).map(cve => (
                      <Box key={cve.id} position="relative">
                        <Button
                          position="absolute"
                          top={2}
                          right={2}
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleCveWatch(cve.id)}
                          zIndex={1}
                          bg="bg.surface"
                        >
                          {isCveWatched(cve.id) ? (
                            <Star size={16} color="#f97316" fill="#f97316" />
                          ) : (
                            <Star size={16} color="#64748b" />
                          )}
                        </Button>
                        <CveCard cve={cve} />
                      </Box>
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
                      <Box key={cve.id} position="relative">
                        <Button
                          position="absolute"
                          top={2}
                          right={2}
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleCveWatch(cve.id)}
                          zIndex={1}
                          bg="bg.surface"
                        >
                          <StarOff size={16} color="#f97316" />
                        </Button>
                        <CveCard cve={cve} />
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}

              {vendorCves.length > 0 && (
                <Box>
                  <Heading size="md" mb={3}>CVEs from Subscribed Vendors</Heading>
                  <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                    {vendorCves.slice(0, 12).map(cve => (
                      <Box key={cve.id} position="relative">
                        <Button
                          position="absolute"
                          top={2}
                          right={2}
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleCveWatch(cve.id)}
                          zIndex={1}
                          bg="bg.surface"
                        >
                          {isCveWatched(cve.id) ? (
                            <Star size={16} color="#f97316" fill="#f97316" />
                          ) : (
                            <Star size={16} color="#64748b" />
                          )}
                        </Button>
                        <CveCard cve={cve} />
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}

              {filteredWatchedCves.length === 0 && vendorCves.length === 0 && (
                <Box p={8} textAlign="center" borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
                  <Text color="text.muted">No activity yet. Add CVEs or vendor subscriptions to see updates here.</Text>
                </Box>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
