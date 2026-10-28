import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  MessageSquare,
  Sparkles,
  MapPin,
  X,
  Plus,
  Minus,
  CheckCircle2,
  Filter,
  Store as StoreIcon,
  UserCheck,
  UserPlus,
  ArrowRight,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Phone,
  AlertCircle,
  RefreshCw,
  Zap,
  Receipt,
  Clock,
  XCircle,
  Video,
  Film,
  Play,
  Pause,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, CartItem, Order, SomaliCurrency, PaymentMethod, ScreenType, Store } from '../../types';
import { formatPrice, SOMALI_CITIES } from '../../data/mockData';

interface CustomerHomeScreenProps {
  products: Product[];
  stores: Store[];
  cart: CartItem[];
  currency: SomaliCurrency;
  followedStores: string[];
  onToggleFollow: (storeId: string) => void;
  onSetCurrency: (c: SomaliCurrency) => void;
  onAddToCart: (product: Product) => void;
  onUpdateCartQuantity: (productId: string, delta: number) => void;
  onClearCart: () => void;
  onPlaceOrder: (order: Order) => void;
  onOpenStoreProfile: (store: Store) => void;
  onOpenChat: (store: Store, product?: Product) => void;
  onOpenStoreQr: (store: Store) => void;
  onOpenInstallModal?: () => void;
  onOpenCameraScanner?: () => void;
  onNavigate: (screen: ScreenType) => void;
  orders?: Order[];
  onResubmitPayment?: (orderId: string, newTxId: string, newProof?: string) => void;
}

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({
  products,
  stores,
  cart,
  currency,
  followedStores,
  onToggleFollow,
  onSetCurrency,
  onAddToCart,
  onUpdateCartQuantity,
  onClearCart,
  onPlaceOrder,
  onOpenStoreProfile,
  onOpenChat,
  onOpenStoreQr,
  onOpenInstallModal,
  onOpenCameraScanner,
  onNavigate,
  orders = [],
  onResubmitPayment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Dhammaan');
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<Order | null>(null);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [resubmittingOrderId, setResubmittingOrderId] = useState<string | null>(null);
  const [newResubmitTxId, setNewResubmitTxId] = useState('');
  const [newResubmitProof, setNewResubmitProof] = useState('');
  const [resubmitSuccessMsg, setResubmitSuccessMsg] = useState<string | null>(null);

  // Checkout form fields
  const [customerName, setCustomerName] = useState('Maxamed Cali');
  const [customerPhone, setCustomerPhone] = useState('+252 61 5500000');
  const [customerCity, setCustomerCity] = useState(SOMALI_CITIES[0]);
  const [customerAddress, setCustomerAddress] = useState('Degmada Hodan, Laamiga Wadnaha');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('evc_plus');
  
  // Real Somali Payment & Transaction Verification states
  const [transactionId, setTransactionId] = useState('');
  const [paymentProofText, setPaymentProofText] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1); // Step 1: Customer details & Method; Step 2: Payment & TxID verification
  const [checkoutMode, setCheckoutMode] = useState<'manual_mobile' | 'api_gateway'>('manual_mobile');
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const categories = [
    'Dhammaan',
    'Dharka & Moodada',
    'Elektaroonig',
    'Raashinka & Uunsiga',
    'Qalabka Guriga',
  ];

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotalUsd = cart.reduce(
    (acc, item) => acc + item.product.priceUsd * item.quantity,
    0
  );

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameSomali.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'Dhammaan' || p.category === selectedCategory;
    const matchesStore = !selectedStoreId || p.storeId === selectedStoreId;
    return matchesSearch && matchesCategory && matchesStore;
  });

  const getStoreForProduct = (prod: Product): Store => {
    return stores.find((s) => s.id === prod.storeId || s.name === prod.storeName) || stores[0];
  };

  const currentCartStore = stores.find(
    (s) => s.id === cart[0]?.product.storeId || s.name === cart[0]?.product.storeName
  ) || stores[0];

  const handleStartCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutStep(1);
    setFormError(null);
    setTransactionId('');
    setPaymentProofText('');
    if (currentCartStore?.paymentConfig?.mode === 'api_gateway') {
      setCheckoutMode('api_gateway');
    } else {
      setCheckoutMode('manual_mobile');
    }
    setIsCheckingOut(true);
  };

  const handleCopy = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleStep1Proceed = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setFormError('Fadlan buuxi magacaaga, taleefankaaga, iyo cinwaankaaga.');
      return;
    }

    if (paymentMethod === 'cash') {
      // Direct cash order on delivery
      finalizeOrder('cash_pending');
      return;
    }

    // Proceed to Step 2 for real payment & TxID verification or API Gateway
    setCheckoutStep(2);
  };

  const handleFinalizeWithTxId = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!transactionId.trim()) {
      setFormError('Fadlan geli Transaction ID-ga (TxID) laguu soo diray markaad lacagta bixisay.');
      return;
    }

    finalizeOrder('awaiting_verification');
  };

  const handlePayViaApiGateway = () => {
    setIsApiLoading(true);
    setFormError(null);

    // Simulate real API Gateway handshake (Waafi / Hormuud API / Somtel eDahab API)
    setTimeout(() => {
      setIsApiLoading(false);
      const apiRef = `API-GW-${Math.floor(10000000 + Math.random() * 90000000)}`;
      finalizeOrder('api_verified', apiRef);
    }, 1200);
  };

  const finalizeOrder = (type: 'cash_pending' | 'awaiting_verification' | 'api_verified', apiRef?: string) => {
    const isApi = type === 'api_verified';
    const isCash = type === 'cash_pending';

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `SQ-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerCity,
      customerAddress: customerAddress.trim(),
      items: [...cart],
      totalUsd: cartSubtotalUsd,
      paymentMethod,
      status: isCash ? 'pending' : isApi ? 'preparing' : 'awaiting_verification',
      createdAt: 'Hadda (Just now)',
      storeId: currentCartStore.id,
      storeCode: currentCartStore.storeCode,
      transactionId: isApi ? apiRef : transactionId.trim() || undefined,
      paymentProofText: isApi
        ? `API Handshake Successful via ${currentCartStore.paymentConfig?.gatewayProvider || 'Waafi'}. Ref: ${apiRef}`
        : paymentProofText.trim() || undefined,
      paymentStatus: isCash ? 'unpaid' : isApi ? 'verified' : 'submitted',
      verifiedByStaffName: isApi ? 'API Gateway (Toos)' : undefined,
      verifiedAt: isApi ? 'Hadda' : undefined,
    };

    onPlaceOrder(newOrder);
    onClearCart();
    setIsCheckingOut(false);
    setIsCartOpen(false);
    setCheckoutStep(1);
    setOrderCompleted(newOrder);

    try {
      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }
  };

  const handleDoResubmit = (orderId: string) => {
    if (!newResubmitTxId.trim()) return;
    if (onResubmitPayment) {
      onResubmitPayment(orderId, newResubmitTxId.trim(), newResubmitProof.trim() || undefined);
    }
    setResubmittingOrderId(null);
    setNewResubmitTxId('');
    setNewResubmitProof('');
    setResubmitSuccessMsg('TxID-ga cusub si guul leh ayaa loo gudbiyay!');
    setTimeout(() => setResubmitSuccessMsg(null), 3500);
  };

  return (
    <div className="relative min-h-full pb-20 bg-slate-50 text-slate-900 select-none">
      {/* Top Mobile Bar with Somali Mobile Money Selector */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-tight text-teal-800">
              Suuqa App
            </span>
            <span className="text-xs text-slate-400 font-medium">· Macmiil</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Somali Mobile Money Currencies: EVC Plus, Zaad, eDahab, Sahal */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => onSetCurrency('EVC_PLUS')}
                className={`px-2 py-1 rounded font-medium transition-all cursor-pointer ${
                  currency === 'EVC_PLUS'
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Hormuud EVC Plus"
              >
                EVC Plus
              </button>
              <button
                onClick={() => onSetCurrency('ZAAD')}
                className={`px-2 py-1 rounded font-medium transition-all cursor-pointer ${
                  currency === 'ZAAD'
                    ? 'bg-teal-700 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Telesom Zaad"
              >
                Zaad
              </button>
              <button
                onClick={() => onSetCurrency('EDAHAB')}
                className={`px-2 py-1 rounded font-medium transition-all cursor-pointer ${
                  currency === 'EDAHAB'
                    ? 'bg-amber-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Somtel eDahab"
              >
                eDahab
              </button>
              <button
                onClick={() => onSetCurrency('SAHAL')}
                className={`px-2 py-1 rounded font-medium transition-all cursor-pointer ${
                  currency === 'SAHAL'
                    ? 'bg-sky-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Golis Sahal"
              >
                Sahal
              </button>
            </div>

            {/* Dalabaadkayga (My Orders & Verification Status) */}
            <button
              onClick={() => setIsOrdersModalOpen(true)}
              className="relative p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="View My Orders"
              title="Dalabaadkayga & Hubinta TxID"
            >
              <Receipt className="w-5 h-5" />
              {orders.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-teal-700 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                  {orders.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 transition-colors cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Input & Camera QR Scanner Button */}
        <div className="flex items-center gap-2 mt-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Raadi alaab, Dirac, taleefan, ama dukaan..."
              className="w-full pl-9 pr-8 py-2 bg-slate-100 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 border border-transparent focus:border-teal-500 focus:bg-white focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {onOpenCameraScanner && (
            <button
              onClick={onOpenCameraScanner}
              className="py-2 px-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 font-bold text-xs shadow-sm"
              title="Kamarada ku aadi QR Code si aad dukaanka u gasho"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Sawir QR</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Mobile App Install Quick Banner */}
        <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 text-white rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm border border-teal-800/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold truncate">Ku Shub Taleefankaaga Sida App Rasmi Ah</div>
              <div className="text-[10.5px] text-teal-200/80 truncate">Icon shaashadda, offline shaqaynaya, APK error la'aan!</div>
            </div>
          </div>
          <button
            onClick={onOpenInstallModal || (() => onNavigate('apk_hub'))}
            className="py-1.5 px-3 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shrink-0 transition-colors cursor-pointer"
          >
            Shub Hadda
          </button>
        </div>

        {/* Reels & Ads Discovery Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-md border border-teal-700/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30">
              <Film className="w-5 h-5 text-teal-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">Xayeysiisyada & Reels ee Suuqa</span>
                <span className="text-[9px] bg-teal-400 text-slate-950 font-extrabold px-1.5 py-0.2 rounded-full uppercase">Cusub</span>
              </div>
              <div className="text-[11px] text-teal-200/90 truncate mt-0.5">
                Daawo fiidiyowyada alaabta ee la xaqiijiyay, toosna ula xiriir dukaamada!
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('ads_feed')}
            className="py-1.5 px-3 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs shrink-0 transition-colors cursor-pointer shadow flex items-center gap-1"
          >
            <span>Daawo Reels</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Promotional Hero Card */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm">
          <img
            src="/src/assets/images/suuqa_hero_banner_1792576927742.jpg"
            alt="Suuqa Hero"
            className="w-full h-36 sm:h-44 object-cover opacity-80 hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent flex flex-col justify-end p-4">
            <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Dalbo maanta, ku hel 24 saac gudahood
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Dukaamada Weyn & Kuwa Yaryar ee Soomaaliyeed
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Gudaha u gal dukaanka aad rabto, follow dheh, oo toos ugala hadal Live Chat!
            </p>
          </div>
        </div>

        {/* Featured Store Profiles Scroller (Customer can enter store directly) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <StoreIcon className="w-3.5 h-3.5 text-teal-700" />
              Dukaamada (Guji si aad gudaha ugu gasho):
            </h3>
            <span className="text-[11px] text-teal-700 font-medium">
              {stores.length} Dukaan
            </span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {stores.map((st) => {
              const isFollowed = followedStores.includes(st.id);
              return (
                <div
                  key={st.id}
                  className="p-3 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-400 hover:shadow-md transition-all shrink-0 w-52 flex flex-col justify-between"
                >
                  <div
                    onClick={() => onOpenStoreProfile(st)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      {st.logoUrl ? (
                        <img
                          src={st.logoUrl}
                          alt={st.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-xs">
                          {st.avatar || st.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      {st.storeType === 'large' ? (
                        <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-semibold">
                          Dukaan Weyn
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                          Dukaan Yar
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {st.name}
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                        {st.storeCode}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {st.city} · {st.category}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {st.followersCount + (isFollowed ? 1 : 0)} Macmiil
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleFollow(st.id)}
                      className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                        isFollowed
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800'
                      }`}
                    >
                      {isFollowed ? (
                        <>
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          <span>Followed</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onOpenStoreQr(st)}
                      className="p-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors cursor-pointer"
                      title="Fiiri QR Code-ka dukaanka"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onOpenStoreProfile(st)}
                      className="py-1 px-2.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-[11px] font-semibold cursor-pointer"
                    >
                      Gal
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">
              Alaabta La Xushay ({filteredProducts.length})
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Qiimaha: {currency.replace('_', ' ')}
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
              <p className="text-sm">Wax alaab ah lama helin qaybtaan.</p>
              <button
                onClick={() => {
                  setSelectedCategory('Dhammaan');
                  setSelectedStoreId(null);
                  setSearchQuery('');
                }}
                className="mt-2 text-xs text-teal-700 font-semibold underline cursor-pointer"
              >
                Dib u celi miirayaasha (Reset filters)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map((product) => {
                const prodStore = getStoreForProduct(product);
                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div
                      onClick={() => setSelectedProduct(product)}
                      className="cursor-pointer"
                    >
                      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.nameSomali}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.originalPriceUsd && (
                          <div className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            SALE
                          </div>
                        )}
                        {product.videoUrl && (
                          <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                            <Video className="w-3 h-3 text-teal-300" />
                            <span>Muuqaal</span>
                          </div>
                        )}
                      </div>

                      <div className="p-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenStoreProfile(prodStore);
                          }}
                          className="text-[11px] text-teal-700 font-semibold truncate block hover:underline text-left cursor-pointer"
                        >
                          {product.storeName}
                        </button>
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1 mt-0.5">
                          {product.nameSomali}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {product.name}
                        </p>

                        <div className="mt-2 flex items-baseline gap-1.5">
                          <span className="text-sm font-bold text-slate-900 tabular-nums">
                            {formatPrice(product.priceUsd, currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dual Action: Ku Dar & Dalbo + In-App Live Chat */}
                    <div className="p-3 pt-0 flex gap-1.5">
                      <button
                        onClick={() => onAddToCart(product)}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ku Dar & Dalbo</span>
                      </button>
                      <button
                        onClick={() => onOpenChat(prodStore, product)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 transition-colors cursor-pointer"
                        title="La Hadal Dukaanka (Chat toos ah)"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            <div className="relative aspect-[4/3] bg-black overflow-hidden">
              {selectedProduct.videoUrl ? (
                <video
                  src={selectedProduct.videoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.nameSomali}
                  className="w-full h-full object-cover"
                />
              )}
              {selectedProduct.videoUrl && (
                <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs text-teal-300 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                  <Video className="w-3 h-3 text-teal-300" />
                  <span>Muuqaalka Rasmiga ah</span>
                </div>
              )}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <button
                    onClick={() => {
                      const st = getStoreForProduct(selectedProduct);
                      setSelectedProduct(null);
                      onOpenStoreProfile(st);
                    }}
                    className="font-bold text-teal-700 hover:underline cursor-pointer"
                  >
                    {selectedProduct.storeName} (Gal Dukaanka)
                  </button>
                  <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                    Kaydka: {selectedProduct.stock} xabo
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {selectedProduct.nameSomali}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedProduct.name}
                </p>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-teal-800 tabular-nums">
                    {formatPrice(selectedProduct.priceUsd, currency)}
                  </span>
                </div>

                <div className="my-4 pt-3 border-t border-slate-100 space-y-2">
                  <h5 className="text-xs font-semibold text-slate-800">
                    Faahfaahinta Alaabta (Description):
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedProduct.descriptionSomali}
                  </p>
                </div>
              </div>

              {/* In-App Live Chat Button + Ku Dar & Dalbo */}
              <div className="pt-4 flex gap-2">
                <button
                  onClick={() => {
                    const st = getStoreForProduct(selectedProduct);
                    onOpenChat(st, selectedProduct);
                  }}
                  className="px-4 py-3 rounded-xl border border-teal-300 text-teal-800 bg-teal-50 hover:bg-teal-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-teal-700" />
                  <span>Chat Dukaanka</span>
                </button>

                <button
                  onClick={() => {
                    onAddToCart(selectedProduct);
                    setSelectedProduct(null);
                    setIsCartOpen(true);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Ku Dar & Dalbo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="bg-white w-full sm:max-w-md h-full flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-base text-slate-900">
                  Gaarigaaga wax iibsiga ({totalCartCount})
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
                  <ShoppingCart className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">
                    Gaarigaagu wuu madhan yahay
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.nameSomali}
                      className="w-16 h-16 rounded-lg object-cover bg-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {item.product.nameSomali}
                      </h4>
                      <span className="text-[11px] text-teal-700 block">
                        {item.product.storeName}
                      </span>
                      <div className="text-xs font-bold text-slate-800 mt-1 tabular-nums">
                        {formatPrice(item.product.priceUsd * item.quantity, currency)}
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onUpdateCartQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold px-2">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateCartQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-white space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Isugeynta (Total):</span>
                  <span className="text-lg font-bold text-teal-800 tabular-nums">
                    {formatPrice(cartSubtotalUsd, currency)}
                  </span>
                </div>

                <button
                  onClick={handleStartCheckout}
                  className="w-full py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Gudub Lacag-Bixinta (Checkout)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real Somali Checkout & Payment Modal */}
      {isCheckingOut && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-teal-700" />
                  <span>
                    {checkoutStep === 1
                      ? 'Xaqiijinta Dalabka & Gaarsiinta'
                      : 'Bixi Lacagta & Geli TxID-ga Caddaynta'}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Dukaanka: <b>{currentCartStore.name}</b> ({currentCartStore.storeCode})
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCheckingOut(false);
                  setCheckoutStep(1);
                  setFormError(null);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 my-3">
              <div
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  checkoutStep >= 1 ? 'bg-teal-700' : 'bg-slate-200'
                }`}
              />
              <div
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  checkoutStep >= 2 ? 'bg-teal-700' : 'bg-slate-200'
                }`}
              />
            </div>

            {formError && (
              <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* STEP 1: Customer Details & Method Selection */}
            {checkoutStep === 1 && (
              <form onSubmit={handleStep1Proceed} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Magacaaga Buuxa (Full Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Tusaale: Maxamed Cali Cilmi"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-teal-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Telefoonkaaga (EVC / Zaad / Sahal)
                    </label>
                    <input
                      type="text"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+252 61 ..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-teal-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Magaalada (City)
                    </label>
                    <select
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-teal-600 focus:outline-none bg-white"
                    >
                      {SOMALI_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cinwaanka Gaarsiinta (Xaafadda & Laamiga)
                  </label>
                  <input
                    type="text"
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Tusaale: Degmada Hodan, Laamiga Wadnaha"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-teal-600 focus:outline-none"
                  />
                </div>

                {/* If Store Has API Gateway, offer Gateway vs Manual Mode */}
                {currentCartStore.paymentConfig?.mode === 'api_gateway' && (
                  <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        Dukaankani wuxuu leeyahay API Gateway Toos ah
                      </span>
                      <span className="text-[10px] bg-teal-200/80 text-teal-900 font-bold px-2 py-0.5 rounded-full uppercase">
                        {currentCartStore.paymentConfig.gatewayProvider || 'Waafi API'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setCheckoutMode('api_gateway')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          checkoutMode === 'api_gateway'
                            ? 'bg-white border-teal-700 shadow-sm font-bold text-teal-900 ring-2 ring-teal-600/20'
                            : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                      >
                        <p className="font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>Toos ugu Bixi API</span>
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Hubin degdeg ah oo toos ah
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCheckoutMode('manual_mobile')}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          checkoutMode === 'manual_mobile'
                            ? 'bg-white border-teal-700 shadow-sm font-bold text-teal-900 ring-2 ring-teal-600/20'
                            : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                      >
                        <p className="font-bold flex items-center gap-1">
                          <Phone className="w-3 h-3 text-teal-700" />
                          <span>Mobile Money & TxID</span>
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          EVC, Zaad, eDahab nambarada
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment Methods Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Dooro Qaabka Lacag-Bixinta:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label
                      className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                        paymentMethod === 'evc_plus'
                          ? 'border-teal-700 bg-teal-50/60 text-teal-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'evc_plus'}
                        onChange={() => setPaymentMethod('evc_plus')}
                      />
                      <span>EVC Plus (Hormuud)</span>
                    </label>

                    <label
                      className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                        paymentMethod === 'zaad'
                          ? 'border-teal-700 bg-teal-50/60 text-teal-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'zaad'}
                        onChange={() => setPaymentMethod('zaad')}
                      />
                      <span>Zaad (Telesom)</span>
                    </label>

                    <label
                      className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                        paymentMethod === 'edahab'
                          ? 'border-teal-700 bg-teal-50/60 text-teal-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'edahab'}
                        onChange={() => setPaymentMethod('edahab')}
                      />
                      <span>eDahab (Somtel)</span>
                    </label>

                    <label
                      className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                        paymentMethod === 'sahal'
                          ? 'border-teal-700 bg-teal-50/60 text-teal-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'sahal'}
                        onChange={() => setPaymentMethod('sahal')}
                      />
                      <span>Sahal (Golis)</span>
                    </label>

                    <label
                      className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors col-span-2 ${
                        paymentMethod === 'cash'
                          ? 'border-teal-700 bg-teal-50/60 text-teal-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                      />
                      <span>Kaash Markaad Hesho (Pay On Delivery)</span>
                    </label>
                  </div>
                </div>

                {/* Subtotal preview */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-600">Isu-geynta Lacagta:</span>
                  <div className="text-right">
                    <span className="font-extrabold text-teal-800 text-sm block">
                      ${cartSubtotalUsd.toFixed(2)} USD
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      ({formatPrice(cartSubtotalUsd, currency)})
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {paymentMethod === 'cash' ? (
                    <>
                      <span>Dhammeystir Dalabka (Kaash)</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Gudub Tallaabada 2: Bixi & Dir TxID</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: Real Somali Payment Instructions & TxID Submission */}
            {checkoutStep === 2 && (
              <div className="space-y-4">
                {checkoutMode === 'api_gateway' && currentCartStore.paymentConfig?.mode === 'api_gateway' ? (
                  /* Option A: Automated API Gateway Instant Checkout */
                  <div className="space-y-4">
                    <div className="p-4 bg-teal-900 text-white rounded-2xl shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wider text-teal-300 font-mono font-bold flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                          Toos ugu Bixi API Gateway
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Live Endpoint
                        </span>
                      </div>
                      <p className="text-xs text-teal-100 mt-2 leading-relaxed">
                        Dukaankan wuxuu ku xiran yahay <b>{currentCartStore.paymentConfig.gatewayProvider?.toUpperCase() || 'WAAFI'} PAYMENT API</b>.
                        Lacagtu waxay si toos ah uga go'i doontaa akoonkaaga iyadoo aan loo baahnayn hubin gacanta ah.
                      </p>

                      <div className="mt-3 p-2.5 bg-teal-950/80 rounded-xl border border-teal-800 text-[11px] font-mono space-y-1">
                        <div className="flex justify-between">
                          <span className="text-teal-400">Gateway Provider:</span>
                          <span className="text-white font-bold">
                            {currentCartStore.paymentConfig.gatewayProvider || 'Waafi API'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-teal-400">Merchant ID:</span>
                          <span className="text-white">
                            {currentCartStore.paymentConfig.merchantId || 'MRCH-SOM-8821'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-teal-400">Endpoint:</span>
                          <span className="text-teal-300 truncate max-w-[200px]">
                            {currentCartStore.paymentConfig.apiGatewayUrl || 'https://api.waafi.com/v1/checkout'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                      <span className="text-slate-600">Wadarta laga jarayo:</span>
                      <span className="font-bold text-teal-800 text-base tabular-nums">
                        ${cartSubtotalUsd.toFixed(2)} USD ({formatPrice(cartSubtotalUsd, currency)})
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={handlePayViaApiGateway}
                        disabled={isApiLoading}
                        className="w-full py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                      >
                        {isApiLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Xiriirinta Gateway-ga API...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span>Bixi Hadda Toos API (${cartSubtotalUsd.toFixed(2)})</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setCheckoutMode('manual_mobile')}
                        className="py-2 text-xs text-slate-500 hover:text-slate-800 font-medium text-center cursor-pointer"
                      >
                        Ama ku wareeji Taleefanka gacanta (Mobile Money & TxID)
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Option B: Real Somali Mobile Money Transfer + TxID Submission */
                  <form onSubmit={handleFinalizeWithTxId} className="space-y-4">
                    {/* Recipient Details Card */}
                    {(() => {
                      const cfg = currentCartStore.paymentConfig;
                      let phoneTarget = currentCartStore.phone;
                      let ussdPrefix = '*712*';

                      if (paymentMethod === 'evc_plus') {
                        phoneTarget = cfg?.evcNumber || currentCartStore.phone;
                        ussdPrefix = '*712*';
                      } else if (paymentMethod === 'zaad') {
                        phoneTarget = cfg?.zaadNumber || currentCartStore.phone;
                        ussdPrefix = '*880*';
                      } else if (paymentMethod === 'edahab') {
                        phoneTarget = cfg?.edahabNumber || currentCartStore.phone;
                        ussdPrefix = '*712*';
                      } else if (paymentMethod === 'sahal') {
                        phoneTarget = cfg?.sahalNumber || currentCartStore.phone;
                        ussdPrefix = '*808*';
                      }

                      const cleanPhone = phoneTarget.replace(/[^0-9]/g, '');
                      const ussdCode = `${ussdPrefix}${cleanPhone}*${Math.round(cartSubtotalUsd)}#`;

                      return (
                        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
                              Tallaabada 1: Dir Lacagta Taleefankaaga
                            </span>
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                              {paymentMethod.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
                              <span className="text-[10px] text-slate-400 block mb-0.5">
                                Nambarka Dukaanka ee Lacagta:
                              </span>
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-white text-sm">
                                  {phoneTarget}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(phoneTarget, 'phone')}
                                  className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer"
                                  title="Nuqul Numberka"
                                >
                                  {copiedKey === 'phone' ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {cfg?.merchantTillNumber && (
                              <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
                                <span className="text-[10px] text-slate-400 block mb-0.5">
                                  Till / Merchant Number:
                                </span>
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-bold text-teal-300 text-sm">
                                    {cfg.merchantTillNumber}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(cfg.merchantTillNumber || '', 'till')}
                                    className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 cursor-pointer"
                                  >
                                    {copiedKey === 'till' ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* USSD Quick Dial Code */}
                          <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700 flex items-center justify-between gap-2 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 block">
                                USSD Quick Dial (Toos u wac):
                              </span>
                              <span className="font-mono text-teal-300 text-xs font-bold">
                                {ussdCode}
                              </span>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCopy(ussdCode, 'ussd')}
                                className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-[10px] text-slate-200 cursor-pointer flex items-center gap-1"
                              >
                                {copiedKey === 'ussd' ? 'Waa la guuriyay' : 'Nuqul'}
                              </button>
                              <a
                                href={`tel:${encodeURIComponent(ussdCode)}`}
                                className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-[10px] font-bold text-white flex items-center gap-1 cursor-pointer"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Wac</span>
                              </a>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-400 leading-tight">
                            Wadarta: <b className="text-white">${cartSubtotalUsd.toFixed(2)} USD</b> ({formatPrice(cartSubtotalUsd, currency)})
                          </div>
                        </div>
                      );
                    })()}

                    {/* Step 2 Input: Transaction ID & Proof */}
                    <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                      <div>
                        <span className="text-xs font-bold text-amber-900 block mb-1">
                          Tallaabada 2: Geli Caddaynta Lacag-bixinta (TxID)
                        </span>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          Markaad lacagta dirto, taleefankaaga waxaa ku soo dhacaya SMS leh <b>Transaction ID</b>. Fadlan halkan ku qor si khasnajigu u xaqiijiyo.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          Aqoonsiga Lacag-bixinta (Transaction ID / TxID) *
                        </label>
                        <input
                          type="text"
                          required
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="Tusaale: GW981240192 ama ZD-772910"
                          className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-amber-300 rounded-xl text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          Waa lambarka tixraaca ee ku dhex jira fariinta SMS-ka
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Fariinta SMS-ka ee Xaqiijinta (Dheji SMS-ka oo buuxa - Ikhtiyaari):
                        </label>
                        <textarea
                          rows={2}
                          value={paymentProofText}
                          onChange={(e) => setPaymentProofText(e.target.value)}
                          placeholder="Tusaale: Waxaad $125 u dirtay Hodan Boutique... TxID: GW981240192..."
                          className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-teal-600"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep(1)}
                        className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Dib u noqo
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Gudbi Dalabka & Hubinta TxID</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upgraded Order Completed / Verification Notice Modal */}
      {orderCompleted && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${
                orderCompleted.status === 'awaiting_verification'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {orderCompleted.status === 'awaiting_verification' ? (
                <ShieldCheck className="w-8 h-8" />
              ) : (
                <CheckCircle2 className="w-8 h-8" />
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {orderCompleted.status === 'awaiting_verification'
                ? 'Dalabkaagii Waa La Gudbiyay!'
                : 'Dalabkaagu Wuu Guuleystay!'}
            </h3>

            {/* Status Badge */}
            <div className="my-2">
              <span
                className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block ${
                  orderCompleted.status === 'awaiting_verification'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                {orderCompleted.status === 'awaiting_verification'
                  ? '⏳ Sugaya Hubinta Khasnajiga (TxID)'
                  : '✓ Lacagta Waa La Xaqiijiyay'}
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-1">
              Lambarka Dalabka: <b>{orderCompleted.orderNumber}</b>
            </p>

            {orderCompleted.transactionId && (
              <div className="mt-2 p-2 bg-slate-100 rounded-lg text-xs font-mono text-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-sans">TxID:</span>
                <span className="font-bold text-teal-800">{orderCompleted.transactionId}</span>
              </div>
            )}

            <div className="my-3 p-3 bg-slate-50 rounded-xl text-left text-xs space-y-1.5 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Macaamiilka:</span>
                <span className="font-medium text-slate-800">
                  {orderCompleted.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dukaanka:</span>
                <span className="font-medium text-slate-800">
                  {currentCartStore.name} ({currentCartStore.storeCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Wadarta:</span>
                <span className="font-bold text-teal-800 tabular-nums">
                  {formatPrice(orderCompleted.totalUsd, currency)}
                </span>
              </div>
            </div>

            {orderCompleted.status === 'awaiting_verification' && (
              <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-left leading-relaxed mb-3">
                ℹ️ <b>Wargelin:</b> Shaqaalaha dukaanka (Khasnajiga) ayaa hadda hubinaya lacag-bixintaada adigoo isticmaalaya TxID-gaaga. Isla marka la xaqiijiyo, waxaa bilaabanaya diyaarinta iyo gaarsiinta dalabkaaga.
              </p>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setOrderCompleted(null)}
                className="w-full py-2.5 rounded-xl bg-teal-800 text-white text-xs font-semibold hover:bg-teal-700 cursor-pointer"
              >
                Ku Noqo Suuqa
              </button>
              <button
                onClick={() => {
                  setOrderCompleted(null);
                  setIsOrdersModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                La Soco Xaaladda Dalabka (Track Orders)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Orders & Verification Tracker Modal */}
      {isOrdersModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-teal-800" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Dalabaadkayga & Xaaladda TxID</h3>
                  <p className="text-[11px] text-slate-500">Kala soco hubinta lacag-bixinta khasnajiga</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOrdersModalOpen(false);
                  setResubmittingOrderId(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification alert */}
            {resubmitSuccessMsg && (
              <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{resubmitSuccessMsg}</span>
              </div>
            )}

            {/* Content List */}
            <div className="p-4 overflow-y-auto space-y-3 divide-y divide-slate-100 flex-1">
              {orders.length === 0 ? (
                <div className="text-center py-10">
                  <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">Wali ma jiro dalab aad samaysay.</p>
                </div>
              ) : (
                orders.map((ord) => {
                  const isAwaiting = ord.status === 'awaiting_verification' || ord.paymentStatus === 'submitted';
                  const isVerified = ord.paymentStatus === 'verified' || ord.status === 'preparing' || ord.status === 'in_transit' || ord.status === 'delivered';
                  const isRejected = ord.paymentStatus === 'rejected' || (ord.status === 'cancelled' && Boolean(ord.verificationRejectionReason));

                  return (
                    <div key={ord.id} className="pt-3 first:pt-0 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{ord.orderNumber}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                              {ord.storeCode || 'DUKAAN'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{ord.createdAt}</p>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isAwaiting && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 animate-spin" /> Sugaya Hubinta Khasnajiga
                            </span>
                          )}
                          {isVerified && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Lacagta Waa La Hubiyay
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                              <XCircle className="w-3 h-3" /> Caddaynta Waa La Diiday
                            </span>
                          )}
                          {!isAwaiting && !isVerified && !isRejected && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {ord.status}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Items & Total */}
                      <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1 border border-slate-100">
                        <div className="flex justify-between text-slate-600">
                          <span>Alaabta ({ord.items.reduce((a, b) => a + b.quantity, 0)} xabbo):</span>
                          <span className="font-semibold text-slate-900">{formatPrice(ord.totalUsd, currency)}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {ord.items.map((i) => `${i.product.nameSomali || i.product.name} (x${i.quantity})`).join(', ')}
                        </div>
                      </div>

                      {/* Transaction ID & Verification Details */}
                      {ord.transactionId && (
                        <div className="flex items-center justify-between p-2 bg-slate-100 rounded-lg text-xs font-mono">
                          <span className="text-[11px] text-slate-500 font-sans">TxID:</span>
                          <span className="font-bold text-teal-900 select-all">{ord.transactionId}</span>
                        </div>
                      )}

                      {/* Verification feedback */}
                      {isAwaiting && (
                        <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-1.5">
                          <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                          <span>Shaqaalaha xisaabaadka dukaanka ayaa hadda eegaya lambarka TxID si ay u waafajiyaan lacagta soo dhacday. Fadlan sug ilbiriqsiyo.</span>
                        </div>
                      )}

                      {isVerified && ord.verifiedByStaffName && (
                        <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-900 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Xaqiijiyay: <b>{ord.verifiedByStaffName}</b></span>
                          </span>
                          {ord.verifiedAt && <span className="text-[10px] text-emerald-700 font-medium">{ord.verifiedAt}</span>}
                        </div>
                      )}

                      {isRejected && (
                        <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-[11px] text-rose-900 space-y-2">
                          <div className="flex items-start gap-1.5">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold">Caddaynta TxID laguma helin xisaabta dukaanka:</p>
                              <p className="text-rose-700 mt-0.5">"{ord.verificationRejectionReason || 'Fadlan hubi lambarka fariinta lacag-bixinta.'}"</p>
                            </div>
                          </div>

                          {/* Inline Resubmit Form */}
                          {resubmittingOrderId === ord.id ? (
                            <div className="bg-white p-2.5 rounded-lg border border-rose-300 space-y-2 mt-2">
                              <p className="font-bold text-slate-800 text-xs">Geli TxID Sax Ah:</p>
                              <input
                                type="text"
                                placeholder="Tusaale: TR-98234710 ama EVC-883491"
                                value={newResubmitTxId}
                                onChange={(e) => setNewResubmitTxId(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono focus:outline-teal-700"
                              />
                              <textarea
                                placeholder="Nuqul ka mid ah fariinta SMS-ka (ikhtiyaari)..."
                                value={newResubmitProof}
                                onChange={(e) => setNewResubmitProof(e.target.value)}
                                rows={2}
                                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-teal-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleDoResubmit(ord.id)}
                                  className="flex-1 py-1.5 bg-teal-800 text-white rounded-lg text-xs font-bold hover:bg-teal-700 cursor-pointer"
                                >
                                  Gudbi Caddaynta Cusub
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setResubmittingOrderId(null)}
                                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-300 cursor-pointer"
                                >
                                  Ka Noqo
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setResubmittingOrderId(ord.id);
                                setNewResubmitTxId(ord.transactionId || '');
                              }}
                              className="w-full py-1.5 bg-rose-600 text-white rounded-lg font-bold text-xs hover:bg-rose-700 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Dib U Sax TxID-ga & Fariinta
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => {
                  setIsOrdersModalOpen(false);
                  setResubmittingOrderId(null);
                }}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-300 cursor-pointer"
              >
                Xir Daaqadda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
