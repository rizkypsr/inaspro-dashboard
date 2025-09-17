"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";

import { notificationsService } from "../../../lib/services/marketplace-service";
import { Notification } from "../../../types/marketplace";
import { ProtectedRoute } from "../../../components/protected-route";

// Icons as SVG components
const BellIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293A1 1 0 004 16v2a1 1 0 001 1h1m5-6v6a1 1 0 001 1h2a1 1 0 001-1v-6m3 0V9a1 1 0 00-1-1h-2a1 1 0 00-1 1v4.01"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const CreditCardIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const PackageIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M5 13l4 4L19 7"
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

const RefreshIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
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

interface NotificationStats {
  total: number;
  unread: number;
  orderNotifications: number;
  paymentNotifications: number;
  stockNotifications: number;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    orderNotifications: 0,
    paymentNotifications: 0,
    stockNotifications: 0,
  });
  const [filter, setFilter] = useState<
    "all" | "unread" | "order" | "payment" | "stock"
  >("all");

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsService.getNotifications();

      setNotifications(response);
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const orderNotifications = notifications.filter(
      (n) => n.type === "order",
    ).length;
    const paymentNotifications = notifications.filter(
      (n) => n.type === "payment",
    ).length;
    const stockNotifications = notifications.filter(
      (n) => n.type === "stock",
    ).length;

    setStats({
      total,
      unread,
      orderNotifications,
      paymentNotifications,
      stockNotifications,
    });
  };

  const handleMarkAsRead = async (notifId: string) => {
    try {
      await notificationsService.markAsRead(notifId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notifId === notifId ? { ...notif, isRead: true } : notif,
        ),
      );
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      for (const notification of unreadNotifications) {
        await notificationsService.markAsRead(notification.notifId);
      }

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true })),
      );

      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "order":
        return <ShoppingCartIcon />;
      case "payment":
        return <CreditCardIcon />;
      case "stock":
        return <PackageIcon />;
      default:
        return <BellIcon />;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "order":
        return "primary";
      case "payment":
        return "success";
      case "stock":
        return "warning";
      default:
        return "default";
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60),
      );

      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return new Intl.DateTimeFormat("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case "unread":
        return !notification.isRead;
      case "order":
        return notification.type === "order";
      case "payment":
        return notification.type === "payment";
      case "stock":
        return notification.type === "stock";
      default:
        return true;
    }
  });

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-default-500">
              Stay updated with orders, payments, and stock alerts
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              startContent={<RefreshIcon />}
              variant="light"
              onPress={loadNotifications}
            >
              Refresh
            </Button>
            {stats.unread > 0 && (
              <Button
                color="primary"
                startContent={<CheckIcon />}
                onPress={handleMarkAllAsRead}
              >
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className={filter === "all" ? "ring-2 ring-primary" : ""}>
            <CardBody
              className="flex flex-row items-center gap-4 cursor-pointer"
              onClick={() => setFilter("all")}
            >
              <div className="p-3 bg-default/10 rounded-lg">
                <BellIcon />
              </div>
              <div>
                <p className="text-sm text-default-500">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardBody>
          </Card>
          <Card className={filter === "unread" ? "ring-2 ring-primary" : ""}>
            <CardBody
              className="flex flex-row items-center gap-4 cursor-pointer"
              onClick={() => setFilter("unread")}
            >
              <div className="p-3 bg-danger/10 rounded-lg">
                <AlertTriangleIcon />
              </div>
              <div>
                <p className="text-sm text-default-500">Unread</p>
                <p className="text-2xl font-bold text-danger">{stats.unread}</p>
              </div>
            </CardBody>
          </Card>
          <Card className={filter === "order" ? "ring-2 ring-primary" : ""}>
            <CardBody
              className="flex flex-row items-center gap-4 cursor-pointer"
              onClick={() => setFilter("order")}
            >
              <div className="p-3 bg-primary/10 rounded-lg">
                <ShoppingCartIcon />
              </div>
              <div>
                <p className="text-sm text-default-500">Orders</p>
                <p className="text-2xl font-bold">{stats.orderNotifications}</p>
              </div>
            </CardBody>
          </Card>
          <Card className={filter === "payment" ? "ring-2 ring-primary" : ""}>
            <CardBody
              className="flex flex-row items-center gap-4 cursor-pointer"
              onClick={() => setFilter("payment")}
            >
              <div className="p-3 bg-success/10 rounded-lg">
                <CreditCardIcon />
              </div>
              <div>
                <p className="text-sm text-default-500">Payments</p>
                <p className="text-2xl font-bold">
                  {stats.paymentNotifications}
                </p>
              </div>
            </CardBody>
          </Card>
          <Card className={filter === "stock" ? "ring-2 ring-primary" : ""}>
            <CardBody
              className="flex flex-row items-center gap-4 cursor-pointer"
              onClick={() => setFilter("stock")}
            >
              <div className="p-3 bg-warning/10 rounded-lg">
                <PackageIcon />
              </div>
              <div>
                <p className="text-sm text-default-500">Stock Alerts</p>
                <p className="text-2xl font-bold">{stats.stockNotifications}</p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <h3 className="text-lg font-semibold">
                Notifications ({filteredNotifications.length})
                {filter !== "all" && (
                  <Chip
                    className="ml-2"
                    color="primary"
                    size="sm"
                    variant="flat"
                  >
                    {filter}
                  </Chip>
                )}
              </h3>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8 px-6">
                <div className="p-4 bg-default/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <BellIcon />
                </div>
                <p className="text-default-500 mb-2">
                  {filter === "all"
                    ? "No notifications found"
                    : `No ${filter} notifications found`}
                </p>
                <p className="text-sm text-default-400">
                  Notifications will appear here when there are new orders,
                  payments, or stock alerts
                </p>
              </div>
            ) : (
              <div className="divide-y divide-default-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.notifId}
                    className={`p-4 hover:bg-default-50 transition-colors ${
                      !notification.isRead
                        ? "bg-primary/5 border-l-4 border-l-primary"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          getNotificationColor(notification.type) === "primary"
                            ? "bg-primary/10"
                            : getNotificationColor(notification.type) ===
                                "success"
                              ? "bg-success/10"
                              : getNotificationColor(notification.type) ===
                                  "warning"
                                ? "bg-warning/10"
                                : "bg-default/10"
                        }`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4
                                className={`font-semibold ${
                                  !notification.isRead
                                    ? "text-foreground"
                                    : "text-default-600"
                                }`}
                              >
                                {notification.title}
                              </h4>
                              <Chip
                                color={
                                  getNotificationColor(notification.type) as any
                                }
                                size="sm"
                                variant="flat"
                              >
                                {notification.type}
                              </Chip>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                            <p
                              className={`text-sm mb-2 ${
                                !notification.isRead
                                  ? "text-default-700"
                                  : "text-default-500"
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p className="text-xs text-default-400">
                              {formatDate(notification.createdAt)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <Button
                                color="primary"
                                size="sm"
                                startContent={<CheckIcon />}
                                variant="light"
                                onPress={() =>
                                  handleMarkAsRead(notification.notifId)
                                }
                              >
                                Mark Read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </ProtectedRoute>
  );
}