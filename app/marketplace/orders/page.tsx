"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { Chip } from "@heroui/chip";
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
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";

import { ordersService } from "../../../lib/services/marketplace-service";
import { Order } from "../../../types/marketplace";
import { ProtectedRoute } from "../../../components/protected-route";

// Icons as SVG components
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

const EyeIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
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

// Toast utility
const toast = {
  success: (message: string) => alert(`Success: ${message}`),
  error: (message: string) => alert(`Error: ${message}`),
};

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";
type PaymentStatus = "pending" | "paid" | "failed";

interface OrderUpdateData {
  status?: OrderStatus;
  trackingNumber?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateData, setUpdateData] = useState<OrderUpdateData>({});

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();
  const {
    isOpen: isUpdateOpen,
    onOpen: onUpdateOpen,
    onClose: onUpdateClose,
  } = useDisclosure();

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ordersService.getOrders({
        search: searchTerm,
        status: (statusFilter as OrderStatus) || undefined,
        paymentStatus: (paymentFilter as PaymentStatus) || undefined,
      });

      setOrders(response.data);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, paymentFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSearch = async () => {
    await loadOrders();
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    onViewOpen();
  };

  const handleUpdateOrder = (order: Order) => {
    setSelectedOrder(order);
    setUpdateData({
      status: order.status,
      trackingNumber: order.logistics?.trackingNumber || "",
    });
    onUpdateOpen();
  };

  const handleSubmitUpdate = async () => {
    if (!selectedOrder) return;

    try {
      await ordersService.updateOrderStatus({
        orderId: selectedOrder.orderId,
        status: updateData.status!,
        trackingNumber: updateData.trackingNumber,
      });
      toast.success("Order updated successfully");
      onUpdateClose();
      loadOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "primary";
      case "shipped":
        return "secondary";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "pending":
        return "warning";
      case "paid":
        return "success";
      case "failed":
        return "danger";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString()}`;
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
            <h1 className="text-2xl font-bold">Orders Management</h1>
            <p className="text-default-500">
              Monitor and manage customer orders
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex gap-4 items-end">
              <Input
                className="flex-1"
                placeholder="Search orders by ID or customer..."
                startContent={<SearchIcon />}
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
              />
              <Select
                className="w-48"
                placeholder="All Status"
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setStatusFilter(e.target.value)
                }
              >
                <SelectItem key="">All Status</SelectItem>
                <SelectItem key="pending">Pending</SelectItem>
                <SelectItem key="processing">Processing</SelectItem>
                <SelectItem key="shipped">Shipped</SelectItem>
                <SelectItem key="completed">Completed</SelectItem>
                <SelectItem key="cancelled">Cancelled</SelectItem>
              </Select>
              <Select
                className="w-48"
                placeholder="All Payments"
                value={paymentFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setPaymentFilter(e.target.value)
                }
              >
                <SelectItem key="">All Payments</SelectItem>
                <SelectItem key="pending">Pending</SelectItem>
                <SelectItem key="paid">Paid</SelectItem>
                <SelectItem key="failed">Failed</SelectItem>
              </Select>
              <Button color="primary" onPress={handleSearch}>
                Search
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Orders ({orders.length})</h3>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : (
              <Table aria-label="Orders table">
                <TableHeader>
                  <TableColumn>ORDER ID</TableColumn>
                  <TableColumn>CUSTOMER</TableColumn>
                  <TableColumn>ITEMS</TableColumn>
                  <TableColumn>TOTAL</TableColumn>
                  <TableColumn>PAYMENT</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>DATE</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell>
                        <div className="font-mono text-sm">
                          #{order.orderId.slice(-8)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.userId}</p>
                          <p className="text-sm text-default-500">
                            {order.shippingAddress.provinceName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.items.length} items
                          </p>
                          <p className="text-sm text-default-500">
                            {order.items[0]?.title}
                            {order.items.length > 1 &&
                              ` +${order.items.length - 1} more`}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {formatCurrency(order.finalAmount)}
                          </p>
                          {order.discount > 0 && (
                            <p className="text-sm text-success">
                              -{formatCurrency(order.discount)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          className="capitalize"
                          color={getPaymentStatusColor(order.payment.status)}
                          size="sm"
                        >
                          {order.payment.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          className="capitalize"
                          color={getStatusColor(order.status)}
                          size="sm"
                        >
                          {order.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(order.createdAt)}
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
                              key="view"
                              startContent={<EyeIcon />}
                              onPress={() => handleViewOrder(order)}
                            >
                              View Details
                            </DropdownItem>
                            <DropdownItem
                              key="update"
                              startContent={<EditIcon />}
                              onPress={() => handleUpdateOrder(order)}
                            >
                              Update Status
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

        {/* View Order Modal */}
        <Modal
          isOpen={isViewOpen}
          scrollBehavior="inside"
          size="3xl"
          onClose={onViewClose}
        >
          <ModalContent>
            <ModalHeader>Order Details</ModalHeader>
            <ModalBody>
              {selectedOrder && (
                <div className="space-y-6">
                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-default-500">Order ID</p>
                      <p className="font-mono">#{selectedOrder.orderId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Customer ID</p>
                      <p className="font-medium">{selectedOrder.userId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Status</p>
                      <Chip
                        className="capitalize"
                        color={getStatusColor(selectedOrder.status)}
                      >
                        {selectedOrder.status}
                      </Chip>
                    </div>
                    <div>
                      <p className="text-sm text-default-500">Payment Status</p>
                      <Chip
                        className="capitalize"
                        color={getPaymentStatusColor(
                          selectedOrder.payment.status,
                        )}
                      >
                        {selectedOrder.payment.status}
                      </Chip>
                    </div>
                  </div>

                  <Divider />

                  {/* Items */}
                  <div>
                    <h4 className="font-semibold mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-default-50 rounded"
                        >
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-default-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                            <p className="text-sm text-default-500">
                              {formatCurrency(item.price)} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Divider />

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-success">
                        <span>Discount</span>
                        <span>-{formatCurrency(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>
                        {formatCurrency(selectedOrder.logistics?.price || 0)}
                      </span>
                    </div>
                    <Divider />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>{formatCurrency(selectedOrder.finalAmount)}</span>
                    </div>
                  </div>

                  <Divider />

                  {/* Shipping Address */}
                  <div>
                    <h4 className="font-semibold mb-2">Shipping Address</h4>
                    <div className="p-3 bg-default-50 rounded">
                      <p>{selectedOrder.shippingAddress.fullAddress}</p>
                      <p>
                        {selectedOrder.shippingAddress.provinceName}{" "}
                        {selectedOrder.shippingAddress.postalCode}
                      </p>
                    </div>
                  </div>

                  {/* Tracking */}
                  {selectedOrder.logistics?.trackingNumber && (
                    <div>
                      <h4 className="font-semibold mb-2">
                        Tracking Information
                      </h4>
                      <div className="p-3 bg-default-50 rounded">
                        <p className="font-mono">
                          {selectedOrder.logistics.trackingNumber}
                        </p>
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

        {/* Update Order Modal */}
        <Modal isOpen={isUpdateOpen} size="md" onClose={onUpdateClose}>
          <ModalContent>
            <ModalHeader>Update Order Status</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Select
                  isRequired
                  label="Order Status"
                  value={updateData.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setUpdateData((prev) => ({
                      ...prev,
                      status: e.target.value as OrderStatus,
                    }))
                  }
                >
                  <SelectItem key="pending">Pending</SelectItem>
                  <SelectItem key="processing">Processing</SelectItem>
                  <SelectItem key="shipped">Shipped</SelectItem>
                  <SelectItem key="completed">Completed</SelectItem>
                  <SelectItem key="cancelled">Cancelled</SelectItem>
                </Select>

                <Input
                  label="Tracking Number"
                  placeholder="Enter tracking number (optional)"
                  value={updateData.trackingNumber || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setUpdateData((prev) => ({
                      ...prev,
                      trackingNumber: e.target.value,
                    }))
                  }
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onUpdateClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmitUpdate}>
                Update Order
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
