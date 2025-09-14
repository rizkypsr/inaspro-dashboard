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

import { categoriesService } from "../../../lib/services/marketplace-service";
import { Category } from "../../../types/marketplace";
import { ProtectedRoute } from "../../../components/protected-route";

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

// Toast utility
const toast = {
  success: (message: string) => alert(`Success: ${message}`),
  error: (message: string) => alert(`Error: ${message}`),
};

interface CategoryFormData {
  title: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [formData, setFormData] = useState<CategoryFormData>({
    title: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesService.getCategories();

      setCategories(response);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    await loadCategories();
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setFormData({ title: "" });
    setIsEditing(false);
    onOpen();
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      title: category.title,
    });
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.title}"?`)) {
      return;
    }

    try {
      await categoriesService.deleteCategory(category.categoryId);
      toast.success("Category deleted successfully");
      loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Category title is required");

      return;
    }

    try {
      setSubmitting(true);

      if (isEditing && selectedCategory) {
        await categoriesService.updateCategory(selectedCategory.categoryId, {
          title: formData.title.trim(),
        });
        toast.success("Category updated successfully");
      } else {
        await categoriesService.createCategory({
          title: formData.title.trim(),
        });
        toast.success("Category created successfully");
      }

      onClose();
      loadCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    onClose();
    setFormData({ title: "" });
    setSelectedCategory(null);
    setIsEditing(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Categories Management</h1>
            <p className="text-default-500">
              Organize products with categories
            </p>
          </div>
          <Button
            color="primary"
            startContent={<PlusIcon />}
            onPress={handleAdd}
          >
            Add Category
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex gap-4 items-end">
              <Input
                className="flex-1"
                placeholder="Search categories..."
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

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">
              Categories ({categories.length})
            </h3>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-default-500 mb-4">No categories found</p>
                <Button
                  color="primary"
                  startContent={<PlusIcon />}
                  onPress={handleAdd}
                >
                  Add First Category
                </Button>
              </div>
            ) : (
              <Table aria-label="Categories table">
                <TableHeader>
                  <TableColumn>CATEGORY ID</TableColumn>
                  <TableColumn>TITLE</TableColumn>
                  <TableColumn>CREATED AT</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.categoryId}>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {category.categoryId.slice(-8)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{category.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(category.createdAt)}
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
                              onPress={() => handleEdit(category)}
                            >
                              Edit
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<TrashIcon />}
                              onPress={() => handleDelete(category)}
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

        {/* Add/Edit Category Modal */}
        <Modal isOpen={isOpen} size="md" onClose={handleModalClose}>
          <ModalContent>
            <ModalHeader>
              {isEditing ? "Edit Category" : "Add New Category"}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  isRequired
                  label="Category Title"
                  placeholder="Enter category title"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
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
                {isEditing ? "Update" : "Create"} Category
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
