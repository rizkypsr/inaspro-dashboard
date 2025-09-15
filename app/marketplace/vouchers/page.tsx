'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Chip } from '@heroui/chip';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Switch } from '@heroui/switch';
import { Spinner } from '@heroui/spinner';
import { vouchersService } from '../../../lib/services/marketplace-service';
import { Voucher } from '../../../types/marketplace';
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

const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

// Toast utility
const toast = {
  success: (message: string) => alert(`Success: ${message}`),
  error: (message: string) => alert(`Error: ${message}`)
};

type VoucherType = 'percentage' | 'flat';

interface VoucherFormData {
  code: string;
  type: VoucherType;
  value: number;
  minPurchase: number;
  validUntil: string;
  isActive: boolean;
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [formData, setFormData] = useState<VoucherFormData>({
    code: '',
    type: 'percentage',
    value: 0,
    minPurchase: 0,
    validUntil: '',
    isActive: true
  });
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const response = await vouchersService.getVouchers();
      setVouchers(response);
    } catch (error) {
      console.error('Error loading vouchers:', error);
      toast.error('Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    await loadVouchers();
  };

  const handleAdd = () => {
    setSelectedVoucher(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      minPurchase: 0,
      validUntil: '',
      isActive: true
    });
    setIsEditing(false);
    onOpen();
  };

  const handleEdit = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setFormData({
      code: voucher.code,
      type: voucher.type,
      value: voucher.value,
      minPurchase: voucher.minPurchase,
      validUntil: new Date(voucher.validUntil).toISOString().split('T')[0],
      isActive: voucher.isActive
    });
    setIsEditing(true);
    onOpen();
  };

  const handleView = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    onViewOpen();
  };

  const handleDelete = async (voucher: Voucher) => {
    if (!confirm(`Are you sure you want to delete voucher "${voucher.code}"?`)) {
      return;
    }

    try {
      await vouchersService.deleteVoucher(voucher.voucherId);
      toast.success('Voucher deleted successfully');
      loadVouchers();
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast.error('Failed to delete voucher');
    }
  };

  const handleToggleStatus = async (voucher: Voucher) => {
    try {
      await vouchersService.updateVoucher(voucher.voucherId, {
        isActive: !voucher.isActive
      });
      toast.success(`Voucher ${!voucher.isActive ? 'activated' : 'deactivated'} successfully`);
      loadVouchers();
    } catch (error) {
      console.error('Error updating voucher status:', error);
      toast.error('Failed to update voucher status');
    }
  };

  const validateForm = (): string | null => {
    if (!formData.code.trim()) {
      return 'Voucher code is required';
    }
    if (formData.code.length < 3) {
      return 'Voucher code must be at least 3 characters';
    }
    if (!/^[A-Z0-9]+$/.test(formData.code)) {
      return 'Voucher code must contain only uppercase letters and numbers';
    }
    if (formData.value <= 0) {
      return 'Discount value must be greater than 0';
    }
    if (formData.type === 'percentage' && formData.value > 100) {
      return 'Percentage discount cannot exceed 100%';
    }
    if (formData.minPurchase < 0) {
      return 'Minimum purchase cannot be negative';
    }
    if (!formData.validUntil) {
      return 'Valid until date is required';
    }
    if (new Date(formData.validUntil) <= new Date()) {
      return 'Valid until date must be in the future';
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSubmitting(true);
      
      const voucherData = {
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        value: formData.value,
        minPurchase: formData.minPurchase,
        validUntil: new Date(formData.validUntil),
        isActive: formData.isActive
      };
      
      if (isEditing && selectedVoucher) {
        await vouchersService.updateVoucher(selectedVoucher.voucherId, voucherData);
        toast.success('Voucher updated successfully');
      } else {
        await vouchersService.createVoucher(voucherData);
        toast.success('Voucher created successfully');
      }
      
      onClose();
      loadVouchers();
    } catch (error) {
      console.error('Error saving voucher:', error);
      toast.error('Failed to save voucher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    onClose();
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      minPurchase: 0,
      validUntil: '',
      isActive: true
    });
    setSelectedVoucher(null);
    setIsEditing(false);
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (date: Date) => {
    return new Date(date) <= new Date();
  };

  const getStatusColor = (voucher: Voucher) => {
    if (!voucher.isActive) return 'default';
    if (isExpired(voucher.validUntil)) return 'danger';
    return 'success';
  };

  const getStatusText = (voucher: Voucher) => {
    if (!voucher.isActive) return 'Inactive';
    if (isExpired(voucher.validUntil)) return 'Expired';
    return 'Active';
  };

  const filteredVouchers = vouchers.filter(voucher => {
    const matchesSearch = voucher.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && voucher.isActive && !isExpired(voucher.validUntil)) ||
      (statusFilter === 'inactive' && !voucher.isActive) ||
      (statusFilter === 'expired' && isExpired(voucher.validUntil));
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Vouchers Management</h1>
            <p className="text-default-500">Create and manage discount vouchers</p>
          </div>
          <Button color="primary" startContent={<PlusIcon />} onPress={handleAdd}>
            Add Voucher
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex gap-4 items-end">
              <Input
                placeholder="Search vouchers by code..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                startContent={<SearchIcon />}
                className="flex-1"
              />
              <Select
                placeholder="All Status"
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                className="w-48"
              >
                <SelectItem key="">All Status</SelectItem>
                <SelectItem key="active">Active</SelectItem>
                <SelectItem key="inactive">Inactive</SelectItem>
                <SelectItem key="expired">Expired</SelectItem>
              </Select>
              <Button color="primary" onPress={handleSearch}>
                Search
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Vouchers Table */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Vouchers ({filteredVouchers.length})</h3>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : filteredVouchers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-default-500 mb-4">No vouchers found</p>
                <Button color="primary" startContent={<PlusIcon />} onPress={handleAdd}>
                  Add First Voucher
                </Button>
              </div>
            ) : (
              <Table aria-label="Vouchers table">
                <TableHeader>
                  <TableColumn>CODE</TableColumn>
                  <TableColumn>TYPE</TableColumn>
                  <TableColumn>DISCOUNT</TableColumn>
                  <TableColumn>MIN PURCHASE</TableColumn>
                  <TableColumn>VALID UNTIL</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredVouchers.map((voucher) => (
                    <TableRow key={voucher.voucherId}>
                      <TableCell>
                        <div className="font-mono font-bold text-primary">
                          {voucher.code}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" className="capitalize">
                          {voucher.type}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {voucher.type === 'percentage' 
                            ? `${voucher.value}%` 
                            : formatCurrency(voucher.value)
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {formatCurrency(voucher.minPurchase)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={isExpired(voucher.validUntil) ? 'text-danger' : ''}>
                          {formatDate(voucher.validUntil)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          color={getStatusColor(voucher)} 
                          size="sm"
                        >
                          {getStatusText(voucher)}
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
                              onPress={() => handleView(voucher)}
                            >
                              View Details
                            </DropdownItem>
                            <DropdownItem
                              key="edit"
                              startContent={<EditIcon />}
                              onPress={() => handleEdit(voucher)}
                            >
                              Edit
                            </DropdownItem>
                            <DropdownItem
                              key="toggle"
                              startContent={voucher.isActive ? <EyeOffIcon /> : <EyeIcon />}
                              onPress={() => handleToggleStatus(voucher)}
                            >
                              {voucher.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<TrashIcon />}
                              onPress={() => handleDelete(voucher)}
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

        {/* Add/Edit Voucher Modal */}
        <Modal isOpen={isOpen} onClose={handleModalClose} size="2xl">
          <ModalContent>
            <ModalHeader>
              {isEditing ? 'Edit Voucher' : 'Add New Voucher'}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Voucher Code"
                    placeholder="e.g., DISC10"
                    value={formData.code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))
                    }
                    isRequired
                    description="Only uppercase letters and numbers"
                  />
                  <Select
                    label="Discount Type"
                    value={formData.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                      setFormData(prev => ({ ...prev, type: e.target.value as VoucherType }))
                    }
                    isRequired
                  >
                    <SelectItem key="percentage">Percentage (%)</SelectItem>
                    <SelectItem key="flat">Fixed Amount (Rp)</SelectItem>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={`Discount Value ${formData.type === 'percentage' ? '(%)' : '(Rp)'}`}
                    type="number"
                    placeholder={formData.type === 'percentage' ? '10' : '50000'}
                    value={formData.value.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))
                    }
                    isRequired
                    min="0"
                    max={formData.type === 'percentage' ? "100" : undefined}
                  />
                  <Input
                    label="Minimum Purchase (Rp)"
                    type="number"
                    placeholder="0"
                    value={formData.minPurchase.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setFormData(prev => ({ ...prev, minPurchase: parseFloat(e.target.value) || 0 }))
                    }
                    min="0"
                  />
                </div>

                <Input
                  label="Valid Until"
                  type="date"
                  value={formData.validUntil}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFormData(prev => ({ ...prev, validUntil: e.target.value }))
                  }
                  isRequired
                  min={new Date().toISOString().split('T')[0]}
                />

                <Switch
                  isSelected={formData.isActive}
                  onValueChange={(value: boolean) => 
                    setFormData(prev => ({ ...prev, isActive: value }))
                  }
                >
                  Active
                </Switch>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={handleModalClose}>
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={handleSubmit}
                isLoading={submitting}
              >
                {isEditing ? 'Update' : 'Create'} Voucher
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Voucher Modal */}
        <Modal isOpen={isViewOpen} onClose={onViewClose} size="md">
          <ModalContent>
            <ModalHeader>Voucher Details</ModalHeader>
            <ModalBody>
              {selectedVoucher && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold font-mono text-primary mb-2">
                      {selectedVoucher.code}
                    </div>
                    <Chip color={getStatusColor(selectedVoucher)}>
                      {getStatusText(selectedVoucher)}
                    </Chip>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-default-500">Discount Type</p>
                      <p className="font-medium capitalize">{selectedVoucher.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Discount Value</p>
                      <p className="font-medium">
                        {selectedVoucher.type === 'percentage' 
                          ? `${selectedVoucher.value}%` 
                          : formatCurrency(selectedVoucher.value)
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Minimum Purchase</p>
                      <p className="font-medium">{formatCurrency(selectedVoucher.minPurchase)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Valid Until</p>
                      <p className={`font-medium ${isExpired(selectedVoucher.validUntil) ? 'text-danger' : ''}`}>
                        {formatDate(selectedVoucher.validUntil)}
                      </p>
                    </div>
                  </div>
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