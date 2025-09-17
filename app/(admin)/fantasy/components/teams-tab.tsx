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
  TShirt,
} from "@/lib/services/teams-service";

interface FormData {
  name: string;
  description: string;
  tshirts: TShirt[];
}

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
    tshirts: [],
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

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      tshirts: [],
    });
    setValidationErrors({});
  };

  const handleAdd = () => {
    setSelectedTeam(null);
    setIsEditing(false);
    resetForm();
    onOpen();
  };

  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    setIsEditing(true);
    setFormData({
      name: team.name,
      description: team.description,
      tshirts: team.tshirts || [],
    });
    onOpen();
  };

  const handleView = (team: Team) => {
    setSelectedTeam(team);
    setIsEditing(false);
    setFormData({
      name: team.name,
      description: team.description,
      tshirts: team.tshirts || [],
    });
    onOpen();
  };

  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    description?: string;
    tshirts?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Team name is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Team description is required";
    }

    if (formData.tshirts.length === 0) {
      errors.tshirts = "At least one t-shirt is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!eventId) return;

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing && selectedTeam?.id) {
        const updateData: Partial<CreateTeamData> = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          tshirts: formData.tshirts,
        };

        await teamsService.updateTeam(selectedTeam.id, updateData);
      } else {
        const createData: CreateTeamData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          tshirts: formData.tshirts,
          fantasyId: eventId,
        };

        await teamsService.createTeam(createData);
      }
      await loadTeams();
      setValidationErrors({});
      onClose();
    } catch (error) {
      console.error("Error saving team:", error);
    }
  };

  const handleAddTShirt = () => {
    const newTShirt: TShirt = {
      id: Date.now().toString(),
      size: "M",
      image: "",
    };
    setFormData(prev => ({
      ...prev,
      tshirts: [...prev.tshirts, newTShirt],
    }));
  };

  const handleRemoveTShirt = (tshirtId: string) => {
    setFormData(prev => ({
      ...prev,
      tshirts: prev.tshirts.filter(t => t.id !== tshirtId),
    }));
  };

  const handleTShirtSizeChange = (tshirtId: string, size: string) => {
    setFormData(prev => ({
      ...prev,
      tshirts: prev.tshirts.map(t => 
        t.id === tshirtId ? { ...t, size } : t
      ),
    }));
  };

  const handleFileUpload = async (files: FileList, tshirtId: string) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploadingImages(true);
    try {
      const fileName = `teams/${eventId}/${Date.now()}_${file.name}`;
      const uploadResult = await uploadToFirebaseStorage(fileName, file);

      setFormData(prev => ({
        ...prev,
        tshirts: prev.tshirts.map(t => 
          t.id === tshirtId ? { ...t, image: uploadResult.downloadURL } : t
        ),
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (tshirtId: string) => {
    setFormData(prev => ({
      ...prev,
      tshirts: prev.tshirts.map(t => 
        t.id === tshirtId ? { ...t, image: "" } : t
      ),
    }));
  };

  const uploadToFirebaseStorage = async (filePath: string, file: File) => {
    try {
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

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

  const getTeamSizes = (team: Team): string[] => {
    return team.tshirts?.map(t => t.size) || [];
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
          <TableColumn>T-SHIRT SIZES</TableColumn>
          <TableColumn>CREATED DATE</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow key={team.id}>
              <TableCell>{team.name}</TableCell>
              <TableCell>{team.description}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {getTeamSizes(team).length > 0 ? (
                    getTeamSizes(team).map((size, index) => (
                      <Chip key={index} color="primary" size="sm" variant="flat">
                        {size}
                      </Chip>
                    ))
                  ) : (
                    <span className="text-gray-400">No t-shirts</span>
                  )}
                </div>
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

      <Modal isOpen={isOpen} size="4xl" onClose={onClose} scrollBehavior="inside">
        <ModalContent className="max-h-[90vh]">
          <ModalHeader>
            {isEditing
              ? "Edit Team"
              : selectedTeam
                ? "Team Details"
                : "Add New Team"}
          </ModalHeader>
          <ModalBody className="overflow-y-auto">
            <div className="space-y-4">
              <Input
                isReadOnly={!!(selectedTeam && !isEditing)}
                label="Team Name"
                placeholder="Enter team name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                isRequired
                isInvalid={!!validationErrors.name}
                errorMessage={validationErrors.name}
              />
              <Textarea
                isReadOnly={!!(selectedTeam && !isEditing)}
                label="Description"
                placeholder="Enter team description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                isRequired
                isInvalid={!!validationErrors.description}
                errorMessage={validationErrors.description}
              />

              {/* T-Shirts Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center sticky top-0 bg-white z-10 py-2">
                  <label className="text-sm font-medium">T-Shirts *</label>
                  {(!selectedTeam || isEditing) && (
                    <Button
                      color="primary"
                      size="sm"
                      variant="bordered"
                      onPress={handleAddTShirt}
                    >
                      Add T-Shirt
                    </Button>
                  )}
                </div>

                {validationErrors.tshirts && (
                  <div className="text-red-500 text-sm">
                    {validationErrors.tshirts}
                  </div>
                )}

                {formData.tshirts.length === 0 ? (
                  <p className="text-gray-500 text-sm">No t-shirts added yet</p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {formData.tshirts.map((tshirt, index) => (
                      <div key={tshirt.id} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">T-Shirt #{index + 1}</h4>
                          {(!selectedTeam || isEditing) && (
                            <Button
                              isIconOnly
                              color="danger"
                              size="sm"
                              variant="light"
                              onPress={() => handleRemoveTShirt(tshirt.id)}
                            >
                              <TrashIcon />
                            </Button>
                          )}
                        </div>

                        {/* Size Selection */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Size *</label>
                          <div className="flex flex-wrap gap-2">
                            {["S", "M", "L", "XL", "XXL", "XXXL"].map((size) => (
                              <Button
                                key={size}
                                color={tshirt.size === size ? "primary" : "default"}
                                isDisabled={!!(selectedTeam && !isEditing)}
                                size="sm"
                                variant={tshirt.size === size ? "solid" : "bordered"}
                                onPress={() => {
                                  if (selectedTeam && !isEditing) return;
                                  handleTShirtSizeChange(tshirt.id, size);
                                }}
                              >
                                {size}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium">Image</label>

                          {(!selectedTeam || isEditing) && (
                            <div className="space-y-2">
                              <input
                                accept="image/*"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                disabled={uploadingImages}
                                type="file"
                                onChange={(e) =>
                                  e.target.files && handleFileUpload(e.target.files, tshirt.id)
                                }
                              />
                              {uploadingImages && (
                                <p className="text-sm text-blue-600">
                                  Uploading image...
                                </p>
                              )}
                            </div>
                          )}

                          {tshirt.image && (
                            <div className="w-32">
                              <div className="relative group">
                                <img
                                  alt={`T-Shirt ${tshirt.size}`}
                                  className="w-full h-24 object-cover rounded-lg border"
                                  src={tshirt.image}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/placeholder-image.png";
                                  }}
                                />
                                {(!selectedTeam || isEditing) && (
                                  <Button
                                    isIconOnly
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    color="danger"
                                    size="sm"
                                    variant="flat"
                                    onPress={() => handleRemoveImage(tshirt.id)}
                                  >
                                    ×
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}

                          {!tshirt.image && (
                            <p className="text-gray-500 text-sm">No image added yet</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
