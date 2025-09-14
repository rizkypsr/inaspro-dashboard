export interface ProductVariant {
  variantId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

export interface Product {
  productId: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  stock: number;
  categoryId: string;
  variants: Record<string, ProductVariant>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  categoryId: string;
  title: string;
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  title: string;
  quantity: number;
  price: number;
}

export interface PaymentInfo {
  status: "pending" | "paid" | "failed";
  method: string;
  xenditInvoiceId?: string;
}

export interface ShippingAddress {
  provinceId: string;
  provinceName: string;
  fullAddress: string;
  postalCode: string;
}

export interface LogisticsInfo {
  provinceId: string;
  price: number;
  trackingNumber?: string;
}

export interface Order {
  orderId: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  payment: PaymentInfo;
  shippingAddress: ShippingAddress;
  logistics: LogisticsInfo;
  status: "pending" | "processing" | "shipped" | "completed" | "cancelled";
  reservedUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Voucher {
  voucherId: string;
  code: string;
  type: "percentage" | "flat";
  value: number;
  minPurchase: number;
  validUntil: Date;
  isActive: boolean;
}

export interface LogisticsRate {
  provinceId: string;
  name: string;
  price: number;
}

export interface SalesReport {
  reportId: string;
  orderId: string;
  totalAmount: number;
  finalAmount: number;
  voucherId?: string;
  createdAt: Date;
}

export interface Notification {
  notifId: string;
  type: "order" | "payment" | "stock";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Form types for creating/updating
export interface CreateProductData {
  title: string;
  description: string;
  images: string[];
  price: number;
  categoryId: string;
  variants?: Omit<ProductVariant, "variantId">[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  productId: string;
}

export interface CreateCategoryData {
  title: string;
}

export interface CreateVoucherData {
  code: string;
  type: "percentage" | "flat";
  value: number;
  minPurchase: number;
  validUntil: Date;
  isActive: boolean;
}

export interface UpdateOrderStatusData {
  orderId: string;
  status: Order["status"];
  trackingNumber?: string;
}

// Filter and pagination types
export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}

export interface OrderFilters {
  status?: Order["status"];
  paymentStatus?: PaymentInfo["status"];
  dateFrom?: Date;
  dateTo?: Date;
  userId?: string;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard statistics
export interface MarketplaceStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  activeVouchers: number;
}

// Export types
export interface ExportOptions {
  format: "csv" | "xlsx";
  dateFrom?: Date;
  dateTo?: Date;
  filters?: any;
}
