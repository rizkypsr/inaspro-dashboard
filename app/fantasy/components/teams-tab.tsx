"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { Textarea } from "@heroui/input";
import { useParams } from "next/navigation";

import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from "@/components/icons";
import {
  teamsService,
  Team,
  CreateTeamData,
} from "@/lib/services/teams-service";

// Team interface is now imported from teams-service

interface FormData {
  name: string;
  description: string;
  size: string;
  images: string;
}

// Teams data now loaded from Firestore

export default function TeamsTab() {
  const params = useParams();
  const eventId = params.id as string;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    size: "",
    images: "",
  });
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);

  // Load teams when component mounts
  useEffect(() => {
    if (eventId) {
      loadTeams();
    }
  }, [eventId]);

  const loadTeams = async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      const teamsData = await teamsService.getTeamsByFantasyId(eventId);

      setTeams(teamsData);
    } catch (error) {
      console.error("Error loading teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedTeam(null);
    setIsEditing(false);
    setFormData({
      name: "",
      description: "",
      size: "",
      images: "",
    });
    onOpen();
  };

  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    setIsEditing(true);
    setFormData({
      name: team.name,
      description: team.description,
      size: team.size || "",
      images: team.images || "",
    });
    onOpen();
  };

  const handleView = (team: Team) => {
    setSelectedTeam(team);
    setIsEditing(false);
    setFormData({
      name: team.name,
      description: team.description,
      size: team.size || "",
      images: team.images || "",
    });
    onOpen();
  };

  const handleSave = async () => {
    if (!eventId) return;

    // Validate required fields
    if (!formData.name.trim()) {
      console.error("Team name is required");

      return;
    }

    if (!formData.description.trim()) {
      console.error("Team description is required");

      return;
    }

    try {
      if (isEditing && selectedTeam?.id) {
        const updateData = {
          ...formData,
          name: formData.name.trim(),
          description: formData.description.trim(),
          size: formData.size,
          images: formData.images || "",
        };

        await teamsService.updateTeam(selectedTeam.id, updateData);
      } else {
        const createData: CreateTeamData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          images: formData.images || "",
          size: formData.size,
          fantasyId: eventId,
        };

        await teamsService.createTeam(createData);
      }
      await loadTeams();
      onClose();
    } catch (error) {
      console.error("Error saving team:", error);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    // Only allow one image for teams
    const file = files[0];
    
    setUploadingImages(true);
    try {
      const fileName = `teams/${eventId}/${Date.now()}_${file.name}`;
      const uploadResult = await uploadToFirebaseStorage(fileName, file);

      setFormData((prev) => ({
        ...prev,
        images: uploadResult.downloadURL, // Set single image
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      images: "",
    }));
  };

  const uploadToFirebaseStorage = async (filePath: string, file: File) => {
    try {
      // Convert file to base64 for Firebase Storage upload
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload to Firebase Storage using MCP
      const response = await fetch("/api/firebase/storage/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: filePath,
          content: fileContent,
          contentType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await response.json();

      return { downloadURL: result.downloadUrl };
    } catch (error) {
      console.error("Error uploading to Firebase Storage:", error);
      throw error;
    }
  };

  const handleDelete = async (teamId: string | undefined) => {
    if (!teamId) return;

    try {
      await teamsService.deleteTeam(teamId);
      await loadTeams();
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  if (!eventId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please select an event to view teams</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Teams</h2>
          <p className="text-gray-600">{teams.length} teams registered</p>
        </div>
        <Button color="primary" startContent={<PlusIcon />} onPress={handleAdd}>
          Add Team
        </Button>
      </div>

      <Table aria-label="Teams table">
        <TableHeader>
          <TableColumn>TEAM NAME</TableColumn>
          <TableColumn>DESCRIPTION</TableColumn>
          <TableColumn>SIZE</TableColumn>
          <TableColumn>CREATED DATE</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell>{team.name}</TableCell>
              <TableCell>{team.description}</TableCell>
              <TableCell>
                {team.size ? (
                  <Chip color="primary" size="sm" variant="flat">
                    {team.size}
                  </Chip>
                ) : (
                  <span className="text-gray-400">No size</span>
                )}
              </TableCell>
              <TableCell>
                {team.createdAt?.toDate().toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => handleView(team)}
                  >
                    <EyeIcon />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => handleEdit(team)}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    isIconOnly
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={() => handleDelete(team.id)}
                  >
                    <TrashIcon />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            {isEditing
              ? "Edit Team"
              : selectedTeam
                ? "Team Details"
                : "Add New Team"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                isReadOnly={!!(selectedTeam && !isEditing)}
                label="Team Name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Textarea
                isReadOnly={!!(selectedTeam && !isEditing)}
                label="Description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="size">
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {["S", "M", "L", "XL", "XXL", "XXXL"].map((size) => (
                    <Button
                      key={size}
                      color={formData.size === size ? "primary" : "default"}
                      isDisabled={!!(selectedTeam && !isEditing)}
                      size="sm"
                      variant={formData.size === size ? "solid" : "bordered"}
                      onPress={() => {
                        if (selectedTeam && !isEditing) return;
                        const newSize = formData.size === size ? "" : size;

                        setFormData({ ...formData, size: newSize });
                      }}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium" htmlFor="images">
                  Images
                </label>

                {/* Add new image */}
                {(isEditing || !selectedTeam) && (
                  <div className="space-y-2">
                    <input
                      accept="image/*"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={uploadingImages}
                      type="file"
                      onChange={(e) =>
                        e.target.files && handleFileUpload(e.target.files)
                      }
                    />
                    {uploadingImages && (
                      <p className="text-sm text-blue-600">
                        Uploading image...
                      </p>
                    )}
                  </div>
                )}

                {/* Display existing image */}
                {formData.images && (
                  <div className="w-32">
                    <div className="relative group">
                      <img
                        alt={`Team`}
                        className="w-full h-24 object-cover rounded-lg border"
                        src={formData.images}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;

                          target.src = "/placeholder-image.png";
                        }}
                      />
                      {(isEditing || !selectedTeam) && (
                        <Button
                          isIconOnly
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          color="danger"
                          size="sm"
                          variant="flat"
                          onPress={() => handleRemoveImage()}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {!formData.images && (
                  <p className="text-gray-500 text-sm">No images added yet</p>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              {selectedTeam && !isEditing ? "Close" : "Cancel"}
            </Button>
            {(!selectedTeam || isEditing) && (
              <Button color="primary" onPress={handleSave}>
                {isEditing ? "Update" : "Add"} Team
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
