import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Select,
  Input,
  Button,
  Switch,
  Badge,
  IconButton,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
} from "@chakra-ui/react";
import { Plus, Trash2 } from "lucide-react";
import { useAlertRules, useCreateAlertRule, useToggleAlertRule, useDeleteAlertRule } from "../api/hooks";

const TRIGGER_OPTIONS = [
  { value: "new_critical_cve_watchlist_match", label: "New Critical CVE matches Watchlist" },
  { value: "new_asset_exposure", label: "New Asset Exposure" },
  { value: "patch_overdue_7d", label: "Patch overdue > 7 days" },
  { value: "new_incident_opened", label: "New Incident opened" },
  { value: "phishing_domain_registered", label: "Look-alike domain registered" },
];

const CHANNEL_LABELS: Record<string, string> = { email: "Email", slack_webhook: "Slack Webhook", generic_webhook: "Generic Webhook" };

export function NotificationSettingsPage() {
  const rules = useAlertRules();
  const createRule = useCreateAlertRule();
  const toggleRule = useToggleAlertRule();
  const deleteRule = useDeleteAlertRule();
  const toast = useToast();

  const [form, setForm] = useState({ triggerType: TRIGGER_OPTIONS[0].value, channel: "email", destination: "" });

  const handleCreate = () => {
    if (!form.destination.trim()) {
      toast({ title: "Destination is required", status: "warning", duration: 2000 });
      return;
    }
    createRule.mutate(form, {
      onSuccess: () => {
        toast({ title: "Alert rule created", status: "success", duration: 2000 });
        setForm({ ...form, destination: "" });
      },
    });
  };

  return (
    <Box>
      <Heading size="lg" mb={1}>Notification / Alert Settings</Heading>
      <Text color="text.muted" fontSize="sm" mb={4}>
        Configure alert rules for critical events across the platform.
      </Text>

      <Alert status="info" mb={6} fontSize="sm">
        <AlertIcon />
        <Box>
          <AlertTitle>Delivery isn't wired up yet</AlertTitle>
          <AlertDescription>
            Rules are saved for real, but no email/Slack/webhook sender is connected in this deployment — this
            configures what *would* fire once a delivery integration is added.
          </AlertDescription>
        </Box>
      </Alert>

      <Box borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" p={5} mb={6}>
        <Text fontSize="sm" fontWeight="medium" mb={3}>New Alert Rule</Text>
        <VStack spacing={3} align="stretch">
          <Select value={form.triggerType} onChange={(e) => setForm({ ...form, triggerType: e.target.value })}>
            {TRIGGER_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
          <HStack>
            <Select w="200px" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
              <option value="email">Email</option>
              <option value="slack_webhook">Slack Webhook</option>
              <option value="generic_webhook">Generic Webhook</option>
            </Select>
            <Input
              placeholder={form.channel === "email" ? "you@company.com" : "https://hooks.slack.com/..."}
              value={form.destination}
              onChange={(e) => setForm({ ...form, destination: e.target.value })}
            />
            <Button leftIcon={<Plus size={16} />} colorScheme="orange" onClick={handleCreate} isLoading={createRule.isPending}>Add</Button>
          </HStack>
        </VStack>
      </Box>

      {rules.isLoading ? (
        <Skeleton h="120px" />
      ) : !rules.data || rules.data.data.length === 0 ? (
        <Box p={8} textAlign="center" borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
          <Text color="text.muted">No alert rules configured yet.</Text>
        </Box>
      ) : (
        <VStack align="stretch" spacing={2}>
          {rules.data.data.map((rule) => (
            <HStack key={rule.id} borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="lg" p={3} justify="space-between">
              <Box>
                <Text fontSize="sm">{TRIGGER_OPTIONS.find((t) => t.value === rule.triggerType)?.label ?? rule.triggerType}</Text>
                <HStack fontSize="xs" color="text.muted">
                  <Badge fontSize="9px">{CHANNEL_LABELS[rule.channel]}</Badge>
                  <Text fontFamily="mono">{rule.destination}</Text>
                </HStack>
              </Box>
              <HStack>
                <Switch isChecked={rule.enabled} colorScheme="orange" onChange={(e) => toggleRule.mutate({ id: rule.id, enabled: e.target.checked })} />
                <IconButton aria-label="Delete" icon={<Trash2 size={14} />} size="sm" variant="ghost" colorScheme="red" onClick={() => deleteRule.mutate(rule.id)} />
              </HStack>
            </HStack>
          ))}
        </VStack>
      )}
    </Box>
  );
}
