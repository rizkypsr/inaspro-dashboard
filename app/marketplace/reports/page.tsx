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
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";

import { SalesReport, ExportOptions } from "../../../types/marketplace";
import { ProtectedRoute } from "../../../components/protected-route";

// Icons as SVG components
const DownloadIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const FilterIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const TrendingUpIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const DollarSignIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const PercentIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
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

interface ReportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
}

interface ReportStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalDiscount: number;
  discountPercentage: number;
}

// Mock service for sales reports (since it's not implemented in the actual service)
const mockSalesReportsService = {
  async getSalesReports(filters?: ReportFilters): Promise<SalesReport[]> {
    // Mock data for demonstration
    const mockReports: SalesReport[] = [
      {
        reportId: "rpt_001",
        orderId: "ord_001",
        totalAmount: 250000,
        finalAmount: 225000,
        voucherId: "DISC10",
        createdAt: new Date("2024-01-15"),
      },
      {
        reportId: "rpt_002",
        orderId: "ord_002",
        totalAmount: 180000,
        finalAmount: 180000,
        createdAt: new Date("2024-01-16"),
      },
      {
        reportId: "rpt_003",
        orderId: "ord_003",
        totalAmount: 320000,
        finalAmount: 288000,
        voucherId: "SAVE20",
        createdAt: new Date("2024-01-17"),
      },
    ];

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return mockReports;
  },

  async exportReports(options: ExportOptions): Promise<void> {
    // Mock export functionality
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real implementation, this would generate and download the file
    const filename = `sales-report-${new Date().toISOString().split("T")[0]}.${options.format}`;

    console.log(`Exporting report as ${filename}`);
  },
};

export default function SalesReportsPage() {
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [stats, setStats] = useState<ReportStats>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalDiscount: 0,
    discountPercentage: 0,
  });

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [reports]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await mockSalesReportsService.getSalesReports(filters);

      setReports(response);
    } catch (error) {
      console.error("Error loading sales reports:", error);
      toast.error("Failed to load sales reports");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (reports.length === 0) {
      setStats({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalDiscount: 0,
        discountPercentage: 0,
      });

      return;
    }

    const totalRevenue = reports.reduce(
      (sum, report) => sum + report.finalAmount,
      0,
    );
    const totalOriginalAmount = reports.reduce(
      (sum, report) => sum + report.totalAmount,
      0,
    );
    const totalDiscount = totalOriginalAmount - totalRevenue;
    const totalOrders = reports.length;
    const averageOrderValue = totalRevenue / totalOrders;
    const discountPercentage =
      totalOriginalAmount > 0 ? (totalDiscount / totalOriginalAmount) * 100 : 0;

    setStats({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalDiscount,
      discountPercentage,
    });
  };

  const handleApplyFilters = async () => {
    await loadReports();
  };

  const handleExport = async (format: "csv" | "xlsx") => {
    try {
      setExporting(true);
      const exportOptions: ExportOptions = {
        format,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        filters,
      };

      await mockSalesReportsService.exportReports(exportOptions);
      toast.success(`Report exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getDiscountAmount = (report: SalesReport) => {
    return report.totalAmount - report.finalAmount;
  };

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Sales Reports</h1>
            <p className="text-default-500">
              View and export sales performance data
            </p>
          </div>
          <div className="flex gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  color="primary"
                  isLoading={exporting}
                  startContent={<DownloadIcon />}
                >
                  Export Report
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="csv" onPress={() => handleExport("csv")}>
                  Export as CSV
                </DropdownItem>
                <DropdownItem key="xlsx" onPress={() => handleExport("xlsx")}>
                  Export as Excel
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FilterIcon />
              <h3 className="text-lg font-semibold">Filters</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Date From"
                startContent={<CalendarIcon />}
                type="date"
                value={
                  filters.dateFrom
                    ? filters.dateFrom.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateFrom: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  }))
                }
              />
              <Input
                label="Date To"
                startContent={<CalendarIcon />}
                type="date"
                value={
                  filters.dateTo
                    ? filters.dateTo.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateTo: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  }))
                }
              />
              <Input
                label="Min Amount (Rp)"
                placeholder="0"
                startContent={<DollarSignIcon />}
                type="number"
                value={filters.minAmount?.toString() || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFilters((prev) => ({
                    ...prev,
                    minAmount: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
              />
              <Input
                label="Max Amount (Rp)"
                placeholder="No limit"
                startContent={<DollarSignIcon />}
                type="number"
                value={filters.maxAmount?.toString() || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxAmount: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  }))
                }
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button color="primary" onPress={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardBody className="flex flex-row items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <DollarSignIcon />
              </div>
              <div>
                <p className="text-sm text-default-500">Total Revenue</p>
                <p className="text-xl font-bold text-success">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex flex-row items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <ShoppingBagIcon />
              </div>
              <div>
                <p className="text-sm text-default-500">Total Orders</p>
                <p className="text-xl font-bold">{stats.totalOrders}</p>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex flex-row items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <TrendingUpIcon />
              </div>
              <div>
                <p className="text-sm text-default-500">Avg Order Value</p>
                <p className="text-xl font-bold">
                  {formatCurrency(stats.averageOrderValue)}
                </p>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex flex-row items-center gap-4">
              <div className="p-3 bg-danger/10 rounded-lg">
                <PercentIcon />
              </div>
              <div>
                <p className="text-sm text-default-500">Total Discount</p>
                <p className="text-xl font-bold text-danger">
                  {formatCurrency(stats.totalDiscount)}
                </p>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="flex flex-row items-center gap-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <PercentIcon />
              </div>
              <div>
                <p className="text-sm text-default-500">Discount %</p>
                <p className="text-xl font-bold">
                  {stats.discountPercentage.toFixed(1)}%
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">
              Sales Reports ({reports.length})
            </h3>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-default-500 mb-4">No sales reports found</p>
                <p className="text-sm text-default-400">
                  Sales reports will appear here when orders are completed
                </p>
              </div>
            ) : (
              <Table aria-label="Sales reports table">
                <TableHeader>
                  <TableColumn>REPORT ID</TableColumn>
                  <TableColumn>ORDER ID</TableColumn>
                  <TableColumn>DATE</TableColumn>
                  <TableColumn>ORIGINAL AMOUNT</TableColumn>
                  <TableColumn>DISCOUNT</TableColumn>
                  <TableColumn>FINAL AMOUNT</TableColumn>
                  <TableColumn>VOUCHER</TableColumn>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.reportId}>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {report.reportId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {report.orderId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(report.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          {formatCurrency(report.totalAmount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-danger">
                          -{formatCurrency(getDiscountAmount(report))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-success">
                          {formatCurrency(report.finalAmount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {report.voucherId ? (
                          <Chip color="secondary" size="sm" variant="flat">
                            {report.voucherId}
                          </Chip>
                        ) : (
                          <span className="text-default-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>
    </ProtectedRoute>
  );
}