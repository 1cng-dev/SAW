import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { AttackMatrix } from "./AttackMatrix";
import { RansomNotesPanel } from "./RansomNotesPanel";
import { NegotiationChatPanel } from "./NegotiationChatPanel";

export function GroupDetailModal({
  isOpen,
  onClose,
  slug,
  groupName,
}: {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  groupName: string;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg="bg.surface">
        <ModalHeader textTransform="capitalize">{groupName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Tabs colorScheme="orange">
            <TabList>
              <Tab>ATT&CK Matrix</Tab>
              <Tab>Ransom Notes</Tab>
              <Tab>Negotiation Chats</Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0}>
                <AttackMatrix slug={slug} />
              </TabPanel>
              <TabPanel px={0}>
                <Text fontSize="xs" color="text.muted" mb={3}>
                  Real leaked ransom note templates, fetched live from ransomware.live.
                </Text>
                <RansomNotesPanel slug={slug} />
              </TabPanel>
              <TabPanel px={0}>
                <Text fontSize="xs" color="text.muted" mb={3}>
                  Real leaked negotiation chat transcripts between the group and victims.
                </Text>
                <NegotiationChatPanel slug={slug} groupName={groupName} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
