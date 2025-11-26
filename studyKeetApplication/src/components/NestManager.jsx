import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
} from "@chakra-ui/react";

export default function NestManager({ isOpen, mode, initialName, onClose, onSubmit }) {
  const [name, setName] = useState(initialName ?? "");
  const toast = useToast();

  useEffect(() => {
    setName(initialName ?? "");
  }, [initialName, isOpen]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast({
        title: "Nest name required",
        description: "Please provide a name for your nest.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{mode === "edit" ? "Edit Nest" : "Create Nest"}</ModalHeader>
        <ModalBody>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Biology 201"
              autoFocus
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button colorScheme="teal" onClick={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
