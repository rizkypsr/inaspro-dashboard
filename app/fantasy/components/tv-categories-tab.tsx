"use client";

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from '@heroui/table';
import { Button } from '@heroui/button';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/modal';
import { Input } from '@heroui/input';
import { Chip } from '@heroui/chip';
import { Tooltip } from '@heroui/tooltip';
import { Spinner } from '@heroui/spinner';
import { PlusIcon, PencilIcon, TrashIcon } from '@/components/icons';
import { TvCategory, CreateTvCategoryData, UpdateTvCategoryData, TvContent, CreateTvContentData } from '../../../types/tv';
import { TvCategoriesService } from '../../../lib/services/tv-categories-service';
import { TvContentsService } from '../../../lib/services/tv-contents-service';

interface FormData {
  title: string;
  order: number;
}

interface ContentFormData {
  title: string;
  image: string;
  link: string;
  imageFile: File | null;
}

export default function TvCategoriesTab() {
  const [categories, setCategories] = useState<TvCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<TvCategory | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    order: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contents, setContents] = useState<TvContent[]>([]);
  const [selectedCategoryForContents, setSelectedCategoryForContents] = useState<TvCategory | null>(null);
  const [contentFormData, setContentFormData] = useState<ContentFormData>({
    title: '',
    image: '',
    link: '',
    imageFile: null
  });
  const [selectedContent, setSelectedContent] = useState<TvContent | null>(null);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [isSubmittingContent, setIsSubmittingContent] = useState(false);
  const [loadingContents, setLoadingContents] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isContentModalOpen, onOpen: onContentModalOpen, onClose: onContentModalClose } = useDisclosure();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await TvCategoriesService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const nextOrder = await TvCategoriesService.getNextOrder();
    setFormData({
      title: '',
      order: nextOrder
    });
    setSelectedCategory(null);
    setIsEditing(false);
    onOpen();
  };

  const handleEdit = (category: TvCategory) => {
    setFormData({
      title: category.title,
      order: category.order
    });
    setSelectedCategory(category);
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async (category: TvCategory) => {
    if (!confirm(`Are you sure you want to delete "${category.title}"?`)) {
      return;
    }

    try {
      await TvCategoriesService.deleteCategory(category.id);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    if (formData.order < 1) {
      alert('Order must be at least 1');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (isEditing && selectedCategory) {
        const updateData: UpdateTvCategoryData = {
          title: formData.title,
          order: formData.order
        };
        await TvCategoriesService.updateCategory(selectedCategory.id, updateData);
      } else {
        const createData: CreateTvCategoryData = {
          title: formData.title,
          order: formData.order
        };
        await TvCategoriesService.createCategory(createData);
      }
      
      onClose();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    onClose();
    setFormData({ title: '', order: 1 });
    setSelectedCategory(null);
    setIsEditing(false);
  };

  const handleManageContents = async (category: TvCategory) => {
    setSelectedCategoryForContents(category);
    setLoadingContents(true);
    try {
      const categoryContents = await TvContentsService.getContents(category.id);
      setContents(categoryContents);
    } catch (error) {
      console.error('Error fetching contents:', error);
      setContents([]);
    } finally {
      setLoadingContents(false);
    }
    onContentModalOpen();
  };

  const handleAddContent = () => {
    setContentFormData({
      title: '',
      image: '',
      link: '',
      imageFile: null
    });
    setSelectedContent(null);
    setIsEditingContent(false);
  };

  const handleEditContent = (content: TvContent) => {
    setContentFormData({
        title: content.title,
        image: content.image,
        link: content.link,
        imageFile: null
      });
    setSelectedContent(content);
    setIsEditingContent(true);
  };

  const handleDeleteContent = async (content: TvContent) => {
    if (!confirm(`Are you sure you want to delete "${content.title}"?`)) {
      return;
    }

    if (!selectedCategoryForContents) return;

    try {
      await TvContentsService.deleteContent(selectedCategoryForContents.id, content.id);
      const updatedContents = await TvContentsService.getContents(selectedCategoryForContents.id);
      setContents(updatedContents);
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      // Upload to Firebase Storage using MCP
      const fileName = `tv-contents/${Date.now()}-${file.name}`;
      const result = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName,
          fileContent: await fileToBase64(file),
          contentType: file.type
        })
      });
      
      if (!result.ok) {
        throw new Error('Failed to upload image');
      }
      
      const { downloadURL } = await result.json();
      return downloadURL;
    } finally {
      setUploadingImage(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmitContent = async () => {
    if (!contentFormData.title.trim()) {
      alert('Title is required');
      return;
    }

    if (!selectedCategoryForContents) return;

    try {
      setIsSubmittingContent(true);
      
      let imageUrl = contentFormData.image;
      
      // Upload new image if file is selected
      if (contentFormData.imageFile) {
        imageUrl = await handleImageUpload(contentFormData.imageFile);
      }
      
      const contentData = {
        title: contentFormData.title,
        image: imageUrl,
        link: contentFormData.link
      };
      
      if (isEditingContent && selectedContent) {
        await TvContentsService.updateContent(
          selectedCategoryForContents.id,
          selectedContent.id,
          contentData
        );
      } else {
        const createData: CreateTvContentData = {
          ...contentData
        };
        await TvContentsService.createContent(selectedCategoryForContents.id, createData);
      }
      
      const updatedContents = await TvContentsService.getContents(selectedCategoryForContents.id);
      setContents(updatedContents);
      setContentFormData({ title: '', image: '', link: '', imageFile: null });
      setSelectedContent(null);
      setIsEditingContent(false);
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content');
    } finally {
      setIsSubmittingContent(false);
    }
  };

  const handleContentModalClose = () => {
    onContentModalClose();
    setContentFormData({ title: '', image: '', link: '', imageFile: null });
    setSelectedContent(null);
    setIsEditingContent(false);
    setSelectedCategoryForContents(null);
    setContents([]);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">TV Categories</h2>
        <Button
          color="primary"
          startContent={<PlusIcon className="h-4 w-4" />}
          onPress={handleAdd}
        >
          Add Category
        </Button>
      </div>

      <Table aria-label="TV Categories table">
        <TableHeader>
          <TableColumn>TITLE</TableColumn>
          <TableColumn>ORDER</TableColumn>
          <TableColumn>CREATED AT</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent="No categories found">
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                <div className="font-medium">{category.title}</div>
              </TableCell>
              <TableCell>
                <Chip size="sm" variant="flat" color="primary">
                  {category.order}
                </Chip>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-500">
                  {formatDate(category.createdAt)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Tooltip content="Manage contents">
                    <Button
                      size="sm"
                      variant="flat"
                      color="secondary"
                      onPress={() => handleManageContents(category)}
                    >
                      Contents
                    </Button>
                  </Tooltip>
                  <Tooltip content="Edit category">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleEdit(category)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Delete category" color="danger">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={() => handleDelete(category)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onClose={handleModalClose} size="md">
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Title"
                placeholder="Enter category title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                isRequired
              />
              <Input
                label="Order"
                type="number"
                placeholder="Enter display order"
                value={formData.order.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                min={1}
                isRequired
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleModalClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={isSubmitting}
            >
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Content Management Modal */}
      <Modal isOpen={isContentModalOpen} onClose={handleContentModalClose} size="4xl">
        <ModalContent>
          <ModalHeader>
            Manage Contents - {selectedCategoryForContents?.title}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* Add Content Form */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-4">
                  {isEditingContent ? 'Edit Content' : 'Add New Content'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Title"
                    placeholder="Enter content title"
                    value={contentFormData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setContentFormData({ ...contentFormData, title: e.target.value })
                    }
                    isRequired
                  />
                  <Input
                    label="Link URL"
                    placeholder="Enter link URL"
                    value={contentFormData.link}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setContentFormData({ ...contentFormData, link: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Image URL"
                    placeholder="Enter image URL or upload file"
                    value={contentFormData.image}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setContentFormData({ ...contentFormData, image: e.target.value })
                    }
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Image File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0] || null;
                        setContentFormData({ ...contentFormData, imageFile: file });
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {uploadingImage && (
                      <div className="flex items-center gap-2 mt-2">
                        <Spinner size="sm" />
                        <span className="text-sm text-gray-500">Uploading image...</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    color="primary"
                    onPress={handleSubmitContent}
                    isLoading={isSubmittingContent}
                  >
                    {isEditingContent ? 'Update Content' : 'Add Content'}
                  </Button>
                  {isEditingContent && (
                    <Button
                      variant="light"
                      onPress={handleAddContent}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </div>

              {/* Contents List */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contents List</h3>
                {loadingContents ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <Table aria-label="Contents table">
                    <TableHeader>
                      <TableColumn>TITLE</TableColumn>
                      <TableColumn>IMAGE</TableColumn>
                      <TableColumn>LINK</TableColumn>
                      <TableColumn>CREATED AT</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="No contents found">
                      {contents.map((content) => (
                        <TableRow key={content.id}>
                          <TableCell>
                            <div className="font-medium">{content.title}</div>
                          </TableCell>
                          <TableCell>
                            {content.image ? (
                              <img 
                                src={content.image} 
                                alt={content.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <span className="text-gray-400">No image</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {content.link ? (
                              <a 
                                href={content.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                View Link
                              </a>
                            ) : (
                              <span className="text-gray-400">No link</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {formatDate(content.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Tooltip content="Edit content">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  onPress={() => handleEditContent(content)}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                              </Tooltip>
                              <Tooltip content="Delete content" color="danger">
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  color="danger"
                                  onPress={() => handleDeleteContent(content)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleContentModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}