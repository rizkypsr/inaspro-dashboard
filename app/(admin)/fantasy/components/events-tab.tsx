"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Input, Textarea } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";

import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "@/components/icons";
import {
  fantasyService,
  type Fantasy,
  type CreateFantasyData,
} from "@/lib/services/fantasy-service";
import { useAuth } from "@/lib/auth-context";

// Convert Firestore Timestamp to Date for display
const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

export default function EventsTab() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState<Fantasy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Fantasy | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateFantasyData>>({});
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Load events from Firestore
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const fantasies = await fantasyService.getAllFantasies();

      setEvents(fantasies);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedEvent(null);
    setIsEditing(true);
    setFormData({
      title: "",
      notes: "",
      schedule: new Date(),
      address: "",
      venue: "",
      registrationFee: 0,
      international: false,
    });
    onOpen();
  };

  const handleEdit = (event: Fantasy) => {
    setSelectedEvent(event);
    setIsEditing(true);
    setFormData({
      title: event.title,
      notes: event.notes,
      schedule: timestampToDate(event.schedule),
      address: event.address,
      venue: event.venue,
      registrationFee: event.registrationFee,
      international: event.international,
    });
    onOpen();
  };

  const handleDelete = async (eventId: string | undefined) => {
    if (!eventId) return;

    try {
      await fantasyService.deleteFantasy(eventId);
      setEvents(events.filter((event) => event.id !== eventId));
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleSave = async () => {
    try {
      if (selectedEvent && selectedEvent.id) {
        // Update existing event
        const updateData: Partial<CreateFantasyData> = {
          title: formData.title,
          address: formData.address,
          venue: formData.venue,
          notes: formData.notes,
          international: formData.international,
          registrationFee: formData.registrationFee,
          schedule:
            formData.schedule || timestampToDate(selectedEvent.schedule),
        };

        await fantasyService.updateFantasy(selectedEvent.id, updateData);
        // Reload events to get updated data
        await loadEvents();
      } else {
        // Add new event
        const createData: CreateFantasyData = {
          title: formData.title || "",
          address: formData.address || "",
          venue: formData.venue || "",
          notes: formData.notes || "",
          international: formData.international || false,
          registrationFee: formData.registrationFee || 0,
          schedule: formData.schedule || new Date(),
          createdBy: user?.uid || "unknown",
        };

        await fantasyService.createFantasy(createData);
        // Reload events to get updated data
        await loadEvents();
      }
      onClose();
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Events Management</h2>
          <Button
            color="primary"
            startContent={<PlusIcon />}
            onPress={handleAdd}
          >
            Add Event
          </Button>
        </CardHeader>
        <CardBody>
          <Table aria-label="Events table">
            <TableHeader>
              <TableColumn>TITLE</TableColumn>
              <TableColumn>SCHEDULE</TableColumn>
              <TableColumn>VENUE</TableColumn>
              <TableColumn>ADDRESS</TableColumn>
              <TableColumn>FEE</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell className="text-center" colSpan={7}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center" colSpan={7}>
                    No events found
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-sm text-gray-500">{event.notes}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>
                          {timestampToDate(event.schedule).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500">
                          {timestampToDate(event.schedule).toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{event.venue}</TableCell>
                    <TableCell>{event.address}</TableCell>
                    <TableCell>
                      Rp {event.registrationFee.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={event.international ? "primary" : "default"}
                        size="sm"
                        variant="flat"
                      >
                        {event.international ? "International" : "Local"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() =>
                            event.id &&
                            router.push(`/fantasy/events/${event.id}`)
                          }
                        >
                          <EyeIcon />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => handleEdit(event)}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          isIconOnly
                          color="danger"
                          size="sm"
                          variant="light"
                          onPress={() => handleDelete(event.id)}
                        >
                          <TrashIcon />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Add/Edit/View Modal */}
      <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            {selectedEvent
              ? isEditing
                ? "Edit Event"
                : "View Event"
              : "Add New Event"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                isReadOnly={!!(selectedEvent && !isEditing)}
                label="Event Title"
                placeholder="Enter event title"
                value={formData.title || ""}
                onChange={(e: any) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <Textarea
                isReadOnly={!!(selectedEvent && !isEditing)}
                label="Notes"
                placeholder="Enter event notes"
                value={formData.notes || ""}
                onChange={(e: any) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
              <Input
                isReadOnly={!!(selectedEvent && !isEditing)}
                label="Schedule"
                type="datetime-local"
                value={
                  formData.schedule
                    ? formData.schedule.toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e: any) =>
                  setFormData({
                    ...formData,
                    schedule: new Date(e.target.value),
                  })
                }
              />
              <Input
                isReadOnly={!!(selectedEvent && !isEditing)}
                label="Venue"
                placeholder="Enter event venue"
                value={formData.venue || ""}
                onChange={(e: any) =>
                  setFormData({ ...formData, venue: e.target.value })
                }
              />
              <Input
                isReadOnly={!!(selectedEvent && !isEditing)}
                label="Address"
                placeholder="Enter event address"
                value={formData.address || ""}
                onChange={(e: any) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  isReadOnly={!!(selectedEvent && !isEditing)}
                  label="Registration Fee"
                  placeholder="Enter registration fee"
                  type="number"
                  value={formData.registrationFee?.toString() || ""}
                  onChange={(e: any) =>
                    setFormData({
                      ...formData,
                      registrationFee: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <div className="flex items-center gap-2">
                  <label
                    className="text-sm font-medium"
                    htmlFor="international-checkbox"
                  >
                    International Event
                  </label>
                  <input
                    checked={formData.international || false}
                    className="rounded"
                    disabled={!!(selectedEvent && !isEditing)}
                    id="international-checkbox"
                    type="checkbox"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        international: e.target.checked,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              {selectedEvent && !isEditing ? "Close" : "Cancel"}
            </Button>
            {(isEditing || !selectedEvent) && (
              <Button color="primary" onPress={handleSave}>
                {selectedEvent ? "Update" : "Create"}
              </Button>
            )}
            {selectedEvent && !isEditing && (
              <Button color="primary" onPress={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
