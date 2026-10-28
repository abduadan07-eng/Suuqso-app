import React, { useState, useRef } from 'react';
import {
  Store,
  Package,
  ShoppingBag,
  Plus,
  CheckCircle,
  Clock,
  Truck,
  ArrowLeft,
  X,
  CreditCard,
  Edit2,
  Trash2,
  Users,
  UserPlus,
  KeyRound,
  ShieldCheck,
  Building,
  Image as ImageIcon,
  Upload,
  QrCode,
  Send,
  MessageSquare,
  Copy,
  Check,
  AlertTriangle,
  Zap,
  Globe,
  ExternalLink,
  Phone,
  RefreshCw,
  Video,
  Film,
  Play,
  Pause,
  Eye,
} from 'lucide-react';
import {
  Store as StoreType,
  Product,
  Order,
  OrderStatus,
  SomaliCurrency,
  ScreenType,
  Employee,
  InternalTeamMessage,
  ChatMessage,
  StorePaymentConfig,
  Advertisement,
} from '../../types';
import { formatPrice } from '../../data/mockData';

interface StoreDashboardScreenProps {
  currentStore: StoreType;
  products: Product[];
  orders: Order[];
  teamMessages: InternalTeamMessage[];
  customerChatMessages: ChatMessage[];
  currency: SomaliCurrency;
  advertisements?: Advertisement[];
  onCreateAdvertisement?: (ad: Advertisement) => void;
  onDeleteAdvertisement?: (adId: string) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAddEmployee: (storeId: string, employee: Employee) => void;
  onToggleEmployeeStatus: (storeId: string, employeeId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onVerifyOrderPayment?: (orderId: string, staffName: string, staffId?: string) => void;
  onRejectOrderPayment?: (orderId: string, reason: string) => void;
  onUpdateStorePaymentConfig?: (storeId: string, paymentConfig: StorePaymentConfig) => void;
  onChangeStorePassword: (storeId: string, newPass: string) => void;
  onUpgradeToLargeStore: (storeId: string) => void;
  onSendTeamMessage: (storeId: string, senderName: string, senderRole: string, text: string) => void;
  onSendCustomerReply: (storeId: string, text: string, senderName: string) => void;
  onOpenStoreQr: (store: StoreType) => void;
  onUpdateStore?: (store: StoreType) => void;
  onUpdateStoreLogo?: (storeId: string, logoUrl: string) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const StoreDashboardScreen: React.FC<StoreDashboardScreenProps> = ({
  currentStore,
  products,
  orders,
  teamMessages,
  customerChatMessages,
  currency,
  advertisements = [],
  onCreateAdvertisement,
  onDeleteAdvertisement,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddEmployee,
  onToggleEmployeeStatus,
  onUpdateOrderStatus,
  onVerifyOrderPayment,
  onRejectOrderPayment,
  onUpdateStorePaymentConfig,
  onChangeStorePassword,
  onUpgradeToLargeStore,
  onSendTeamMessage,
  onSendCustomerReply,
  onOpenStoreQr,
  onUpdateStore,
  onUpdateStoreLogo,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'ads' | 'employees' | 'customer_chats' | 'team_chat' | 'payment_api' | 'settings'>('products');
  const [storeLogoInput, setStoreLogoInput] = useState<string>(currentStore.logoUrl || '');
  const [logoSaveMsg, setLogoSaveMsg] = useState<string | null>(null);

  React.useEffect(() => {
    setStoreLogoInput(currentStore.logoUrl || '');
  }, [currentStore.logoUrl]);
  const [customerChatReplyText, setCustomerChatReplyText] = useState('');

  // Orders verification filter
  const [orderFilter, setOrderFilter] = useState<'all' | 'awaiting' | 'verified'>('all');
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('TxID lama helin / lacagtu may soo dhicin.');

  // Payment API Settings State
  const initialCfg = currentStore.paymentConfig || {
    mode: 'manual_numbers',
    evcNumber: currentStore.phone,
    zaadNumber: currentStore.phone,
    edahabNumber: currentStore.phone,
    merchantTillNumber: '',
    gatewayProvider: 'waafi',
    apiGatewayUrl: 'https://api.waafi.com/v1/checkout',
    merchantId: `MRCH-${currentStore.storeCode}`,
    apiKey: 'sk_live_somalia_waafi_99182',
    isLive: true,
  };

  const [paymentMode, setPaymentMode] = useState<'manual_numbers' | 'api_gateway'>(initialCfg.mode || 'manual_numbers');
  const [evcInput, setEvcInput] = useState(initialCfg.evcNumber || currentStore.phone);
  const [zaadInput, setZaadInput] = useState(initialCfg.zaadNumber || currentStore.phone);
  const [edahabInput, setEdahabInput] = useState(initialCfg.edahabNumber || currentStore.phone);
  const [sahalInput, setSahalInput] = useState(initialCfg.sahalNumber || currentStore.phone);
  const [tillInput, setTillInput] = useState(initialCfg.merchantTillNumber || '');
  const [instructionsInput, setInstructionsInput] = useState(initialCfg.instructions || '');

  // API Gateway fields
  const [gatewayProvider, setGatewayProvider] = useState<'waafi' | 'edahab_api' | 'hormuud_api' | 'custom_unified'>(initialCfg.gatewayProvider || 'waafi');
  const [gatewayUrl, setGatewayUrl] = useState(initialCfg.apiGatewayUrl || 'https://api.waafi.com/v1/checkout');
  const [merchantIdInput, setMerchantIdInput] = useState(initialCfg.merchantId || `MRCH-${currentStore.storeCode}`);
  const [apiKeyInput, setApiKeyInput] = useState(initialCfg.apiKey || 'sk_live_somalia_waafi_99182');
  const [isLiveInput, setIsLiveInput] = useState(initialCfg.isLive !== false);
  const [apiTestResult, setApiTestResult] = useState<{ status: 'testing' | 'success' | 'error'; message: string } | null>(null);
  const [savePaymentMsg, setSavePaymentMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Add Product State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newNameSomali, setNewNameSomali] = useState('');
  const [newNameEnglish, setNewNameEnglish] = useState('');
  const [newPrice, setNewPrice] = useState('35');
  const [newStock, setNewStock] = useState('15');
  const [newCategory, setNewCategory] = useState(currentStore.category);
  const [newImageDataUrl, setNewImageDataUrl] = useState<string>('/src/assets/images/somali_fashion_dirac_1792576927453.jpg');
  const [newVideoUrl, setNewVideoUrl] = useState<string>('');
  const [newDescSomali, setNewDescSomali] = useState('');
  const [newAssignedEmployeeId, setNewAssignedEmployeeId] = useState<string>('');

  // Edit Product State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // File input refs for gallery photo & video picking
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const addVideoFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editVideoFileInputRef = useRef<HTMLInputElement>(null);

  // Advertisement State ("Samee Xayeysiis")
  const [isAddAdOpen, setIsAddAdOpen] = useState(false);
  const [adTitle, setAdTitle] = useState('');
  const [adPrice, setAdPrice] = useState('30');
  const [adCity, setAdCity] = useState(currentStore.city);
  const [adPhone, setAdPhone] = useState(currentStore.phone);
  const [adDescription, setAdDescription] = useState('');
  const [adImage, setAdImage] = useState<string>('/src/assets/images/somali_fashion_dirac_1792576927453.jpg');
  const [adVideo, setAdVideo] = useState<string>('/assets/videos/somali_ad_sample.mp4');
  const [adSuccessMsg, setAdSuccessMsg] = useState<string | null>(null);

  const adImageFileInputRef = useRef<HTMLInputElement>(null);
  const adVideoFileInputRef = useRef<HTMLInputElement>(null);

  // Add Employee State
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('+252 61 ');
  const [newEmpPassword, setNewEmpPassword] = useState('123456');
  const [newEmpRole, setNewEmpRole] = useState<'delivery' | 'customer_service' | 'inventory'>('customer_service');
  const [newEmpRoleTitle, setNewEmpRoleTitle] = useState('Adeegga Macmiilka & Chat');
  const [newEmpTasks, setNewEmpTasks] = useState('Ka jawaabista fariimaha tooska ah ee macaamiisha');

  // Change Password State
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [passMessage, setPassMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Team chat message input
  const [adminTeamInput, setAdminTeamInput] = useState('');

  // Filter store-specific data
  const storeProducts = products.filter(
    (p) => p.storeId === currentStore.id || p.storeName === currentStore.name
  );
  const storeOrders = orders.filter((o) => o.storeId === currentStore.id);
  const storeAds = advertisements.filter((a) => a.storeId === currentStore.id);
  const totalStoreRevenue = storeOrders.reduce((sum, o) => sum + o.totalUsd, 0) + 4850;
  const storeTeamMessages = teamMessages.filter((m) => m.storeId === currentStore.id);
  const storeCustomerMessages = (customerChatMessages || []).filter(
    (m) => m.storeId === currentStore.id
  );

  const handleSendCustomerChatReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerChatReplyText.trim()) return;
    onSendCustomerReply(
      currentStore.id,
      customerChatReplyText.trim(),
      `${currentStore.adminName} (Milkiilaha/Admin)`
    );
    setCustomerChatReplyText('');
  };

  // Gallery file handler: Read photo directly from device gallery
  const handleGalleryFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean = false
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (isEdit && editingProduct) {
            setEditingProduct({ ...editingProduct, image: reader.result });
          } else {
            setNewImageDataUrl(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Video file handler: Read video directly from device gallery or camera
  const handleVideoFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean = false
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (isEdit && editingProduct) {
            setEditingProduct({ ...editingProduct, videoUrl: reader.result });
          } else {
            setNewVideoUrl(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Advertisement image & video handlers
  const handleAdImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAdImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAdVideo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim()) return;

    const newAd: Advertisement = {
      id: `ad-${Date.now()}`,
      storeId: currentStore.id,
      storeName: currentStore.name,
      storeCode: currentStore.storeCode,
      title: adTitle.trim(),
      priceUsd: parseFloat(adPrice) || 20,
      imageUrl: adImage || '/src/assets/images/somali_fashion_dirac_1792576927453.jpg',
      videoUrl: adVideo || undefined,
      description: adDescription.trim() || 'Xayeysiis cusub oo rasmi ah.',
      contactPhone: adPhone.trim() || currentStore.phone,
      city: adCity || currentStore.city,
      status: 'pending_approval', // Strictly pending! Super admin must approve
      createdAt: 'Hadda / Just now',
      isVerifiedAuthentic: false,
    };

    if (onCreateAdvertisement) {
      onCreateAdvertisement(newAd);
    }
    setIsAddAdOpen(false);
    setAdTitle('');
    setAdPrice('30');
    setAdDescription('');
    setAdSuccessMsg('Xayeysiiskaaga si guul leh ayaa loo gudbiyay! Wuxuu galay xaaladda "Sugaya ansixin" (Pending Approval); Super Admin-ka ayaa daawanaya oo xaqiijinaya dhabnimada ka hor inta aan dadweynuhu arkin.');
    setTimeout(() => setAdSuccessMsg(null), 8000);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameSomali) return;

    const assignedEmp = currentStore.employees?.find((emp) => emp.id === newAssignedEmployeeId);

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      storeId: currentStore.id,
      storeName: currentStore.name,
      storeCode: currentStore.storeCode,
      name: newNameEnglish || newNameSomali,
      nameSomali: newNameSomali,
      category: newCategory,
      priceUsd: parseFloat(newPrice) || 25,
      stock: parseInt(newStock) || 10,
      rating: 5.0,
      reviewCount: 1,
      image: newImageDataUrl,
      videoUrl: newVideoUrl || undefined,
      descriptionSomali: newDescSomali || 'Alaab tayo sare leh oo dukaanka laga helo.',
      descriptionEnglish: 'High quality product available at store.',
      assignedEmployeeId: assignedEmp?.id,
      assignedEmployeeName: assignedEmp
        ? `${assignedEmp.name} (${assignedEmp.roleTitle})`
        : `${currentStore.adminName} (Admin)`,
    };

    onAddProduct(newProd);
    setIsAddProductOpen(false);
    setNewNameSomali('');
    setNewNameEnglish('');
    setNewDescSomali('');
    setNewVideoUrl('');
    setNewAssignedEmployeeId('');
  };

  const handleSaveEditedProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    onUpdateProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName) return;

    const newEmpIndex = (currentStore.employees?.length || 0) + 1;
    const newEmpCode = `SHAQ-${newEmpIndex < 10 ? '0' + newEmpIndex : newEmpIndex}`;

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      employeeCode: newEmpCode,
      name: newEmpName,
      phone: newEmpPhone,
      password: newEmpPassword || '123456',
      role: newEmpRole,
      roleTitle:
        newEmpRole === 'delivery'
          ? 'Diraha Gaarsiinta'
          : newEmpRole === 'customer_service'
          ? 'Adeegga Macmiilka'
          : 'Maamulaha Kaydka',
      assignedTasks: newEmpTasks,
      isActive: true,
      joinedDate: 'Maanta',
    };

