"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";

import { logisticsService } from "../../../../lib/services/marketplace-service";
import { LogisticsRate } from "../../../../types/marketplace";
import { ProtectedRoute } from "../../../../components/protected-route";

// Icons as SVG components
const PlusIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 4v16m8-8H4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const MoreVerticalIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const EditIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const TruckIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

// Toast utility
const toast = {
  success: (message: string) => alert(`Success: ${message}`),
  error: (message: string) => alert(`Error: ${message}`),
};

interface LogisticsFormData {
  name: string;
  price: number;
}

// Indonesian provinces data
const INDONESIAN_PROVINCES = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Kepulauan Riau",
  "Jambi",
  "Sumatera Selatan",
  "Bangka Belitung",
  "Bengkulu",
  "Lampung",
  "DKI Jakarta",
  "Jawa Barat",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Banten",
  "Bali",
  "Nusa Tenggara Barat",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Sulawesi Tengah",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Gorontalo",
  "Sulawesi Barat",
  "Maluku",
  "Maluku Utara",
  "Papua",
  "Papua Barat",
  "Papua Selatan",
  "Papua Tengah",
  "Papua Pegunungan",
  "Papua Barat Daya",
];

export default function LogisticsPage() {
  const [logistics, setLogistics] = useState<LogisticsRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLogistics, setSelectedLogistics] =
    useState<LogisticsRate | null>(null);
  const [formData, setFormData] = useState<LogisticsFormData>({
    name: "",
    price: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    loadLogistics();
  }, []);

  const loadLogistics = async () => {
    try {
      setLoading(true);
      const response = await logisticsService.getLogisticsRates();

      setLogistics(response);
    } catch (error) {
      console.error("Error loading logistics:", error);
      toast.error("Failed to load logistics configurations");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    await loadLogistics();
  };

  const handleAdd = () => {
    setSelectedLogistics(null);
    setFormData({ name: "", price: 0 });
    setIsEditing(false);
    onOpen();
  };

  const handleEdit = (logisticsConfig: LogisticsRate) => {
    setSelectedLogistics(logisticsConfig);
    setFormData({
      name: logisticsConfig.name,
      price: logisticsConfig.price,
    });
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async (logisticsConfig: LogisticsRate) => {
    if (
      !confirm(
        `Are you sure you want to delete logistics configuration for "${logisticsConfig.name}"?`,
      )
    ) {
      return;
    }

    try {
      // Note: Delete functionality not available in current service
      toast.error("Delete functionality not implemented yet");
    } catch (error) {
      console.error("Error deleting logistics configuration:", error);
      toast.error("Failed to delete logistics configuration");
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return "Province name is required";
    }
    if (!INDONESIAN_PROVINCES.includes(formData.name.trim())) {
      return "Please select a valid Indonesian province";
    }
    if (formData.price < 0) {
      return "Shipping price cannot be negative";
    }
    if (formData.price === 0) {
      return "Shipping price must be greater than 0";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      toast.error(validationError);

      return;
    }

    // Check for duplicate province (only when adding new)
    if (!isEditing) {
      const existingProvince = logistics.find(
        (l) => l.name.toLowerCase() === formData.name.trim().toLowerCase(),
      );

      if (existingProvince) {
        toast.error("Logistics configuration for this province already exists");

        return;
      }
    }

    try {
      setSubmitting(true);

      const logisticsData = {
        name: formData.name.trim(),
        price: formData.price,
      };

      if (isEditing && selectedLogistics) {
        await logisticsService.updateLogisticsRate(
          selectedLogistics.provinceId,
          logisticsData,
        );
        toast.success("Logistics configuration updated successfully");
      } else {
        // Generate a simple province ID for new entries
        const provinceId = formData.name.toLowerCase().replace(/\s+/g, "-");

        await logisticsService.updateLogisticsRate(provinceId, logisticsData);
        toast.success("Logistics configuration created successfully");
      }

      onClose();
      loadLogistics();
    } catch (error) {
      console.error("Error saving logistics configuration:", error);
      toast.error("Failed to save logistics configuration");
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    onClose();
    setFormData({ name: "", price: 0 });
    setSelectedLogistics(null);
    setIsEditing(false);
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString()}`;
  };

  const filteredLogistics = logistics.filter((logisticsConfig) =>
    logisticsConfig.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getAvailableProvinces = () => {
    const usedProvinces = logistics.map((l) => l.name);

    return INDONESIAN_PROVINCES.filter(
      (province) =>
        !usedProvinces.includes(province) ||
        (isEditing && selectedLogistics && selectedLogistics.name === province),
    );
  };

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Logistics Configuration</h1>
            <p className="text-default-500">
              Manage shipping costs by province
            </p>
          </div>
          <Button
            color="primary"
            startContent={<PlusIcon />}
            onPress={handleAdd}
          >
            Add Province
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex gap-4 items-end">
              <Input
                className="flex-1"
                placeholder="Search provinces..."
                startContent={<SearchIcon />}
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
              />
              <Button color="primary" onPress={handleSearch}>
                Search
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardBody className="flex flex-row items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TruckIcon />
              </div>
              <div>
                <p className="text-sm text-default-500">Total Provinces</p>
                <p className="text-2xl font-bold">{logistics.length}</p>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex flex-row items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <TruckIcon />
              </div>
              <div>
                <p className="text-sm text-default-500">Average Cost</p>
                <p className="text-2xl font-bold">
                  {logistics.length > 0
                    ? formatCurrency(
                        logistics.reduce((sum, l) => sum + l.price, 0) /
                          logistics.length,
                      )
                    : "Rp 0"}
                </p>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex flex-row items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <TruckIcon />
              </div>
              <div>
                <p className="text-sm text-default-500">Remaining Provinces</p>
                <p className="text-2xl font-bold">
                  {INDONESIAN_PROVINCES.length - logistics.length}
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Logistics Table */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">
              Logistics Configurations ({filteredLogistics.length})
            </h3>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : filteredLogistics.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-default-500 mb-4">
                  {searchTerm
                    ? "No provinces found matching your search"
                    : "No logistics configurations found"}
                </p>
                {!searchTerm && (
                  <Button
                    color="primary"
                    startContent={<PlusIcon />}
                    onPress={handleAdd}
                  >
                    Add First Province
                  </Button>
                )}
              </div>
            ) : (
              <Table aria-label="Logistics configurations table">
                <TableHeader>
                  <TableColumn>PROVINCE ID</TableColumn>
                  <TableColumn>PROVINCE NAME</TableColumn>
                  <TableColumn>SHIPPING COST</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredLogistics.map((logisticsConfig) => (
                    <TableRow key={logisticsConfig.provinceId}>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {logisticsConfig.provinceId.slice(-8)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {logisticsConfig.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-success">
                          {formatCurrency(logisticsConfig.price)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <MoreVerticalIcon />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem
                              key="edit"
                              startContent={<EditIcon />}
                              onPress={() => handleEdit(logisticsConfig)}
                            >
                              Edit
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<TrashIcon />}
                              onPress={() => handleDelete(logisticsConfig)}
                            >
                              Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>

        {/* Add/Edit Logistics Modal */}
        <Modal isOpen={isOpen} size="md" onClose={handleModalClose}>
          <ModalContent>
            <ModalHeader>
              {isEditing ? "Edit Logistics Configuration" : "Add New Province"}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {isEditing ? (
                  <Input
                    isReadOnly
                    description="Province name cannot be changed"
                    label="Province Name"
                    value={formData.name}
                  />
                ) : (
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      htmlFor="province-select"
                    >
                      Province Name
                    </label>
                    <select
                      required
                      className="w-full p-3 border border-default-300 rounded-lg focus:border-primary focus:outline-none"
                      id="province-select"
                      value={formData.name}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select a province</option>
                      {getAvailableProvinces().map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <Input
                  isRequired
                  description="Shipping cost for this province"
                  label="Shipping Cost (Rp)"
                  min="0"
                  placeholder="Enter shipping cost"
                  step="1000"
                  type="number"
                  value={formData.price.toString()}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={handleModalClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                isLoading={submitting}
                onPress={handleSubmit}
              >
                {isEditing ? "Update" : "Create"} Configuration
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
