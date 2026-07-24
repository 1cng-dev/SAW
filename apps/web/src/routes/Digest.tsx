import { useState } from "react";
import { Box, Heading, Text, VStack, HStack, Button, Input, SimpleGrid, Badge, Alert, AlertIcon, AlertTitle, AlertDescription, Code, Divider } from "@chakra-ui/react";
import { FileDown, Calendar, Download, Printer, AlertTriangle, Newspaper, Shield } from "lucide-react";
import { useStats, useCves, useNews } from "../api/hooks";

export function DigestPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const stats = useStats();
  const topCves = useCves({ severity: "critical", pageSize: 10, sortBy: "publishedDate", sortDir: "desc" });
  const topNews = useNews({ pageSize: 10 });

  const handleGenerate = () => {
    setIsGenerating(true);
    // In a real implementation, this would call an API to generate a PDF
    setTimeout(() => {
      setIsGenerating(false);
      window.print();
    }, 1000);
  };

  const handleDownloadPDF = () => {
    // In a real implementation, this would download a server-generated PDF
    alert("PDF generation requires server-side integration (pdfkit/puppeteer). Currently using browser print.");
  };

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return (
    <Box>
      <Heading size="lg" mb={2}>
        Weekly Security Digest
      </Heading>
      <Text color="text.muted" mb={6}>
        Generate and download weekly security summary reports.
      </Text>

      {/* Date Range Selection */}
      <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={6} mb={8}>
        <Heading size="md" mb={4}>Report Configuration</Heading>
        <HStack spacing={4} mb={4}>
          <Box flex={1}>
            <Text fontSize="sm" color="text.muted" mb={1}>From Date</Text>
            <Input
              type="date"
              value={dateFrom || weekAgo}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </Box>
          <Box flex={1}>
            <Text fontSize="sm" color="text.muted" mb={1}>To Date</Text>
            <Input
              type="date"
              value={dateTo || today}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </Box>
        </HStack>
        <HStack spacing={4}>
          <Button onClick={handleGenerate} colorScheme="orange" isLoading={isGenerating}>
            <Printer size={18} />
            <Text ml={2}>Print Report</Text>
          </Button>
          <Button onClick={handleDownloadPDF} variant="outline">
            <Download size={18} />
            <Text ml={2}>Download PDF</Text>
          </Button>
        </HStack>
      </Box>

      {/* Report Preview */}
      <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={8} mb={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box textAlign="center" pb={4} borderBottomWidth="1px" borderColor="border.default">
            <Heading size="xl" color="accent.400">Sec-1CNG Weekly Security Digest</Heading>
            <Text color="text.muted" mt={2}>
              {dateFrom || weekAgo} to {dateTo || today}
            </Text>
          </Box>

          {/* Executive Summary */}
          <Box>
            <Heading size="md" mb={4} display="flex" alignItems="center" gap={2}>
              <Shield size={20} color="#f97316" />
              Executive Summary
            </Heading>
            {stats.data ? (
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Box p={4} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                  <Text fontSize="xs" color="text.muted">Total CVEs</Text>
                  <Text fontSize="2xl" fontFamily="mono">{stats.data.totalCves.toLocaleString()}</Text>
                </Box>
                <Box p={4} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                  <Text fontSize="xs" color="text.muted">Critical Today</Text>
                  <Text fontSize="2xl" fontFamily="mono" color="severity.critical.500">{stats.data.todayCriticalCves}</Text>
                </Box>
                <Box p={4} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                  <Text fontSize="xs" color="text.muted">News Articles</Text>
                  <Text fontSize="2xl" fontFamily="mono">{stats.data.totalNewsArticles.toLocaleString()}</Text>
                </Box>
                <Box p={4} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                  <Text fontSize="xs" color="text.muted">Vendor Advisories</Text>
                  <Text fontSize="2xl" fontFamily="mono">{stats.data.totalVendorAdvisories.toLocaleString()}</Text>
                </Box>
              </SimpleGrid>
            ) : (
              <Text color="text.muted">Loading statistics...</Text>
            )}
          </Box>

          <Divider />

          {/* Top Critical CVEs */}
          <Box>
            <Heading size="md" mb={4} display="flex" alignItems="center" gap={2}>
              <AlertTriangle size={20} color="#dc2626" />
              Top Critical CVEs
            </Heading>
            {topCves.data && topCves.data.data.length > 0 ? (
              <VStack spacing={2} align="stretch">
                {topCves.data.data.slice(0, 5).map((cve) => (
                  <Box key={cve.id} p={3} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                    <HStack justify="space-between">
                      <Code fontSize="sm" fontFamily="mono">{cve.id}</Code>
                      <Badge colorScheme="red" fontSize="xs">{cve.severity}</Badge>
                    </HStack>
                    <Text fontSize="sm" color="text.muted" mt={1} noOfLines={1}>
                      {cve.description}
                    </Text>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text color="text.muted">No critical CVEs available.</Text>
            )}
          </Box>

          <Divider />

          {/* Top Security News */}
          <Box>
            <Heading size="md" mb={4} display="flex" alignItems="center" gap={2}>
              <Newspaper size={20} color="#22d3ee" />
              Top Security News
            </Heading>
            {topNews.data && topNews.data.data.length > 0 ? (
              <VStack spacing={2} align="stretch">
                {topNews.data.data.slice(0, 5).map((article) => (
                  <Box key={article.id} p={3} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                    <Text fontSize="sm" fontWeight="medium">{article.title}</Text>
                    <HStack spacing={2} mt={1} fontSize="xs" color="text.muted">
                      <Text>{article.sourceName}</Text>
                      {article.publishedDate && (
                        <Text>• {new Date(article.publishedDate).toLocaleDateString()}</Text>
                      )}
                    </HStack>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Text color="text.muted">No news articles available.</Text>
            )}
          </Box>

          {/* Footer */}
          <Box pt={4} borderTopWidth="1px" borderColor="border.default" textAlign="center">
            <Text fontSize="sm" color="text.muted">
              Generated by Sec-1CNG Security Advisory Platform • {new Date().toLocaleString()}
            </Text>
          </Box>
        </VStack>
      </Box>

      {/* API Notice */}
      <Alert status="info">
        <AlertIcon />
        <Box>
          <AlertTitle>PDF Generation</AlertTitle>
          <AlertDescription>
            For server-side PDF generation, integrate <Code fontSize="xs">pdfkit</Code> or <Code fontSize="xs">puppeteer</Code> in the API. 
            Currently using browser print functionality as a fallback.
          </AlertDescription>
        </Box>
      </Alert>
    </Box>
  );
}
