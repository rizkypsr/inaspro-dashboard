"use client";

import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Button } from '@heroui/button';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Input, Textarea } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Chip } from '@heroui/chip';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@/components/icons';
import { shoesService, Shoe, CreateShoeData } from '@/lib/services/shoes-service';
import { useParams } from 'next/navigation';

// Shoe interface is now imported from shoes-service

interface FormData {
  name: string;
  description: string;
  price: number;
  size: string;
  images: string[];
}

const sizeOptions = [
  { key: "38", label: "38" },
  { key: "39", label: "39" },
  { key: "40", label: "40" },
  { key: "41", label: "41" },
  { key: "42", label: "42" },
  { key: "43", label: "43" },
  { key: "44", label: "44" },
  { key: "45", label: "45" },
];

// Shoes data now loaded from Firestore

export default function ShoesTab() {
  const params = useParams();
  const eventId = params.id as string;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedShoe, setSelectedShoe] = useState<Shoe | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: 0,
    size: '',
    images: [],
  });
  const [uploadingImages, setUploadingImages] = useState(false);

  // Load shoes when component mounts
  useEffect(() => {
    if (eventId) {
      loadShoes();
    }
  }, [eventId]);

  const loadShoes = async () => {
    if (!eventId) return;
    
    setLoading(true);
    try {
      const shoesData = await shoesService.getShoesByFantasyId(eventId);
      setShoes(shoesData);
    } catch (error) {
      console.error('Error loading shoes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedShoe(null);
    setIsEditing(false);
    setFormData({
        name: '',
        description: '',
        price: 0,
        size: '',
        images: [],
      });
    onOpen();
  };

  const handleEdit = (shoe: Shoe) => {
    setSelectedShoe(shoe);
    setIsEditing(true);
    setFormData({
        name: shoe.name,
        description: shoe.description,
        price: shoe.price,
        size: shoe.size.toString(),
        images: shoe.images || [],
      });
    onOpen();
  };

  const handleView = (shoe: Shoe) => {
    setSelectedShoe(shoe);
    setIsEditing(false);
    setFormData({
        name: shoe.name,
        description: shoe.description,
        price: shoe.price,
        size: shoe.size.toString(),
        images: shoe.images || [],
      });
    onOpen();
  };

  const handleSave = async () => {
    if (!eventId) return;
    
    try {
      if (isEditing && selectedShoe?.id) {
        const updateData = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          size: parseInt(formData.size),
          images: formData.images,
        };
        await shoesService.updateShoe(selectedShoe.id, updateData);
      } else {
        const createData: CreateShoeData = {
          name: formData.name,
          description: formData.description,
          images: formData.images,
          price: formData.price,
          size: parseInt(formData.size),
          fantasyId: eventId,
        };
        await shoesService.createShoe(createData);
      }
      await loadShoes();
      onClose();
    } catch (error) {
      console.error('Error saving shoe:', error);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileName = `shoes/${eventId}/${Date.now()}_${file.name}`;
        const uploadResult = await uploadToFirebaseStorage(fileName, file);
        return uploadResult.downloadURL;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
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
      const response = await fetch('/api/firebase/storage/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: filePath,
          content: fileContent,
          contentType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      return { downloadURL: result.downloadUrl };
    } catch (error) {
      console.error('Error uploading to Firebase Storage:', error);
      throw error;
    }
  };

  const handleDelete = async (shoe: Shoe) => {
    if (!shoe.id) return;
    
    try {
      await shoesService.deleteShoe(shoe.id);
      await loadShoes();
    } catch (error) {
      console.error('Error deleting shoe:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
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
          <h2 className="text-2xl font-bold">Shoes</h2>
          <p className="text-gray-600">{shoes.length} shoe models available</p>
        </div>
        <Button color="primary" onPress={handleAdd} startContent={<PlusIcon />}>
          Add Shoe
        </Button>
      </div>

      <Table aria-label="Shoes table">
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>DESCRIPTION</TableColumn>
          <TableColumn>SIZE</TableColumn>
          <TableColumn>PRICE</TableColumn>
          <TableColumn>CREATED DATE</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody emptyContent={loading ? "Loading..." : "No shoes found"}>
          {shoes.map((shoe) => (
            <TableRow key={shoe.id}>
              <TableCell>{shoe.name}</TableCell>
              <TableCell>{shoe.description}</TableCell>
              <TableCell>{shoe.size}</TableCell>
              <TableCell>Rp {shoe.price.toLocaleString()}</TableCell>
              <TableCell>
                {shoe.createdAt ? new Date(shoe.createdAt.seconds * 1000).toLocaleDateString() : '-'}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => handleView(shoe)}
                  >
                    <EyeIcon />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => handleEdit(shoe)}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => handleDelete(shoe)}
                  >
                    <TrashIcon />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            {isEditing ? 'Edit Shoe' : selectedShoe ? 'Shoe Details' : 'Add New Shoe'}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Shoe Name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, name: e.target.value })
                }
                isReadOnly={!!(selectedShoe && !isEditing)}
              />
              <Select
                label="Size"
                selectedKeys={formData.size ? [formData.size] : []}
                onSelectionChange={(keys: any) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  setFormData({ ...formData, size: selectedKey });
                }}
                isDisabled={!!(selectedShoe && !isEditing)}
              >
                {sizeOptions.map((option) => (
                  <SelectItem key={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
              <Input
                label="Price (IDR)"
                type="number"
                value={formData.price.toString()}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
                }
                isReadOnly={!!(selectedShoe && !isEditing)}
              />
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, description: e.target.value })
                }
                isReadOnly={!!(selectedShoe && !isEditing)}
              />
              
              {/* Images Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Images</label>
                
                {/* Add new image */}
                {(isEditing || !selectedShoe) && (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={uploadingImages}
                    />
                    {uploadingImages && (
                      <p className="text-sm text-blue-600">Uploading images...</p>
                    )}
                  </div>
                )}
                
                {/* Display existing images */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {formData.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Shoe image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-image.png';
                          }}
                        />
                        {(isEditing || !selectedShoe) && (
                          <Button
                            isIconOnly
                            color="danger"
                            variant="flat"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onPress={() => handleRemoveImage(index)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {formData.images.length === 0 && (
                  <p className="text-gray-500 text-sm">No images added yet</p>
                )}
              </div>

            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              {selectedShoe && !isEditing ? 'Close' : 'Cancel'}
            </Button>
            {(!selectedShoe || isEditing) && (
              <Button color="primary" onPress={handleSave}>
                {isEditing ? 'Update' : 'Add'} Shoe
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}