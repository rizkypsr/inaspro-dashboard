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
import { Select, SelectItem } from '@heroui/select';
import { Chip } from '@heroui/chip';
import { Tooltip } from '@heroui/tooltip';
import { Spinner } from '@heroui/spinner';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@/components/icons';
import { TvCategory, TvContent, CreateTvContentData, UpdateTvContentData } from '../../../types/tv';
import { TvCategoriesService } from '../../../lib/services/tv-categories-service';
import { TvContentsService } from '../../../lib/services/tv-contents-service';

interface FormData {
  title: string;
  image: string;
  link: string;
}

export default function TvContentsTab() {
  const [categories, setCategories] = useState<TvCategory[]>([]);
  const [contents, setContents] = useState<TvContent[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [contentsLoading, setContentsLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState<TvContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    image: '',
    link: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchContents();
    } else {
      setContents([]);
    }
  }, [selectedCategoryId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await TvCategoriesService.getCategories();
      setCategories(data);
      if (data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContents = async () => {
    if (!selectedCategoryId) return;
    
    try {
      setContentsLoading(true);
      const data = await TvContentsService.getContents(selectedCategoryId);
      setContents(data);
    } catch (error) {
      console.error('Error fetching contents:', error);
    } finally {
      setContentsLoading(false);
    }
  };

  const handleAdd = () => {
    if (!selectedCategoryId) {
      alert('Please select a category first');
      return;
    }
    
    setFormData({
      title: '',
      image: '',
      link: ''
    });
    setSelectedContent(null);
    setIsEditing(false);
    onOpen();
  };

  const handleEdit = (content: TvContent) => {
    setFormData({
      title: content.title,
      image: content.image,
      link: content.link
    });
    setSelectedContent(content);
    setIsEditing(true);
    onOpen();
  };

  const handleDelete = async (content: TvContent) => {
    if (!confirm(`Are you sure you want to delete "${content.title}"?`)) {
      return;
    }

    try {
      await TvContentsService.deleteContent(selectedCategoryId, content.id);
      fetchContents();
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    if (!formData.image.trim()) {
      alert('Image URL is required');
      return;
    }

    if (!formData.link.trim()) {
      alert('Link is required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (isEditing && selectedContent) {
        const updateData: UpdateTvContentData = {
          title: formData.title,
          image: formData.image,
          link: formData.link
        };
        await TvContentsService.updateContent(selectedCategoryId, selectedContent.id, updateData);
      } else {
        const createData: CreateTvContentData = {
          title: formData.title,
          image: formData.image,
          link: formData.link
        };
        await TvContentsService.createContent(selectedCategoryId, createData);
      }
      
      onClose();
      fetchContents();
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    onClose();
    setFormData({ title: '', image: '', link: '' });
    setSelectedContent(null);
    setIsEditing(false);
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

  const getSelectedCategoryName = () => {
    const category = categories.find(cat => cat.id === selectedCategoryId);
    return category ? category.title : 'Select Category';
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
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">TV Contents</h2>
          {categories.length > 0 && (
            <Select
              label="Category"
              placeholder="Select a category"
              selectedKeys={selectedCategoryId ? [selectedCategoryId] : []}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                setSelectedCategoryId(selected);
              }}
              className="w-64"
            >
              {categories.map((category) => (
                <SelectItem key={category.id}>
                  {category.title}
                </SelectItem>
              ))}
            </Select>
          )}
        </div>
        <Button
          color="primary"
          startContent={<PlusIcon className="h-4 w-4" />}
          onPress={handleAdd}
          isDisabled={!selectedCategoryId}
        >
          Add Content
        </Button>
      </div>

      {selectedCategoryId && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            Managing contents for: <span className="font-semibold">{getSelectedCategoryName()}</span>
          </p>
        </div>
      )}

      {contentsLoading ? (
        <div className="flex justify-center items-center h-32">
          <Spinner size="md" />
        </div>
      ) : (
        <Table aria-label="TV Contents table">
          <TableHeader>
            <TableColumn>TITLE</TableColumn>
            <TableColumn>IMAGE</TableColumn>
            <TableColumn>LINK</TableColumn>
            <TableColumn>CREATED AT</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent={selectedCategoryId ? "No contents found" : "Select a category to view contents"}>
            {contents.map((content) => (
              <TableRow key={content.id}>
                <TableCell>
                  <div className="font-medium">{content.title}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <img 
                      src={content.image} 
                      alt={content.title}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.src = '/placeholder-image.png';
                      }}
                    />
                    <span className="text-xs text-gray-500 truncate max-w-32">
                      {content.image}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Tooltip content={content.link}>
                    <a 
                      href={content.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 truncate max-w-32 block"
                    >
                      {content.link}
                    </a>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-500">
                    {formatDate(content.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Tooltip content="View content">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        as="a"
                        href={content.link}
                        target="_blank"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Edit content">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleEdit(content)}
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
                        onPress={() => handleDelete(content)}
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

      <Modal isOpen={isOpen} onClose={handleModalClose} size="lg">
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Edit Content' : 'Add New Content'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Title"
                placeholder="Enter content title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                isRequired
              />
              <Input
                label="Image URL"
                placeholder="Enter image URL"
                value={formData.image}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, image: e.target.value })}
                isRequired
              />
              <Input
                label="Link"
                placeholder="Enter content link"
                value={formData.link}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, link: e.target.value })}
                isRequired
              />
              {formData.image && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                  <img 
                    src={formData.image} 
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded border"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = '/placeholder-image.png';
                    }}
                  />
                </div>
              )}
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
    </div>
  );
}