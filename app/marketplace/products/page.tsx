'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Chip } from '@heroui/chip';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Input } from '@heroui/input';
import { Textarea } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Spinner } from '@heroui/spinner';
import { Image } from '@heroui/image';
import { Divider } from '@heroui/divider';
import { productsService, categoriesService } from '../../../lib/services/marketplace-service';
import { Product, Category, CreateProductData, ProductVariant } from '../../../types/marketplace';
import { ProtectedRoute } from '../../../components/protected-route';

// Icons as SVG components
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MoreVerticalIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// Toast utility
const toast = {
  success: (message: string) => alert(`Success: ${message}`),
  error: (message: string) => alert(`Error: ${message}`)
};

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  images: string[];
  variants: Omit<ProductVariant, 'variantId'>[];
}

const initialFormData: ProductFormData = {
  title: '',
  description: '',
  price: 0,
  categoryId: '',
  images: [],
  variants: []
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [variantForm, setVariantForm] = useState({ name: '', sku: '', price: 0, stock: 0 });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesData] = await Promise.all([
        productsService.getProducts({ search: searchTerm }),
        categoriesService.getCategories()
      ]);
      setProducts(productsResponse.data);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await productsService.getProducts({
        search: searchTerm,
        categoryId: selectedCategory || undefined
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.description || !formData.categoryId) {
        toast.error('Please fill in all required fields');
        return;
      }

      const productData: CreateProductData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        categoryId: formData.categoryId,
        images: formData.images,
        variants: formData.variants
      };

      if (editingProduct) {
        await productsService.updateProduct({
          productId: editingProduct.productId,
          ...productData
        });
        toast.success('Product updated successfully');
      } else {
        await productsService.createProduct(productData);
        toast.success('Product created successfully');
      }

      onClose();
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsService.deleteProduct(productId);
      toast.success('Product deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      images: product.images,
      variants: Object.values(product.variants || {})
    });
    onOpen();
  };

  const handleView = (product: Product) => {
    setViewingProduct(product);
    onViewOpen();
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingProduct(null);
    setImageUrl('');
    setVariantForm({ name: '', sku: '', price: 0, stock: 0 });
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()]
      }));
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addVariant = () => {
    if (variantForm.name && variantForm.sku) {
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, { ...variantForm }]
      }));
      setVariantForm({ name: '', sku: '', price: 0, stock: 0 });
    }
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.categoryId === categoryId);
    return category?.title || 'Unknown';
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'danger' as const, text: 'Out of Stock' };
    if (stock < 10) return { color: 'warning' as const, text: 'Low Stock' };
    return { color: 'success' as const, text: 'In Stock' };
  };

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Products Management</h1>
            <p className="text-default-500">Manage your product catalog</p>
          </div>
          <Button
            color="primary"
            startContent={<PlusIcon />}
            onPress={() => {
              resetForm();
              onOpen();
            }}
          >
            Add Product
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex gap-4 items-end">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                startContent={<SearchIcon />}
                className="flex-1"
              />
              <Select
                placeholder="All Categories"
                value={selectedCategory}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
                className="w-48"
              >
                <SelectItem key="" >All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.categoryId}>
                    {category.title}
                  </SelectItem>
                ))}
              </Select>
              <Button color="primary" onPress={handleSearch}>
                Search
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Products ({products.length})</h3>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : (
              <Table aria-label="Products table">
                <TableHeader>
                  <TableColumn>PRODUCT</TableColumn>
                  <TableColumn>CATEGORY</TableColumn>
                  <TableColumn>PRICE</TableColumn>
                  <TableColumn>STOCK</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    return (
                      <TableRow key={product.productId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {product.images[0] && (
                              <Image
                                src={product.images[0]}
                                alt={product.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium">{product.title}</p>
                              <p className="text-sm text-default-500 truncate max-w-xs">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                        <TableCell>Rp {product.price.toLocaleString()}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <Chip color={stockStatus.color} size="sm">
                            {stockStatus.text}
                          </Chip>
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
                                key="view"
                                startContent={<EyeIcon />}
                                onPress={() => handleView(product)}
                              >
                                View Details
                              </DropdownItem>
                              <DropdownItem
                                key="edit"
                                startContent={<EditIcon />}
                                onPress={() => handleEdit(product)}
                              >
                                Edit
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                className="text-danger"
                                color="danger"
                                startContent={<TrashIcon />}
                                onPress={() => handleDelete(product.productId)}
                              >
                                Delete
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>

        {/* Add/Edit Product Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
          <ModalContent>
            <ModalHeader>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Product Title"
                  placeholder="Enter product title"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  isRequired
                />
                
                <Textarea
                  label="Description"
                  placeholder="Enter product description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  isRequired
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Price"
                    type="number"
                    placeholder="0"
                    value={formData.price.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    startContent="Rp"
                    isRequired
                  />
                  
                  <Select
                    label="Category"
                    placeholder="Select category"
                    value={formData.categoryId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    isRequired
                  >
                    {categories.map((category) => (
                      <SelectItem key={category.categoryId}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Images Section */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Product Images</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Enter image URL"
                      value={imageUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button onPress={addImage}>Add</Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <Button
                          isIconOnly
                          size="sm"
                          color="danger"
                          className="absolute -top-2 -right-2"
                          onPress={() => removeImage(index)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Divider />

                {/* Variants Section */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Product Variants</label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <Input
                      placeholder="Variant name"
                      value={variantForm.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVariantForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="SKU"
                      value={variantForm.sku}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVariantForm(prev => ({ ...prev, sku: e.target.value }))}
                    />
                    <Input
                      placeholder="Price"
                      type="number"
                      value={variantForm.price.toString()}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVariantForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                    />
                    <div className="flex gap-1">
                      <Input
                        placeholder="Stock"
                        type="number"
                        value={variantForm.stock.toString()}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVariantForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                      />
                      <Button onPress={addVariant}>Add</Button>
                    </div>
                  </div>
                  
                  {formData.variants.length > 0 && (
                    <div className="space-y-2">
                      {formData.variants.map((variant, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-default-100 rounded">
                          <span>{variant.name} - {variant.sku} - Rp {variant.price.toLocaleString()} - Stock: {variant.stock}</span>
                          <Button
                            size="sm"
                            color="danger"
                            variant="light"
                            onPress={() => removeVariant(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                {editingProduct ? 'Update' : 'Create'} Product
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Product Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="2xl">
          <ModalContent>
            <ModalHeader>Product Details</ModalHeader>
            <ModalBody>
              {viewingProduct && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{viewingProduct.title}</h3>
                    <p className="text-default-500">{viewingProduct.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-default-500">Price</p>
                      <p className="font-medium">Rp {viewingProduct.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Stock</p>
                      <p className="font-medium">{viewingProduct.stock}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Category</p>
                      <p className="font-medium">{getCategoryName(viewingProduct.categoryId)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Created</p>
                      <p className="font-medium">{viewingProduct.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>

                  {viewingProduct.images.length > 0 && (
                    <div>
                      <p className="text-sm text-default-500 mb-2">Images</p>
                      <div className="grid grid-cols-3 gap-2">
                        {viewingProduct.images.map((image, index) => (
                          <Image
                            key={index}
                            src={image}
                            alt={`${viewingProduct.title} ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(viewingProduct.variants || {}).length > 0 && (
                    <div>
                      <p className="text-sm text-default-500 mb-2">Variants</p>
                      <div className="space-y-2">
                        {Object.values(viewingProduct.variants || {}).map((variant, index) => (
                          <div key={index} className="p-2 bg-default-100 rounded">
                            <p className="font-medium">{variant.name}</p>
                            <p className="text-sm text-default-500">
                              SKU: {variant.sku} | Price: Rp {variant.price.toLocaleString()} | Stock: {variant.stock}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onPress={onViewClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}