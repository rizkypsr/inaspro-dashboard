import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";

import { db } from "../firebase";
import {
  Product,
  Category,
  Order,
  Voucher,
  LogisticsRate,
  Notification,
  CreateProductData,
  UpdateProductData,
  CreateCategoryData,
  CreateVoucherData,
  UpdateOrderStatusData,
  ProductFilters,
  OrderFilters,
  PaginationParams,
  PaginatedResponse,
  MarketplaceStats,
} from "../../types/marketplace";

// Products Service
export class ProductsService {
  private collectionName = "products";

  async getProducts(
    filters?: ProductFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Product>> {
    let q = query(collection(db, this.collectionName));

    // Apply filters
    if (filters?.categoryId) {
      q = query(q, where("categoryId", "==", filters.categoryId));
    }
    if (filters?.minPrice) {
      q = query(q, where("price", ">=", filters.minPrice));
    }
    if (filters?.maxPrice) {
      q = query(q, where("price", "<=", filters.maxPrice));
    }
    if (filters?.inStock) {
      q = query(q, where("stock", ">", 0));
    }

    // Apply ordering
    q = query(q, orderBy("createdAt", "desc"));

    // Apply pagination
    if (pagination?.limit) {
      q = query(q, limit(pagination.limit));
    }

    const snapshot = await getDocs(q);
    const products = snapshot.docs.map((doc) => ({
      productId: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Product[];

    // Filter by search term if provided (client-side for simplicity)
    let filteredProducts = products;

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();

      filteredProducts = products.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm),
      );
    }

    return {
      data: filteredProducts,
      total: filteredProducts.length,
      page: pagination?.page || 1,
      limit: pagination?.limit || 10,
      totalPages: Math.ceil(
        filteredProducts.length / (pagination?.limit || 10),
      ),
    };
  }

  async getProduct(productId: string): Promise<Product | null> {
    const docRef = doc(db, this.collectionName, productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        productId: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as Product;
    }

    return null;
  }

  async createProduct(data: CreateProductData): Promise<string> {
    const now = Timestamp.now();
    const variants: Record<string, any> = {};
    let totalStock = 0;

    // Process variants if provided
    if (data.variants && data.variants.length > 0) {
      data.variants.forEach((variant, index) => {
        const variantId = `variant_${Date.now()}_${index}`;

        variants[variantId] = {
          ...variant,
          variantId,
        };
        totalStock += variant.stock;
      });
    } else {
      totalStock = data.price; // Use price as stock if no variants
    }

    const productData = {
      ...data,
      stock: totalStock,
      variants,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(
      collection(db, this.collectionName),
      productData,
    );

    return docRef.id;
  }

  async updateProduct(data: UpdateProductData): Promise<void> {
    const { productId, ...updateData } = data;
    const docRef = doc(db, this.collectionName, productId);

    await updateDoc(docRef, {
      ...updateData,
      updatedAt: Timestamp.now(),
    });
  }

  async deleteProduct(productId: string): Promise<void> {
    const docRef = doc(db, this.collectionName, productId);

    await deleteDoc(docRef);
  }

  async updateStock(productId: string, newStock: number): Promise<void> {
    const docRef = doc(db, this.collectionName, productId);

    await updateDoc(docRef, {
      stock: newStock,
      updatedAt: Timestamp.now(),
    });
  }
}

// Categories Service
export class CategoriesService {
  private collectionName = "categories";

  async getCategories(): Promise<Category[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      categoryId: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Category[];
  }

  async getCategory(categoryId: string): Promise<Category | null> {
    const docRef = doc(db, this.collectionName, categoryId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        categoryId: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
      } as Category;
    }

    return null;
  }

  async createCategory(data: CreateCategoryData): Promise<string> {
    const categoryData = {
      ...data,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, this.collectionName),
      categoryData,
    );

    return docRef.id;
  }

  async updateCategory(
    categoryId: string,
    data: Partial<CreateCategoryData>,
  ): Promise<void> {
    const docRef = doc(db, this.collectionName, categoryId);

    await updateDoc(docRef, data);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const docRef = doc(db, this.collectionName, categoryId);

    await deleteDoc(docRef);
  }
}

// Orders Service
export class OrdersService {
  private collectionName = "orders";

