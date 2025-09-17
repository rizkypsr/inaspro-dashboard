"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { useParams } from "next/navigation";

import { EyeIcon } from "@/components/icons";
import { paymentsService, Payment } from "@/lib/services/payments-service";

const paymentMethods = [
  { key: "bank_transfer", label: "Bank Transfer" },
  { key: "credit_card", label: "Credit Card" },
  { key: "e_wallet", label: "E-Wallet" },
  { key: "cash", label: "Cash" },
];

export default function PaymentsTab() {
  const params = useParams();
  const eventId = params.id as string;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPayments = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      const fetchedPayments =
        await paymentsService.getPaymentsByFantasyId(eventId);

      setPayments(fetchedPayments);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadPayments();
    }
  }, [eventId]);

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment);
    onOpen();
  };

  const getStatusColor = (status: Payment["status"]) => {
    switch (status.toUpperCase()) {
      case "PAID":
        return "success";
      case "PENDING":
        return "warning";
      case "FAILED":
        return "danger";
      case "EXPIRED":
        return "secondary";
      default:
        return "default";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methodMap: Record<string, string> = {
      bank_transfer: "Bank Transfer",
      credit_card: "Credit Card",
      e_wallet: "E-Wallet",
      cash: "Cash",
    };

    return methodMap[method] || method;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalAmount = () => {
    return payments
      .filter((payment) => payment.status.toUpperCase() === "PAID")
      .reduce((total, payment) => total + payment.amount, 0);
  };

  const getPendingAmount = () => {
    return payments
      .filter((payment) => payment.status.toUpperCase() === "PENDING")
      .reduce((total, payment) => total + payment.amount, 0);
  };

  if (!eventId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading event data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payments</h2>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-green-600">
              Completed: {formatCurrency(getTotalAmount())}
            </span>
            <span className="text-yellow-600">
              Pending: {formatCurrency(getPendingAmount())}
            </span>
            <span className="text-gray-600">
              Total Transactions: {payments.length}
            </span>
          </div>
        </div>
      </div>

      <Table aria-label="Payments table">
        <TableHeader>
          <TableColumn>REGISTRATION ID</TableColumn>
          <TableColumn>USER ID</TableColumn>
          <TableColumn>AMOUNT</TableColumn>
          <TableColumn>METHOD</TableColumn>
          <TableColumn>STATUS</TableColumn>
          <TableColumn>EXTERNAL ID</TableColumn>
          <TableColumn>PAID AT</TableColumn>
          <TableColumn>CREATED AT</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {payments.map((payment: Payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.registrationId}</TableCell>
              <TableCell>{payment.userId}</TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(payment.amount)}
              </TableCell>
              <TableCell>
                {getPaymentMethodLabel(payment.paymentMethod)}
              </TableCell>
              <TableCell>
                <Chip color={getStatusColor(payment.status)} variant="flat">
                  {payment.status}
                </Chip>
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs">{payment.externalId}</span>
              </TableCell>
              <TableCell>
                {payment.paidAt
                  ? new Date(payment.paidAt.toDate()).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell>
                {new Date(payment.createdAt.toDate()).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => handleView(payment)}
                  >
                    <EyeIcon />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
        <ModalContent>
          <ModalHeader>Payment Details</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {selectedPayment && (
                <>
                  <div>
                    <span className="block text-sm font-medium mb-1">
                      Registration ID
                    </span>
                    <p className="text-sm text-gray-600">
                      {selectedPayment.registrationId}
                    </p>
                  </div>
                  <div>
                    <span className="block text-sm font-medium mb-1">
                      User ID
                    </span>
                    <p className="text-sm text-gray-600">
                      {selectedPayment.userId}
                    </p>
                  </div>
                  <div>
                    <span className="block text-sm font-medium mb-1">
                      Amount
                    </span>
                    <p className="text-sm text-gray-600">
                      IDR {selectedPayment.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="block text-sm font-medium mb-1">
                      Payment Method
                    </span>
                    <p className="text-sm text-gray-600">
                      {paymentMethods.find(
                        (method) =>
                          method.key === selectedPayment.paymentMethod,
                      )?.label || selectedPayment.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <span className="block text-sm font-medium mb-1">
                      Status
                    </span>
                    <Chip
                      color={getStatusColor(selectedPayment.status)}
                      variant="flat"
                    >
                      {selectedPayment.status.charAt(0).toUpperCase() +
                        selectedPayment.status.slice(1)}
                    </Chip>
                  </div>
                  <div>
                    <span className="block text-sm font-medium mb-1">
                      Invoice URL
                    </span>
                    <p className="text-sm text-gray-600">
                      {selectedPayment.invoiceUrl || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="block text-sm font-medium mb-1">
                      External ID
                    </span>
                    <p className="text-sm text-gray-600">
                      {selectedPayment.externalId || "-"}
                    </p>
                  </div>
                </>
              )}

              {selectedPayment && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm font-medium mb-1">
                      Created At
                    </span>
                    <p className="text-sm text-gray-600">
                      {new Date(
                        selectedPayment.createdAt.toDate(),
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="block text-sm font-medium mb-1">
                      Paid At
                    </span>
                    <p className="text-sm text-gray-600">
                      {selectedPayment.paidAt
                        ? new Date(
                            selectedPayment.paidAt.toDate(),
                          ).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <span className="block text-sm font-medium mb-1">
                      Current Status
                    </span>
                    <Chip
                      color={getStatusColor(selectedPayment.status)}
                      variant="flat"
                    >
                      {selectedPayment.status}
                    </Chip>
                  </div>
                  <div>
                    <span className="block text-sm font-medium mb-1">
                      Amount
                    </span>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(selectedPayment.amount)}
                    </p>
                  </div>
                  <div>
                    <span className="block text-sm font-medium mb-1">
                      Payment Method
                    </span>
                    <p className="text-sm text-gray-600">
                      {getPaymentMethodLabel(selectedPayment.paymentMethod)}
                    </p>
                  </div>
                  <div>
                    <span className="block text-sm font-medium mb-1">
                      External ID
                    </span>
                    <p className="text-sm text-gray-600 font-mono text-xs">
                      {selectedPayment.externalId}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
