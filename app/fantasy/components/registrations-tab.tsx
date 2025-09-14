"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { useParams } from "next/navigation";

import { EyeIcon } from "@/components/icons";
import {
  registrationsService,
  Registration,
} from "@/lib/services/registrations-service";

// Registration interface is now imported from registrations-service
// Registrations data now loaded from Firestore

export default function RegistrationsTab() {
  const params = useParams();
  const eventId = params.id as string;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);

  // Load registrations when component mounts
  useEffect(() => {
    if (eventId) {
      loadRegistrations();
    }
  }, [eventId]);

  const loadRegistrations = async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      const registrationsData =
        await registrationsService.getRegistrationsByFantasyId(eventId);

      setRegistrations(registrationsData);
    } catch (error) {
      console.error("Error loading registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (registration: Registration) => {
    setSelectedRegistration(registration);
    onOpen();
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "danger";
      case "expired":
        return "secondary";
      default:
        return "default";
    }
  };

  if (!eventId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Registrations</h2>
          <p className="text-gray-600">
            {registrations.length} registrations received
          </p>
        </div>
      </div>

      <Table aria-label="Registrations table">
        <TableHeader>
          <TableColumn>TEAM NAME</TableColumn>
          <TableColumn>CAPTAIN</TableColumn>
          <TableColumn>CONTACT</TableColumn>
          <TableColumn>PLAYERS</TableColumn>
          <TableColumn>REGISTRATION DATE</TableColumn>
          <TableColumn>TEAM SIZE</TableColumn>
          <TableColumn>PAYMENT</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={loading ? "Loading..." : "No registrations found"}
        >
          {registrations.map((registration) => (
            <TableRow key={registration.id}>
              <TableCell>{registration.teamName}</TableCell>
              <TableCell>{registration.userId}</TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>User ID: {registration.userId}</div>
                </div>
              </TableCell>
              <TableCell>{registration.teamSize}</TableCell>
              <TableCell>
                {registration.registeredAt
                  ? new Date(
                      registration.registeredAt.seconds * 1000,
                    ).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell>{registration.teamSize}</TableCell>
              <TableCell>
                <Chip
                  color={getPaymentStatusColor(registration.paymentStatus)}
                  variant="flat"
                >
                  {registration.paymentStatus.charAt(0).toUpperCase() +
                    registration.paymentStatus.slice(1)}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => handleView(registration)}
                  >
                    <EyeIcon />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
        <ModalContent>
          <ModalHeader>Registration Details</ModalHeader>
          <ModalBody>
            {selectedRegistration && (
              <div className="space-y-4">
                <div>
                  <span className="block text-sm font-medium mb-1">
                    Team Name
                  </span>
                  <p className="text-sm text-gray-600">
                    {selectedRegistration.teamName}
                  </p>
                </div>
                <div>
                  <span className="block text-sm font-medium mb-1">
                    User ID
                  </span>
                  <p className="text-sm text-gray-600">
                    {selectedRegistration.userId}
                  </p>
                </div>
                <div>
                  <span className="block text-sm font-medium mb-1">
                    Team ID
                  </span>
                  <p className="text-sm text-gray-600">
                    {selectedRegistration.teamId}
                  </p>
                </div>
                <div>
                  <span className="block text-sm font-medium mb-1">
                    Team Size
                  </span>
                  <p className="text-sm text-gray-600">
                    {selectedRegistration.teamSize}
                  </p>
                </div>
                <div>
                  <span className="block text-sm font-medium mb-1">
                    Total Paid
                  </span>
                  <p className="text-sm text-gray-600">
                    ${selectedRegistration.totalPaid}
                  </p>
                </div>
                <div>
                  <span className="block text-sm font-medium mb-1">
                    Payment Status
                  </span>
                  <Chip
                    color={getPaymentStatusColor(
                      selectedRegistration.paymentStatus,
                    )}
                    variant="flat"
                  >
                    {selectedRegistration.paymentStatus
                      .charAt(0)
                      .toUpperCase() +
                      selectedRegistration.paymentStatus.slice(1)}
                  </Chip>
                </div>
                <div>
                  <span className="block text-sm font-medium mb-1">
                    Payment ID
                  </span>
                  <p className="text-sm text-gray-600">
                    {selectedRegistration.paymentId}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm font-medium mb-1">
                      Registration Date
                    </span>
                    <p className="text-sm text-gray-600">
                      {selectedRegistration.registeredAt
                        ? new Date(
                            selectedRegistration.registeredAt.seconds * 1000,
                          ).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <span className="block text-sm font-medium mb-1">
                      Team Size
                    </span>
                    <p className="text-sm text-gray-600">
                      {selectedRegistration.teamSize}
                    </p>
                  </div>
                  <div>
                    <span className="block text-sm font-medium mb-1">
                      Payment Status
                    </span>
                    <Chip
                      color={getPaymentStatusColor(
                        selectedRegistration.paymentStatus,
                      )}
                      variant="flat"
                    >
                      {selectedRegistration.paymentStatus
                        .charAt(0)
                        .toUpperCase() +
                        selectedRegistration.paymentStatus.slice(1)}
                    </Chip>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