  async getOrders(
    filters?: OrderFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Order>> {
    let q = query(collection(db, this.collectionName));

    // Apply filters
    if (filters?.status) {
      q = query(q, where("status", "==", filters.status));
    }
    if (filters?.paymentStatus) {
      q = query(q, where("payment.status", "==", filters.paymentStatus));
    }
    if (filters?.userId) {
      q = query(q, where("userId", "==", filters.userId));
    }

    // Apply ordering
    q = query(q, orderBy("createdAt", "desc"));

    // Apply pagination
    if (pagination?.limit) {
      q = query(q, limit(pagination.limit));
    }

    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map((doc) => ({
      orderId: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      reservedUntil: doc.data().reservedUntil?.toDate(),
    })) as Order[];

    return {
      data: orders,
      total: orders.length,
      page: pagination?.page || 1,
      limit: pagination?.limit || 10,
      totalPages: Math.ceil(orders.length / (pagination?.limit || 10)),
    };
  }

  async getOrder(orderId: string): Promise<Order | null> {
    const docRef = doc(db, this.collectionName, orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        orderId: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
        reservedUntil: docSnap.data().reservedUntil?.toDate(),
      } as Order;
    }

    return null;
  }

  async updateOrderStatus(data: UpdateOrderStatusData): Promise<void> {
    const { orderId, status, trackingNumber } = data;
    const docRef = doc(db, this.collectionName, orderId);

    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
    };

    if (trackingNumber) {
      updateData["logistics.trackingNumber"] = trackingNumber;
    }

    await updateDoc(docRef, updateData);
  }
}

// Vouchers Service
export class VouchersService {
  private collectionName = "vouchers";

  async getVouchers(): Promise<Voucher[]> {
    const snapshot = await getDocs(collection(db, this.collectionName));

    return snapshot.docs.map((doc) => ({
      voucherId: doc.id,
      ...doc.data(),
      validUntil: doc.data().validUntil?.toDate(),
    })) as Voucher[];
  }

  async createVoucher(data: CreateVoucherData): Promise<string> {
    const voucherData = {
      ...data,
      validUntil: Timestamp.fromDate(data.validUntil),
    };

    const docRef = await addDoc(
      collection(db, this.collectionName),
      voucherData,
    );

    return docRef.id;
  }

  async updateVoucher(
    voucherId: string,
    data: Partial<CreateVoucherData>,
  ): Promise<void> {
    const docRef = doc(db, this.collectionName, voucherId);
    const updateData: any = { ...data };

    if (data.validUntil) {
      updateData.validUntil = Timestamp.fromDate(data.validUntil);
    }

    await updateDoc(docRef, updateData);
  }

  async deleteVoucher(voucherId: string): Promise<void> {
    const docRef = doc(db, this.collectionName, voucherId);

    await deleteDoc(docRef);
  }
}

// Logistics Service
export class LogisticsService {
  private collectionName = "logistics";

  async getLogisticsRates(): Promise<LogisticsRate[]> {
    const snapshot = await getDocs(collection(db, this.collectionName));

    return snapshot.docs.map((doc) => ({
      provinceId: doc.id,
      ...doc.data(),
    })) as LogisticsRate[];
  }

  async updateLogisticsRate(
    provinceId: string,
    data: Omit<LogisticsRate, "provinceId">,
  ): Promise<void> {
    const docRef = doc(db, this.collectionName, provinceId);

    await updateDoc(docRef, data);
  }
}

// Notifications Service
export class NotificationsService {
  private collectionName = "notifications";

  async getNotifications(): Promise<Notification[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      notifId: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Notification[];
  }

  async markAsRead(notifId: string): Promise<void> {
    const docRef = doc(db, this.collectionName, notifId);

    await updateDoc(docRef, { isRead: true });
  }

  async createNotification(
    data: Omit<Notification, "notifId" | "createdAt">,
  ): Promise<string> {
    const notificationData = {
      ...data,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, this.collectionName),
      notificationData,
    );

    return docRef.id;
  }
}

// Dashboard Stats Service
export class MarketplaceStatsService {
  async getStats(): Promise<MarketplaceStats> {
    const [products, orders, vouchers] = await Promise.all([
      getDocs(collection(db, "products")),
      getDocs(collection(db, "orders")),
      getDocs(query(collection(db, "vouchers"), where("isActive", "==", true))),
    ]);

    const ordersData = orders.docs.map((doc) => doc.data());
    const productsData = products.docs.map((doc) => doc.data());

    const totalRevenue = ordersData
      .filter((order) => order.payment?.status === "paid")
      .reduce((sum, order) => sum + (order.finalAmount || 0), 0);

    const pendingOrders = ordersData.filter(
      (order) => order.status === "pending",
    ).length;
    const lowStockProducts = productsData.filter(
      (product) => product.stock < 10,
    ).length;

    return {
      totalProducts: products.size,
      totalOrders: orders.size,
      totalRevenue,
      pendingOrders,
      lowStockProducts,
      activeVouchers: vouchers.size,
    };
  }
}

// Export service instances
export const productsService = new ProductsService();
export const categoriesService = new CategoriesService();
export const ordersService = new OrdersService();
export const vouchersService = new VouchersService();
export const logisticsService = new LogisticsService();
export const notificationsService = new NotificationsService();
export const marketplaceStatsService = new MarketplaceStatsService();