    onAddEmployee(currentStore.id, newEmp);
    setIsAddEmployeeOpen(false);
    setNewEmpName('');
    setNewEmpTasks('');
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassInput || newPassInput.length < 4) {
      setPassMessage({ text: 'Furaha cusub waa inuu ka koobnaadaa ugu yaraan 4 xaraf.', isError: true });
      return;
    }
    onChangeStorePassword(currentStore.id, newPassInput);
    setPassMessage({ text: 'Furaha sirta ah si guul leh ayaa loo beddelay!', isError: false });
    setCurrentPassInput('');
    setNewPassInput('');
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setStoreLogoInput(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveStoreLogo = () => {
    if (onUpdateStoreLogo) {
      onUpdateStoreLogo(currentStore.id, storeLogoInput);
    } else if (onUpdateStore) {
      onUpdateStore({ ...currentStore, logoUrl: storeLogoInput });
    }
    setLogoSaveMsg('Icon-ka dukaankaaga si guul leh ayaa loo xaqiijiyay oo loo keydiyay!');
    setTimeout(() => setLogoSaveMsg(null), 3500);
  };

  const handleAdminTeamChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminTeamInput.trim()) return;
    onSendTeamMessage(currentStore.id, `${currentStore.adminName} (Admin)`, 'Milkiilaha Dukaanka', adminTeamInput.trim());
    setAdminTeamInput('');
  };

  return (
    <div className="min-h-full pb-20 bg-slate-50 text-slate-900 select-none">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('welcome')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              title="Ku noqo"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Store Icon Display with Quick Edit Trigger */}
            <div
              onClick={() => setActiveTab('settings')}
              className="relative group cursor-pointer"
              title="Guji si aad u beddesho Icon-ka dukaanka"
            >
              {currentStore.logoUrl ? (
                <img
                  src={currentStore.logoUrl}
                  alt={currentStore.name}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-teal-600/30 shadow-xs"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-teal-800 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  {currentStore.avatar || currentStore.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white shadow-xs border border-slate-300 flex items-center justify-center text-teal-800">
                <Edit2 className="w-2.5 h-2.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                  {currentStore.name}
                </span>
                <span className="text-[10px] font-mono font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full border border-teal-300">
                  {currentStore.storeCode}
                </span>
                {currentStore.storeType === 'large' ? (
                  <span className="text-[9px] bg-slate-800 text-teal-300 px-1.5 py-0.2 rounded font-bold uppercase">
                    Weyn
                  </span>
                ) : (
                  <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium uppercase">
                    Yar
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500">
                Adminka: <b>{currentStore.adminName}</b> · {currentStore.city}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Store QR Code Button */}
            <button
              onClick={() => onOpenStoreQr(currentStore)}
              className="py-1.5 px-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold flex items-center gap-1 border border-teal-200 transition-colors cursor-pointer"
              title="Fiiri QR Code-ka dukaanka"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Code</span>
            </button>

            <button
              onClick={() => onNavigate('customer_home')}
              className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Suuqa
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 mt-3 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-teal-700 text-teal-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Alaabta ({storeProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-teal-700 text-teal-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Dalabaadka ({storeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('ads')}
            className={`pb-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ads'
                ? 'border-teal-700 text-teal-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-teal-700" />
            <span>Xayeysiisyada ({storeAds.length})</span>
            {storeAds.some((a) => a.status === 'pending_approval') && (
              <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                Sugaya
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`pb-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'employees'
                ? 'border-teal-700 text-teal-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Shaqaalaha ({currentStore.employees?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('customer_chats')}
            className={`pb-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'customer_chats'
                ? 'border-teal-700 text-teal-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Fariimaha Macaamiisha</span>
            {storeCustomerMessages.length > 0 && (
              <span className="bg-teal-100 text-teal-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {storeCustomerMessages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('team_chat')}
            className={`pb-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'team_chat'
                ? 'border-teal-700 text-teal-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Wada-hadalka Kooxda ({storeTeamMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('payment_api')}
            className={`pb-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'payment_api'
                ? 'border-teal-700 text-teal-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Lacag Bixinta & API</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-teal-700 text-teal-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Beddel Password-ka
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500">Dakhliga Guud</span>
            <div className="text-base sm:text-lg font-bold text-slate-900 mt-1 tabular-nums">
              {formatPrice(totalStoreRevenue, currency)}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">EVC & Zaad</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500">Macaamiisha (Followers)</span>
            <div className="text-base sm:text-lg font-bold text-slate-900 mt-1 tabular-nums">
              {currentStore.followersCount} qof
            </div>
            <span className="text-[10px] text-teal-700 font-medium">Toos ula xariira</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500">Aqoonsiga Dukaanka</span>
            <div className="text-base sm:text-lg font-extrabold text-teal-900 mt-1 font-mono">
              {currentStore.storeCode}
            </div>
            <span className="text-[10px] text-slate-400">QR Code diyaar ah</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500">Nooca Dukaanka</span>
            <div className="text-sm font-bold text-teal-800 mt-1">
              {currentStore.storeType === 'large' ? 'Dukaan Weyn' : 'Dukaan Yar'}
            </div>
            <span className="text-[10px] text-slate-500">
              {currentStore.storeType === 'large' ? 'Shaqaale leh' : 'Kaliya Admin'}
            </span>
          </div>
        </div>

        {/* TAB 1: PRODUCTS (Gallery Image Picker & Edit Products) */}
        {activeTab === 'products' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Alaabta Dukaanka
                </h3>
                <span className="text-[11px] text-slate-500">
                  Sawirka waxaad toos uga soo qaadan kartaa Gallery-gaaga taleefanka ama kombiyuutarka
                </span>
              </div>
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="py-1.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ku Dar Alaab Cusub</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {storeProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-3 rounded-2xl border border-slate-200 flex gap-3 items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={p.image}
                      alt={p.nameSomali}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {p.nameSomali}
                        </h4>
                        {p.videoUrl && (
                          <span className="text-[10px] bg-teal-100 text-teal-850 font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5 shrink-0">
                            <Video className="w-2.5 h-2.5 text-teal-700" />
                            <span>Video</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{p.category}</p>
                      <div className="text-xs font-bold text-teal-800 tabular-nums mt-0.5">
                        {formatPrice(p.priceUsd, currency)} · Kaydka: {p.stock}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingProduct({ ...p })}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                      title="Wax ka beddel alaabtaan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(p.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Tirtir alaabtaan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: XAYEYSIISYADA (Video & Ad Campaigns Management) */}
        {activeTab === 'ads' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-teal-700" />
                  <span>Xayeysiisyada Dukaanka & Muuqaallada</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Geli xayeysiis muuqaal (video) ama sawir leh. Xayeysiisku wuxuu sugayaa ansixinta Super Admin-ka ka hor inta uusan dadweynaha u muuqan.
                </p>
              </div>

              <button
                onClick={() => setIsAddAdOpen(true)}
                className="py-2 px-3.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <Film className="w-4 h-4" />
                <span>Samee Xayeysiis</span>
              </button>
            </div>

            {adSuccessMsg && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold block">Gudbinta Xayeysiiska:</span>
                  <span>{adSuccessMsg}</span>
                </div>
              </div>
            )}

            {storeAds.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center">
                  <Film className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Weli wax xayeysiis ah ma aadan samaysan</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Kordhi iibkaaga adoo sameynaya xayeysiis muuqaal video ah oo toos uga muuqanaya bogga gaarka ah ee Xayeysiisyada.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddAdOpen(true)}
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Samee Xayeysiis Hadda</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {storeAds.map((ad) => (
                  <div
                    key={ad.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {/* Media Display */}
                      <div className="relative aspect-video bg-slate-900 overflow-hidden">
                        {ad.videoUrl ? (
                          <video
                            src={ad.videoUrl}
                            controls
                            playsInline
                            className="w-full h-full object-cover"
                            preload="metadata"
                            onError={(e) => {
                              // If video source is invalid, safely hide video element and display image
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-full h-full object-cover"
                          />
                        )}

                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          {ad.status === 'pending_approval' && (
                            <span className="bg-amber-500/90 backdrop-blur-sm text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                              <Clock className="w-3 h-3 text-slate-950" />
                              <span>Sugaya ansixin</span>
                            </span>
                          )}
                          {ad.status === 'approved' && (
                            <span className="bg-emerald-600/95 backdrop-blur-sm text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                              <CheckCircle className="w-3 h-3 text-white" />
                              <span>La Ansixiyay (Dhab ah)</span>
                            </span>
                          )}
                          {ad.status === 'rejected' && (
                            <span className="bg-rose-600/95 backdrop-blur-sm text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                              <X className="w-3 h-3 text-white" />
                              <span>La Diiday</span>
                            </span>
                          )}
                          {ad.videoUrl && (
                            <span className="bg-slate-900/80 backdrop-blur-sm text-teal-300 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Video className="w-2.5 h-2.5" />
                              <span>Muuqaal</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3.5 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {ad.title}
                            </h4>
                            <span className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>📍 {ad.city}</span>
                              <span>📞 {ad.contactPhone}</span>
                            </span>
                          </div>
                          <span className="text-sm font-extrabold text-teal-800 tabular-nums">
                            {formatPrice(ad.priceUsd, currency)}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2">
                          {ad.description}
                        </p>

                        {/* Status detail banner */}
                        {ad.status === 'pending_approval' && (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Xayeysiisku weli uma muuqdo dadweynaha. Super Admin-ka ayaa hubinaya dhabnimada ka hor inta aan la oggolaan.</span>
                          </div>
                        )}
                        {ad.status === 'approved' && (
                          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] leading-relaxed flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Xayeysiiskan waa la ansixiyay, hadda wuxuu ka dhex muuqdaa bogga <b>Xayeysiisyo</b>.</span>
                            </div>
                            <button
                              onClick={() => onNavigate('ads_feed')}
                              className="text-emerald-800 font-bold underline text-[11px] shrink-0 cursor-pointer"
                            >
                              Arag Feed-ka
                            </button>
                          </div>
                        )}
                        {ad.status === 'rejected' && (
                          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px] leading-relaxed flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Sababta diidmada: <b>{ad.rejectionReason || 'Muuqaalku ma buuxin shuruudaha ama waa nuqul (copy).'}</b></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10.5px] text-slate-500">
                        La abuuray: {ad.createdAt}
                      </span>
                      {onDeleteAdvertisement && (
                        <button
                          onClick={() => onDeleteAdvertisement(ad.id)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer p-1 rounded hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Tirtir</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDERS WITH PAYMENT VERIFICATION */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-teal-700" />
                  <span>Dalabaadka Macaamiisha ({storeOrders.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Hubi lacagaha soo dhacay, xaqiiji TxID, ama u wareeji diyaarinta
                </p>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-sm self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setOrderFilter('awaiting')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    orderFilter === 'awaiting'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Sugaya Hubinta TxID</span>
                  <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
                    {storeOrders.filter((o) => o.status === 'awaiting_verification' || o.paymentStatus === 'submitted').length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    orderFilter === 'all'
                      ? 'bg-slate-800 text-white shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dhammaan ({storeOrders.length})
                </button>
              </div>
            </div>

            {(() => {
              const displayedOrders = storeOrders.filter((ord) => {
                if (orderFilter === 'awaiting') {
                  return ord.status === 'awaiting_verification' || ord.paymentStatus === 'submitted';
                }
                return true;
              });

              if (displayedOrders.length === 0) {
                return (
                  <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs space-y-1">
                    <CheckCircle className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-600">
                      {orderFilter === 'awaiting'
                        ? 'Ma jiraan dalabaad hadda sugaya hubin lacageed.'
                        : 'Weli wax dalab ah laguma soo dirin dukaankan.'}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {displayedOrders.map((ord) => {
                    const isAwaiting = ord.status === 'awaiting_verification' || ord.paymentStatus === 'submitted';
                    const isVerified = ord.paymentStatus === 'verified' || ord.status === 'preparing' || ord.status === 'in_transit' || ord.status === 'delivered';

                    return (
                      <div
                        key={ord.id}
                        className={`bg-white p-4 rounded-2xl border transition-all space-y-3 shadow-sm ${
                          isAwaiting
                            ? 'border-amber-300 ring-2 ring-amber-100'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div>
                            <span className="text-xs font-bold text-slate-900 font-mono">
                              {ord.orderNumber}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-2">
                              {ord.createdAt}
                            </span>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                              isAwaiting
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : ord.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'in_transit'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {isAwaiting
                              ? '⏳ Sugaya Hubinta TxID'
                              : ord.status === 'delivered'
                              ? 'La Gaarsiiyay'
                              : ord.status === 'in_transit'
                              ? 'Waddada Ku Jira'
                              : 'Diyaarinta'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                          <div>
                            <p>
                              <b>Macmiilka:</b> {ord.customerName}
                            </p>
                            <a
                              href={`tel:${ord.customerPhone}`}
                              className="text-teal-700 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{ord.customerPhone}</span>
                            </a>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              <b>Goobta:</b> {ord.customerCity} - {ord.customerAddress}
                            </p>
                          </div>

                          <div>
                            <p>
                              <b>Habka Bixinta:</b>{' '}
                              <span className="uppercase font-bold text-teal-800 font-mono">
                                {ord.paymentMethod}
                              </span>
                            </p>
                            <span className="text-sm font-extrabold text-teal-900 block mt-0.5">
                              {formatPrice(ord.totalUsd, currency)} (${ord.totalUsd.toFixed(2)} USD)
                            </span>
                          </div>
                        </div>

                        {/* Transaction ID & SMS Proof Details */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Transaction ID (TxID):
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-teal-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {ord.transactionId || 'Lama gelin (None)'}
                              </span>
                              {ord.transactionId && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    try {
                                      navigator.clipboard.writeText(ord.transactionId || '');
                                      setCopiedTxId(ord.id);
                                      setTimeout(() => setCopiedTxId(null), 2000);
                                    } catch {
                                      // fallback
                                    }
                                  }}
                                  className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                                  title="Nuqul TxID"
                                >
                                  {copiedTxId === ord.id ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {ord.paymentProofText && (
                            <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100 leading-relaxed font-sans">
                              <span className="font-bold text-slate-700 block text-[10px] mb-0.5">
                                Fariinta SMS-ka:
                              </span>
                              "{ord.paymentProofText}"
                            </div>
                          )}

                          {ord.verifiedByStaffName && (
                            <div className="text-[10px] text-emerald-800 font-medium">
                              ✓ Xaqiijiyay: <b>{ord.verifiedByStaffName}</b> ({ord.verifiedAt || 'Hadda'})
                            </div>
                          )}

                          {ord.verificationRejectionReason && (
                            <div className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                              <b>Sababta loo diiday:</b> {ord.verificationRejectionReason}
                            </div>
                          )}
                        </div>

                        {/* Controls: If Awaiting, offer Verify / Reject. Otherwise, Delivery State */}
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          {isAwaiting ? (
                            <div className="flex items-center gap-2 w-full justify-end">
                              <button
                                type="button"
                                onClick={() => setRejectingOrder(ord)}
                                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer border border-rose-200 transition-colors"
                              >
                                Diid (TxID Khalad)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onVerifyOrderPayment) {
                                    onVerifyOrderPayment(ord.id, `${currentStore.adminName} (Admin)`);
                                  } else {
                                    onUpdateOrderStatus(ord.id, 'preparing');
                                  }
                                }}
                                className="px-4 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer shadow-sm flex items-center gap-1.5 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Xaqiiji Lacagta (Approve)</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[11px] text-slate-500 font-medium">
                                Xaaladda gaarsiinta:
                              </span>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => onUpdateOrderStatus(ord.id, 'preparing')}
                                  className={`px-2 py-1 text-[11px] rounded font-medium ${
                                    ord.status === 'preparing'
                                      ? 'bg-slate-800 text-white'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  Diyaari
                                </button>
                                <button
                                  onClick={() => onUpdateOrderStatus(ord.id, 'in_transit')}
                                  className={`px-2 py-1 text-[11px] rounded font-medium ${
                                    ord.status === 'in_transit'
                                      ? 'bg-sky-700 text-white'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  Dir
                                </button>
                                <button
                                  onClick={() => onUpdateOrderStatus(ord.id, 'delivered')}
                                  className={`px-2 py-1 text-[11px] rounded font-medium ${
                                    ord.status === 'delivered'
                                      ? 'bg-emerald-700 text-white'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  Way Gaartay
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 3: EMPLOYEES (Dukaan Weyn can add employees and assign tasks) */}
        {activeTab === 'employees' && (
          <div className="space-y-4">
            {currentStore.storeType === 'small' ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto">
                  <Building className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">
                  Dukaankan waa "Dukaan Yar" (Kaliya Admin)
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Dukaamada yaryar kaliya adminka ayaa maamula. Haddii aad doonayso inaad ku darto shaqaale kula shaqeeya (Diraha gaarsiinta, adeegga macmiilka), fadlan u rog <b>Dukaan Weyn</b>.
                </p>
                <button
                  onClick={() => onUpgradeToLargeStore(currentStore.id)}
                  className="py-2.5 px-5 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  U Rog Dukaan Weyn (Upgrade)
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-teal-700" />
                      Shaqaalaha Dukaanka ({currentStore.employees?.length || 0})
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Mid kasta wuxuu leeyahay ID gaar ah (e.g. SHAQ-01) iyo hawl u xilsaaran
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddEmployeeOpen(true)}
                    className="py-1.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Ku Dar Shaqaale</span>
                  </button>
                </div>

                {(!currentStore.employees || currentStore.employees.length === 0) ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                    Weli shaqaale kuma jiro dukaankan. Guji <b>"Ku Dar Shaqaale"</b> si aad ugu darto.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {currentStore.employees.map((emp) => (
                      <div
                        key={emp.id}
                        className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              {emp.name}
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                              {emp.employeeCode}
                            </span>
                            <span className="text-[10px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-semibold border border-teal-200">
                              {emp.roleTitle}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            <b>Hawsha:</b> {emp.assignedTasks}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Tel: {emp.phone} · Password: <b>{emp.password}</b>
                          </span>
                        </div>

                        <button
                          onClick={() => onToggleEmployeeStatus(currentStore.id, emp.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                            emp.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {emp.isActive ? 'Firfircoon' : 'Hakisan'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 4: TEAM CHAT (Shaqaalaha & Adminka way wada xariiri karaan) */}
        {activeTab === 'team_chat' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 min-h-[400px] flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-700" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Wada-hadalka Kooxda Dukaanka ({currentStore.name})
                  </h3>
                </div>
                <span className="text-[11px] text-teal-700 font-medium">
                  Shaqaalaha & Adminka
                </span>
              </div>

              <div className="space-y-3 my-3 overflow-y-auto max-h-[300px] pr-1">
                {storeTeamMessages.length === 0 ? (
                  <div className="text-center text-slate-400 py-10 text-xs">
                    Weli farriin kooxeed ma jirto. Qor fariin si aad ula xariirto shaqaalahaaga.
                  </div>
                ) : (
                  storeTeamMessages.map((msg) => (
                    <div key={msg.id} className="flex flex-col items-start">
                      <div className="flex items-center gap-1.5 mb-0.5 px-1 text-[10px]">
                        <span className="font-bold text-slate-700">
                          {msg.senderName}
                        </span>
                        <span className="text-slate-400">({msg.senderRole})</span>
                      </div>
                      <div className="max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-sm bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200">
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <form onSubmit={handleAdminTeamChatSend} className="pt-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={adminTeamInput}
                onChange={(e) => setAdminTeamInput(e.target.value)}
                placeholder="U dir fariin shaqaalahaaga..."
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600"
              />
              <button
                type="submit"
                disabled={!adminTeamInput.trim()}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dir</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB: CUSTOMER CHATS (Fariimaha Macaamiisha oo Adminku toos ugu jawaabi karo) */}
        {activeTab === 'customer_chats' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 min-h-[420px] flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-700" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Fariimaha Tooska ah ee Macaamiisha ({storeCustomerMessages.length})
                  </h3>
                </div>
                <span className="text-[11px] text-teal-800 font-semibold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Jawaab Toos ah (Live Admin Response)
                </span>
              </div>

              <div className="space-y-3 my-3 overflow-y-auto max-h-[340px] pr-1">
                {storeCustomerMessages.length === 0 ? (
                  <div className="text-center text-slate-400 py-12 text-xs">
                    Weli macmiil fariin kuuma soo dirin. Marka uu macmiilku fariin soo diro, halkan ayay toos uga soo muuqan doontaa adiga ayaana toos ugu jawaabi kara!
                  </div>
                ) : (
                  storeCustomerMessages.map((msg) => {
                    const isCustomer = msg.sender === 'customer';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isCustomer ? 'items-start' : 'items-end'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5 px-1 text-[10px]">
                          <span className={`font-bold ${isCustomer ? 'text-teal-900' : 'text-slate-700'}`}>
                            {isCustomer ? 'Macmiil' : msg.senderName || `${currentStore.adminName} (Admin)`}
                          </span>
                          {msg.productName && (
                            <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                              Alaabta: {msg.productName}
                            </span>
                          )}
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-sm leading-relaxed ${
                            isCustomer
                              ? 'bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200'
                              : 'bg-teal-800 text-white rounded-br-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                          {msg.timestamp}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <form onSubmit={handleSendCustomerChatReply} className="pt-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={customerChatReplyText}
                onChange={(e) => setCustomerChatReplyText(e.target.value)}
                placeholder={`U jawaab macmiilka adigoo ah ${currentStore.adminName} (Admin)...`}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600"
              />
              <button
                type="submit"
                disabled={!customerChatReplyText.trim()}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Jawaab Macmiilka</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB: PAYMENT METHODS & API GATEWAY INTEGRATION */}
        {activeTab === 'payment_api' && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-5 max-w-2xl shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-teal-700" />
                  <span>Qaabka Lacag Bixinta & Ku-xirka API</span>
                </h3>
                <span className="text-[10px] bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded-full border border-teal-200 uppercase">
                  {paymentMode === 'api_gateway' ? 'Automated API' : 'Manual Mobile Money'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Halkan ku habee nambarada taleefanka ee lacagta kugu soo dhacayso, ama ku xir <b>Payment API Gateway</b> (Waafi, Hormuud, ama eDahab) si dukaankaaga si toos ah lacagaha loogu bixiyo.
              </p>
            </div>

            {savePaymentMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-semibold">{savePaymentMsg}</span>
              </div>
            )}

            {/* Mode Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMode('manual_numbers')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  paymentMode === 'manual_numbers'
                    ? 'border-teal-700 bg-teal-50/60 font-bold text-teal-950 ring-2 ring-teal-600/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <Phone className="w-3.5 h-3.5 text-teal-700" />
                  <span>Nambarada Taleefanka (Mobile Money)</span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  Macaamiishu waxay dirayaan EVC, Zaad, eDahab, kadibna TxID ayay soo gelinayaan
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('api_gateway')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  paymentMode === 'api_gateway'
                    ? 'border-teal-700 bg-teal-50/60 font-bold text-teal-950 ring-2 ring-teal-600/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Ku Xir API Gateway Toos ah</span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  Waafi API, Hormuud API, Somtel eDahab Gateway toos ah oo lacagta goynaya
                </p>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updatedCfg: StorePaymentConfig = {
                  mode: paymentMode,
                  evcNumber: evcInput.trim(),
                  zaadNumber: zaadInput.trim(),
                  edahabNumber: edahabInput.trim(),
                  sahalNumber: sahalInput.trim(),
                  merchantTillNumber: tillInput.trim(),
                  instructions: instructionsInput.trim(),
                  gatewayProvider,
                  apiGatewayUrl: gatewayUrl.trim(),
                  merchantId: merchantIdInput.trim(),
                  apiKey: apiKeyInput.trim(),
                  isLive: isLiveInput,
                };
                if (onUpdateStorePaymentConfig) {
                  onUpdateStorePaymentConfig(currentStore.id, updatedCfg);
                }
                setSavePaymentMsg('Habaynta lacag-bixinta dukaanka si guul leh ayaa loo kaydiyay!');
                setTimeout(() => setSavePaymentMsg(null), 3500);
              }}
              className="space-y-4 text-xs"
            >
              {/* SECTION A: MANUAL MOBILE MONEY NUMBERS */}
              {paymentMode === 'manual_numbers' ? (
                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-xs">
                    Nambarada Qaabilaada Lacagta ee Dukaanka:
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Hormuud EVC Plus (+252 61...)
                      </label>
                      <input
                        type="text"
                        value={evcInput}
                        onChange={(e) => setEvcInput(e.target.value)}
                        placeholder="+252 61 5500000"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Telesom Zaad (+252 63...)
                      </label>
                      <input
                        type="text"
                        value={zaadInput}
                        onChange={(e) => setZaadInput(e.target.value)}
                        placeholder="+252 63 4400000"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Somtel eDahab (+252 65...)
                      </label>
                      <input
                        type="text"
                        value={edahabInput}
                        onChange={(e) => setEdahabInput(e.target.value)}
                        placeholder="+252 65 9900000"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Golis Sahal (+252 90...)
                      </label>
                      <input
                        type="text"
                        value={sahalInput}
                        onChange={(e) => setSahalInput(e.target.value)}
                        placeholder="+252 90 7700000"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Aqoonsiga Ganacsiga / Merchant Till Number (Haddii aad leedahay):
                      </label>
                      <input
                        type="text"
                        value={tillInput}
                        onChange={(e) => setTillInput(e.target.value)}
                        placeholder="Tusaale: 782910 ama 90123"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Fariinta ama Hagaha Lacag-bixinta ee loo muujinayo Macmiilka:
                      </label>
                      <textarea
                        rows={2}
                        value={instructionsInput}
                        onChange={(e) => setInstructionsInput(e.target.value)}
                        placeholder="Tusaale: Fadlan ku qor magacaaga iyo dalabka marka aad lacagta dirto..."
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* SECTION B: API GATEWAY CONFIGURATION */
                <div className="space-y-4 p-4 bg-teal-950 text-white rounded-2xl border border-teal-800 shadow-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-teal-800">
                    <div>
                      <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>Habaynta API Gateway-ga Dukaanka</span>
                      </h4>
                      <p className="text-[10px] text-teal-300 mt-0.5">
                        Xogta API-ga dukaankaaga si toos ah ayaa loogu xirayaa macaamiisha
                      </p>
                    </div>
                    <span className="text-[10px] bg-teal-800 text-teal-200 px-2 py-0.5 rounded-full font-mono">
                      v1.2 REST
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-teal-200 mb-1">
                        Bixiyaha API Gateway-ga (Provider)
                      </label>
                      <select
                        value={gatewayProvider}
                        onChange={(e) => setGatewayProvider(e.target.value as any)}
                        className="w-full px-3 py-2 bg-teal-900 border border-teal-700 text-white rounded-xl focus:outline-none focus:border-teal-400"
                      >
                        <option value="waafi">Waafi Pay API (Hormuud & Salaam)</option>
                        <option value="hormuud_api">Hormuud Merchant API Gateway</option>
                        <option value="edahab_api">Somtel eDahab Merchant API</option>
                        <option value="custom_unified">Unified Somali Payment Gateway (Kulli Hal API)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-teal-200 mb-1">
                        Merchant ID / Aqoonsiga Ganacsiga API
                      </label>
                      <input
                        type="text"
                        required
                        value={merchantIdInput}
                        onChange={(e) => setMerchantIdInput(e.target.value)}
                        placeholder="MRCH-DUK-101"
                        className="w-full px-3 py-2 bg-teal-900 border border-teal-700 text-white font-mono rounded-xl focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-teal-200 mb-1">
                        API Gateway URL (Endpoint Link)
                      </label>
                      <input
                        type="url"
                        required
                        value={gatewayUrl}
                        onChange={(e) => setGatewayUrl(e.target.value)}
                        placeholder="https://api.waafi.com/v1/checkout"
                        className="w-full px-3 py-2 bg-teal-900 border border-teal-700 text-teal-200 font-mono rounded-xl focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-teal-200 mb-1">
                        API Secret Key / Token
                      </label>
                      <input
                        type="password"
                        required
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="sk_live_somalia_..."
                        className="w-full px-3 py-2 bg-teal-900 border border-teal-700 text-teal-200 font-mono rounded-xl focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-between p-2.5 bg-teal-900/60 rounded-xl border border-teal-800">
                      <div>
                        <span className="font-semibold text-white block">Xaaladda API (Live Mode)</span>
                        <span className="text-[10px] text-teal-300">
                          Toos ugu xiran xisaabta rasmiga ah
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isLiveInput}
                        onChange={(e) => setIsLiveInput(e.target.checked)}
                        className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Interactive Ping Test */}
                  <div className="pt-2 border-t border-teal-800 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setApiTestResult({ status: 'testing', message: 'Tijaabinaya xiriirka API Gateway-ga...' });
                        setTimeout(() => {
                          if (!gatewayUrl.trim().startsWith('http')) {
                            setApiTestResult({
                              status: 'error',
                              message: 'Khalad: URL-ka API-ga waa inuu ku bilowdaa https:// ama http://',
                            });
                          } else {
                            setApiTestResult({
                              status: 'success',
                              message: `✓ Guul! API Gateway-ga "${gatewayProvider.toUpperCase()}" wuu shaqeynayaa (Status: 200 OK, Ping: 38ms).`,
                            });
                          }
                        }, 900);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors w-full sm:w-auto justify-center"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${apiTestResult?.status === 'testing' ? 'animate-spin' : ''}`} />
                      <span>Tijaabi API Link (Ping Test)</span>
                    </button>

                    {apiTestResult && (
                      <span
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-lg ${
                          apiTestResult.status === 'success'
                            ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                            : apiTestResult.status === 'error'
                            ? 'bg-rose-900/80 text-rose-300 border border-rose-700'
                            : 'bg-teal-900 text-teal-300'
                        }`}
                      >
                        {apiTestResult.message}
                      </span>
                    )}
                  </div>

                  {/* Direct Merchant Checkout Link Generator */}
                  <div className="p-3 bg-teal-900/50 rounded-xl border border-teal-800 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider block">
                      Link-ga Lacag-Bixinta ee Dukaankaaga (Direct Payment Link):
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`https://suuqa.app/pay?store=${currentStore.storeCode}`}
                        className="flex-1 px-3 py-1.5 bg-teal-950 text-teal-200 text-xs font-mono rounded-lg border border-teal-700 select-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            navigator.clipboard.writeText(`https://suuqa.app/pay?store=${currentStore.storeCode}`);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          } catch {
                            // fallback
                          }
                        }}
                        className="py-1.5 px-3 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Guuriyay' : 'Nuqul'}</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-teal-400 block leading-tight">
                      Link-gan u dir macaamiishaada WhatsApp, Instagram, ama TikTok si ay toos ugu bixiyaan API-gaaga.
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold transition-colors cursor-pointer shadow-sm text-xs sm:text-sm"
              >
                Kaydi Habaynta Lacag Bixinta & API
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: SETTINGS (Store Icon / Logo & Change Password) */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-lg">
            {/* Store Icon / Logo Management */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-teal-700" />
                    Icon-ka & Logo-da Dukaanka
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Geli astaanta gaarka ah ee dukaankaaga (Store Logo / Icon)
                  </p>
                </div>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  Logo-da Rasmiga ah
                </span>
              </div>

              {logoSaveMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{logoSaveMsg}</span>
                </div>
              )}

              {/* Icon Preview */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="relative shrink-0">
                  {storeLogoInput ? (
                    <img
                      src={storeLogoInput}
                      alt="Store Logo Preview"
                      className="w-20 h-20 rounded-2xl object-cover shadow-md ring-2 ring-teal-600/40"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-teal-800 text-white font-black text-2xl flex items-center justify-center shadow-md">
                      {currentStore.avatar || currentStore.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  {storeLogoInput && (
                    <button
                      type="button"
                      onClick={() => setStoreLogoInput('')}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-sm cursor-pointer"
                      title="Tir astaanta"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 flex-1 text-xs">
                  <p className="font-bold text-slate-800">Muuqaalka Astaanta:</p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Sawirkani wuxuu u muuqan doonaa macaamiisha bogga hore, fariimaha, iyo profile-ka dukaankaaga.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <label className="py-1.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Ka Soo Qaad Gallery-ga</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Preset Quick Logos */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Ama ka dooro astaan diyaarsan:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '👗 Dharka & Moodada', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&q=80' },
                    { label: '📱 Mobile & Tech', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&q=80' },
                    { label: '🛒 Raashin & Cunto', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80' },
                    { label: '✨ Cadar & Uunsi', url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=200&q=80' },
                    { label: '💎 Dahab & Dahabshil', url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&q=80' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setStoreLogoInput(preset.url)}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Image URL input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ama qor Link-ga Sawirka (Direct Image URL):
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/mylogo.png"
                  value={storeLogoInput}
                  onChange={(e) => setStoreLogoInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 bg-white"
                />
              </div>

              {/* Save Icon Button */}
              <button
                type="button"
                onClick={handleSaveStoreLogo}
                className="w-full py-2.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Kaydi Icon-ka Cusub ee Dukaanka</span>
              </button>
            </div>

            {/* Change Admin Password */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-teal-700" />
                  Beddel Furaha Sirta ah ee Adminka
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Adminku wuu cusboonaysiin karaa password-ka uu dukaanka ku galo
                </p>
              </div>

              {passMessage && (
                <div
                  className={`p-3 rounded-xl text-xs ${
                    passMessage.isError
                      ? 'bg-rose-50 border border-rose-200 text-rose-700'
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  }`}
                >
                  {passMessage.text}
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Password-ka Cusub (New Password)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    placeholder="Geli furaha cusub"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-600 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold transition-colors cursor-pointer"
                >
                  Cusboonaysii Furaha Sirta ah
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add New Product with GALLERY UPLOAD */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">
                Ku Dar Alaab Cusub (Sawirka Gallery-ga)
              </h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 mt-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Magaca Alaabta (Af-Soomaali)
                </label>
                <input
                  type="text"
                  required
                  value={newNameSomali}
                  onChange={(e) => setNewNameSomali(e.target.value)}
                  placeholder="Tusaale: Dirac Bacweyne Shiifon"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Gallery Image Picker */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sawirka Alaabta (Ka soo qaado Gallery-gaaga):
                </label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {newImageDataUrl ? (
                    <img
                      src={newImageDataUrl}
                      alt="Product Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-300 shrink-0 bg-white"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1">
                    <input
                      type="file"
                      ref={addFileInputRef}
                      accept="image/*"
                      onChange={(e) => handleGalleryFileSelect(e, false)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => addFileInputRef.current?.click()}
                      className="py-2 px-3 rounded-lg bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Dooro Sawir Gallery-ga</span>
                    </button>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      PNG, JPG ama WEBP ka soo dooro taleefankaaga
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Video Picker / URL (Optional) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-teal-700" />
                    <span>Muuqaalka Alaabta (Product Video):</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Ikhtiyaari (Optional)</span>
                </label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={addVideoFileInputRef}
                      accept="video/*"
                      onChange={(e) => handleVideoFileSelect(e, false)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => addVideoFileInputRef.current?.click()}
                      className="py-1.5 px-3 rounded-lg bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Soo Geli Video (Gallery/Camera)</span>
                    </button>
                    {newVideoUrl && (
                      <button
                        type="button"
                        onClick={() => setNewVideoUrl('')}
                        className="py-1 px-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Ka saar
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 shrink-0">ama Link:</span>
                    <input
                      type="text"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      placeholder="https://... MP4 ama WebM link"
                      className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                  {newVideoUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-300 bg-black aspect-video max-h-36">
                      <video
                        src={newVideoUrl}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                        preload="metadata"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Qiimaha ($ USD)
                  </label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cadadka Kaydka (Stock)
                  </label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Qaybta (Category)
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
                >
                  <option value="Dharka & Moodada">Dharka & Moodada</option>
                  <option value="Elektaroonig">Elektaroonig</option>
                  <option value="Raashinka & Uunsiga">Raashinka & Uunsiga</option>
                  <option value="Qalabka Guriga">Qalabka Guriga</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sharaxaadda (Description)
                </label>
                <textarea
                  rows={2}
                  value={newDescSomali}
                  onChange={(e) => setNewDescSomali(e.target.value)}
                  placeholder="Xog faahfaahsan oo ku saabsan alaabta..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Shaqaalaha fariimaha ka jawaabaya ee alaabtan u xilsaaran (Dukaan Weyn) */}
              {currentStore.storeType === 'large' && (
                <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200 space-y-1">
                  <label className="block font-bold text-teal-950">
                    Shaqaalaha u xilsaaran fariimaha alaabtan:
                  </label>
                  <select
                    value={newAssignedEmployeeId}
                    onChange={(e) => setNewAssignedEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:outline-none focus:border-teal-600 bg-white font-medium text-xs text-slate-800"
                  >
                    <option value="">Adminka ({currentStore.adminName}) - Default</option>
                    {currentStore.employees?.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.roleTitle}) - {emp.employeeCode}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-teal-800 block">
                    Macmiilku marka uu alaabtan chat ka furo, shaqaalahan loo xilsaaray oo kaliya ayaa fariintiisa la wareegi doona.
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-semibold cursor-pointer"
              >
                Kaydi & Soo Bandhig Alaabta
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Existing Product with Gallery Upload */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">
                Wax Ka Beddel Alaabta (Edit Product)
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedProduct} className="space-y-3 mt-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Magaca Alaabta (Af-Soomaali)
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.nameSomali}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, nameSomali: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Gallery Image Picker for Edit */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Beddel Sawirka (Ka soo qaado Gallery-ga):
                </label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <img
                    src={editingProduct.image}
                    alt="Edit Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-300 shrink-0 bg-white"
                  />
                  <div>
                    <input
                      type="file"
                      ref={editFileInputRef}
                      accept="image/*"
                      onChange={(e) => handleGalleryFileSelect(e, true)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="py-1.5 px-3 rounded-lg bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Dooro Sawir Cusub</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Video Picker / URL for Edit */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-teal-700" />
                    <span>Muuqaalka Alaabta (Product Video):</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Ikhtiyaari (Optional)</span>
                </label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={editVideoFileInputRef}
                      accept="video/*"
                      onChange={(e) => handleVideoFileSelect(e, true)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => editVideoFileInputRef.current?.click()}
                      className="py-1.5 px-3 rounded-lg bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Beddel / Geli Video</span>
                    </button>
                    {editingProduct.videoUrl && (
                      <button
                        type="button"
                        onClick={() => setEditingProduct({ ...editingProduct, videoUrl: undefined })}
                        className="py-1 px-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Ka saar
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 shrink-0">ama Link:</span>
                    <input
                      type="text"
                      value={editingProduct.videoUrl || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, videoUrl: e.target.value })}
                      placeholder="https://... MP4 link"
                      className="flex-1 px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                  {editingProduct.videoUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-300 bg-black aspect-video max-h-36">
                      <video
                        src={editingProduct.videoUrl}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                        preload="metadata"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Qiimaha ($ USD)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.priceUsd}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        priceUsd: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kaydka (Stock)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sharaxaadda (Description)
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.descriptionSomali}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      descriptionSomali: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-semibold cursor-pointer"
              >
                Cusboonaysii Alaabta (Save Changes)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Samee Xayeysiis (Create Advertisement & Submit for Super Admin Approval) */}
      {isAddAdOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Samee Xayeysiis Cusub (Create Ad)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Dukaanka: {currentStore.name} ({currentStore.storeCode})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAddAdOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Workflow Notice */}
            <div className="my-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5 leading-relaxed">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Nidaamka Hubinta & Ansixinta:</span>
                Marka aad taabato <b>"Gudbi si loo ansixiyo"</b>, xayeysiisku wuxuu galayaa xaaladda <b>Sugaya ansixin</b>; dadweynuhu weli ma arki karaan. Super Admin-ka ayaa daawanaya muuqaalka si uu u xaqiijiyo inuu dhab yahay oo uusan ahayn nuqul (copy/scam), ka dibna wuu ansixinayaa si uu uga muuqdo bogga <b>Xayeysiisyo</b>.
              </div>
            </div>

            <form onSubmit={handleCreateAdSubmit} className="space-y-3.5 text-xs">
              {/* Magaca Alaabta */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Magaca Alaabta / Ciwaanka Xayeysiiska: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  placeholder="Tusaale: Dirac Bacweyne Shiifon oo Casri ah"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Qiimaha iyo Lambarka Xiriirka */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Qiimaha ($ USD): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={adPrice}
                    onChange={(e) => setAdPrice(e.target.value)}
                    placeholder="35"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lambarka Xiriirka: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={adPhone}
                    onChange={(e) => setAdPhone(e.target.value)}
                    placeholder="+252 61 ..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              {/* Magaalada */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Magaalada / Goobta:
                </label>
                <input
                  type="text"
                  value={adCity}
                  onChange={(e) => setAdCity(e.target.value)}
                  placeholder="Muqdisho, Hargeysa, Garowe..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Video-ka Xayeysiiska (The main requested feature!) */}
              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2">
                <label className="block font-bold text-teal-950 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-teal-700" />
                    <span>Muuqaalka Video-ka ee Xayeysiiska:</span>
                  </span>
                  <span className="text-[10px] text-teal-800 font-medium">Loo baahan yahay / Fiidiyoow</span>
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={adVideoFileInputRef}
                    accept="video/*"
                    onChange={handleAdVideoFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => adVideoFileInputRef.current?.click()}
                    className="py-1.5 px-3 rounded-lg bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Soo Geli Video (Gallery / Camera)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdVideo('/assets/videos/somali_ad_sample.mp4')}
                    className="py-1.5 px-2.5 rounded-lg bg-white border border-teal-300 text-teal-900 hover:bg-teal-100 text-xs font-semibold cursor-pointer"
                  >
                    Tusaale Muuqaal Demo
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-teal-900 font-semibold shrink-0">ama Video Link:</span>
                  <input
                    type="text"
                    value={adVideo}
                    onChange={(e) => setAdVideo(e.target.value)}
                    placeholder="https://... MP4 video link"
                    className="flex-1 px-2.5 py-1 text-xs border border-teal-300 rounded-lg focus:outline-none focus:border-teal-600 font-mono bg-white"
                  />
                </div>

                {adVideo && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-teal-300 bg-black aspect-video max-h-44">
                    <video
                      src={adVideo}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                      preload="metadata"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <span className="text-[10px] text-teal-800 block">
                  Muuqaalkan waxaa daawan doona Super Admin-ka si uu u xaqiijiyo inuu dhab yahay ka hor inta aan dadweynuhu arkin.
                </span>
              </div>

              {/* Sawirka Xayeysiiska (Cover Image) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sawirka Daboolka (Cover Image):
                </label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {adImage ? (
                    <img
                      src={adImage}
                      alt="Ad Preview"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-300 shrink-0 bg-white"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1">
                    <input
                      type="file"
                      ref={adImageFileInputRef}
                      accept="image/*"
                      onChange={handleAdImageFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => adImageFileInputRef.current?.click()}
                      className="py-1.5 px-3 rounded-lg bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Dooro Sawir Gallery-ga</span>
                    </button>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Sawirka guud ee xayeysiiska
                    </span>
                  </div>
                </div>
              </div>

              {/* Faahfaahinta */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Faahfaahinta Xayeysiiska (Description): <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={adDescription}
                  onChange={(e) => setAdDescription(e.target.value)}
                  placeholder="Xog faahfaahsan oo ku saabsan alaabta, cabbirka, tayada, iyo sida loo helayo..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Gudbi si loo ansixiyo (Submit for Approval)</span>
                </button>
                <span className="text-[10.5px] text-slate-500 text-center block mt-1.5">
                  Xayeysiisku wuxuu galayaa xaaladda <b>Sugaya ansixin</b>; dadweynuhu ma arki karaan ilaa Super Admin-ku oggolaado.
                </span>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Employee for Dukaan Weyn */}
      {isAddEmployeeOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900">
                Ku Dar Shaqaale Cusub (Dukaan Weyn)
              </h3>
              <button
                onClick={() => setIsAddEmployeeOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3 mt-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Magaca Shaqaalaha
                </label>
                <input
                  type="text"
                  required
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder="Tusaale: Faadumo Maxamed"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Telefoonka
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    placeholder="+252 61..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Password-ka Shaqaalaha
                  </label>
                  <input
                    type="password"
                    required
                    value={newEmpPassword}
                    onChange={(e) => setNewEmpPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Doorka Shaqada (Role)
                </label>
                <select
                  value={newEmpRole}
                  onChange={(e) =>
                    setNewEmpRole(e.target.value as any)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
                >
                  <option value="customer_service">Adeegga Macmiilka & Chat-ka</option>
                  <option value="cashier">Khasnajiga & Hubinta Lacagaha (Cashier)</option>
                  <option value="delivery">Diraha Gaarsiinta (Delivery Rider)</option>
                  <option value="inventory">Maamulaha Kaydka (Inventory Stock)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hawsha loo dhiibay (Assigned Tasks)
                </label>
                <textarea
                  rows={2}
                  required
                  value={newEmpTasks}
                  onChange={(e) => setNewEmpTasks(e.target.value)}
                  placeholder="Qeex waxa uu qabanayo..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-semibold cursor-pointer"
              >
                Diiwaangeli Shaqaalaha
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Order Rejection Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 text-rose-700">
                <AlertTriangle className="w-4 h-4" />
                <span>Diid Caddaynta Lacagta ({rejectingOrder.orderNumber})</span>
              </h3>
              <button
                onClick={() => setRejectingOrder(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Macmiilka: <b>{rejectingOrder.customerName}</b> ({rejectingOrder.customerPhone})<br />
              TxID-ga la soo diray: <b className="font-mono text-teal-800">{rejectingOrder.transactionId || 'Lama helin'}</b>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sababta Loo Diiday (Rejection Reason):
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-rose-600"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {[
                  'TxID-gu ma jiro xisaabta dukaanka',
                  'Lacagtu may soo dhicin weli',
                  'Qaddarka la diray ayaa khaldan',
                ].map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => setRejectReason(sugg)}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded cursor-pointer"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Jooji
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onRejectOrderPayment) {
                    onRejectOrderPayment(rejectingOrder.id, rejectReason);
                  } else {
                    onUpdateOrderStatus(rejectingOrder.id, 'cancelled');
                  }
                  setRejectingOrder(null);
                }}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-rose-700 hover:bg-rose-600 text-white cursor-pointer shadow"
              >
                Xaqiiji Diidmada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
