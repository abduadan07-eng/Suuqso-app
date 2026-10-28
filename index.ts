export type UserRole = 'customer' | 'store_owner' | 'staff' | 'super_admin';

export type ScreenType = 
  | 'splash'
  | 'welcome'
  | 'customer_home'
  | 'store_login'
  | 'staff_login'
  | 'store_dashboard'
  | 'staff_dashboard'
  | 'super_admin'
  | 'apk_hub'
  | 'qr_generator'
  | 'ads_feed';

export type AdStatus = 'pending_approval' | 'approved' | 'rejected';

export interface Advertisement {
  id: string;
  storeId: string;
  storeName: string;
  storeCode?: string;
  storePhone?: string;
  storeLogoUrl?: string;
  title: string;
  priceUsd: number;
  imageUrl?: string;
  videoUrl?: string;
  description: string;
  contactPhone: string;
  city: string;
  status: AdStatus; // 'pending_approval' (Sugaya ansixin) | 'approved' (La ansixiyay) | 'rejected' (La diiday)
  createdAt: string;
  viewsCount?: number;
  likesCount?: number;
  rejectionReason?: string;
  isVerifiedAuthentic?: boolean; // Super Admin wuxuu xaqiijiyay inuu dhab yahay oo aan copy ahayn
}

export type StoreTier = 'large' | 'small'; // Dukaan Weyn (leh shaqaale) vs Dukaan Yar (admin kaliya)

export type SomaliCurrency = 'EVC_PLUS' | 'ZAAD' | 'EDAHAB' | 'SAHAL' | 'USD';

export type PaymentMethod = 'evc_plus' | 'zaad' | 'edahab' | 'sahal' | 'cash';

export type OrderStatus = 'awaiting_verification' | 'pending' | 'preparing' | 'in_transit' | 'delivered' | 'cancelled';

export type StaffRole = 
  | 'delivery' // Diraha Gaarsiinta
  | 'customer_service' // Adeegga Macmiilka & Chat
  | 'inventory' // Maamulaha Kaydka
  | 'cashier'; // Khasnaji (Hubinta Lacagta & TxID)

export interface StorePaymentConfig {
  mode: 'manual_numbers' | 'api_gateway';
  // Manual Somali Mobile Money
  evcNumber?: string;
  zaadNumber?: string;
  edahabNumber?: string;
  sahalNumber?: string;
  merchantTillNumber?: string;
  instructions?: string;
  // Automated API Gateway
  gatewayProvider?: 'waafi' | 'edahab_api' | 'hormuud_api' | 'custom_unified';
  apiGatewayUrl?: string;
  apiKey?: string;
  merchantId?: string;
  webhookSecret?: string;
  isLive?: boolean;
}

export interface Employee {
  id: string;
  employeeCode: string; // Tusaale: SHAQ-01, SHAQ-02
  name: string;
  phone: string;
  password: string;
  role: StaffRole;
  roleTitle: string; // Tusaale: "Diraha Gaarsiinta", "Adeegga Macmiilka", "Khasnajiga (Hubinta Lacagta)"
  assignedTasks: string;
  isActive: boolean;
  joinedDate: string;
}

export interface Store {
  id: string;
  storeCode: string; // Aqoonsiga Dukaanka oo system-ku abuuro (Tusaale: DUK-101, DUK-245)
  name: string;
  adminName: string;
  phone: string;
  password: string;
  city: string;
  category: string;
  storeType: StoreTier; // 'large' = Dukaan Weyn, 'small' = Dukaan Yar
  operatingDays: number; // Maalmaha uu shaqeynayo
  rating: number;
  salesCount: number;
  followersCount: number;
  isVerified: boolean;
  isPendingApproval: boolean;
  avatar: string;
  logoUrl?: string; // Icon-ka / Logo-da gaarka ah ee dukaanka
  description: string;
  employees: Employee[];
  paymentConfig?: StorePaymentConfig;
}

export interface Product {
  id: string;
  storeId: string;
  storeName: string;
  storeCode?: string;
  name: string;
  nameSomali: string;
  category: string;
  priceUsd: number;
  originalPriceUsd?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  image: string;
  videoUrl?: string; // Muuqaalka video-ga ee alaabta (MP4, Data URL, ama Video Embed)
  descriptionSomali: string;
  descriptionEnglish: string;
  isFeatured?: boolean;
  assignedEmployeeId?: string; // Shaqaalaha u xilsaaran fariimaha alaabtan
  assignedEmployeeName?: string; // Tusaale: "Aamina Sharmaarke"
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  items: CartItem[];
  totalUsd: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  storeId: string;
  storeCode?: string;
  assignedDeliveryEmployeeId?: string;
  // Payment Verification Fields
  transactionId?: string; // TxID uu soo diray macmiilku (e.g. GW981240192 ama EVC-449102)
  paymentProofText?: string; // SMS-ka xaqiijinta ee macmiilku soo dhejiyay
  paymentProofImage?: string; // Sawirka caddaynta hadduu jiro
  paymentStatus?: 'unpaid' | 'submitted' | 'verified' | 'rejected';
  verifiedByStaffId?: string;
  verifiedByStaffName?: string;
  verifiedAt?: string;
  verificationRejectionReason?: string;
}

export interface ChatMessage {
  id: string;
  storeId: string;
  sender: 'customer' | 'store';
  senderName?: string; // Tusaale: "Aamina (Adeegga Macmiilka)" ama "Admin Hodan"
  text: string;
  timestamp: string;
  productId?: string;
  productName?: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
}

export interface InternalTeamMessage {
  id: string;
  storeId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
}

export interface StaffSession {
  store: Store;
  employee: Employee;
}
