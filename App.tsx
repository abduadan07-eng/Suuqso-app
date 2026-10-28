import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MobileFrame } from './components/simulator/MobileFrame';
import { SplashScreen } from './components/screens/SplashScreen';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { CustomerHomeScreen } from './components/screens/CustomerHomeScreen';
import { StoreLoginScreen } from './components/screens/StoreLoginScreen';
import { StoreDashboardScreen } from './components/screens/StoreDashboardScreen';
import { StaffLoginScreen } from './components/screens/StaffLoginScreen';
import { StaffDashboardScreen } from './components/screens/StaffDashboardScreen';
import { SuperAdminScreen } from './components/screens/SuperAdminScreen';
import { QrGeneratorScreen } from './components/screens/QrGeneratorScreen';
import { AdsFeedScreen } from './components/screens/AdsFeedScreen';
import { ApkExportHub } from './components/apk/ApkExportHub';
import { StoreProfileModal } from './components/store/StoreProfileModal';
import { InAppChatModal } from './components/chat/InAppChatModal';
import { StoreQrModal } from './components/common/StoreQrModal';
import { InstallAppModal } from './components/common/InstallAppModal';
import { CameraQrScannerModal } from './components/common/CameraQrScannerModal';
import { OfflineBanner } from './components/common/OfflineBanner';

import {
  ScreenType,
  Store,
  Product,
  Order,
  CartItem,
  SomaliCurrency,
  OrderStatus,
  ChatMessage,
  Employee,
  StaffSession,
  InternalTeamMessage,
  StorePaymentConfig,
  Advertisement,
} from './types';
import {
  INITIAL_STORES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_TEAM_MESSAGES,
  INITIAL_ADVERTISEMENTS,
} from './data/mockData';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('customer_home');
  const [isMobileView, setIsMobileView] = useState<boolean>(true);
  const [currency, setCurrency] = useState<SomaliCurrency>('EVC_PLUS');

  // App data state (Realtime persistent state backed by localStorage)
  const [stores, setStores] = useState<Store[]>(() => {
    try {
      const saved = localStorage.getItem('suuqa_stores');
      return saved ? JSON.parse(saved) : INITIAL_STORES;
    } catch {
      return INITIAL_STORES;
    }
  });

  const sanitizeVideoUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.includes('mixkit.co') || url.includes('googleapis.com')) {
      return '/assets/videos/somali_ad_sample.mp4';
    }
    return url;
  };

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('suuqa_products');
      const list: Product[] = saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
      return list.map((p) => ({
        ...p,
        videoUrl: sanitizeVideoUrl(p.videoUrl),
      }));
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('suuqa_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>([
    { product: INITIAL_PRODUCTS[0], quantity: 1 },
  ]);
  const [activeStoreId, setActiveStoreId] = useState<string>('store-1');

  // Staff session state
  const [staffSession, setStaffSession] = useState<StaffSession | null>({
    store: INITIAL_STORES[0],
    employee: INITIAL_STORES[0].employees[0],
  });

  // Customer Followed Stores
  const [followedStores, setFollowedStores] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('suuqa_followed');
      return saved ? JSON.parse(saved) : ['store-1'];
    } catch {
      return ['store-1'];
    }
  });

  // Sync state changes to localStorage for production persistence
  React.useEffect(() => {
    try {
      localStorage.setItem('suuqa_stores', JSON.stringify(stores));
    } catch (err) {
      console.warn('Failed to persist stores:', err);
    }
  }, [stores]);

  React.useEffect(() => {
    try {
      localStorage.setItem('suuqa_products', JSON.stringify(products));
    } catch (err) {
      console.warn('Failed to persist products:', err);
    }
  }, [products]);

  React.useEffect(() => {
    try {
      localStorage.setItem('suuqa_orders', JSON.stringify(orders));
    } catch (err) {
      console.warn('Failed to persist orders:', err);
    }
  }, [orders]);

  React.useEffect(() => {
    try {
      localStorage.setItem('suuqa_followed', JSON.stringify(followedStores));
    } catch (err) {
      console.warn('Failed to persist followed stores:', err);
    }
  }, [followedStores]);

  // Advertisements state (Realtime persistent state backed by localStorage)
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(() => {
    try {
      const saved = localStorage.getItem('suuqa_advertisements');
      const list: Advertisement[] = saved ? JSON.parse(saved) : INITIAL_ADVERTISEMENTS;
      return list.map((a) => ({
        ...a,
        videoUrl: sanitizeVideoUrl(a.videoUrl),
      }));
    } catch {
      return INITIAL_ADVERTISEMENTS;
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('suuqa_advertisements', JSON.stringify(advertisements));
    } catch (err) {
      console.warn('Failed to persist advertisements:', err);
    }
  }, [advertisements]);

  // Advertisement handlers
  const handleCreateAdvertisement = (ad: Advertisement) => {
    setAdvertisements((prev) => [ad, ...prev]);
  };

  const handleApproveAdvertisement = (adId: string) => {
    setAdvertisements((prev) =>
      prev.map((ad) =>
        ad.id === adId
          ? { ...ad, status: 'approved', isVerifiedAuthentic: true, rejectionReason: undefined }
          : ad
      )
    );
  };

  const handleRejectAdvertisement = (adId: string, reason: string) => {
    setAdvertisements((prev) =>
      prev.map((ad) =>
        ad.id === adId
          ? { ...ad, status: 'rejected', rejectionReason: reason, isVerifiedAuthentic: false }
          : ad
      )
    );
  };

  const handleDeleteAdvertisement = (adId: string) => {
    setAdvertisements((prev) => prev.filter((ad) => ad.id !== adId));
  };

  // In-App Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [activeChatStore, setActiveChatStore] = useState<Store | null>(null);
  const [activeChatProduct, setActiveChatProduct] = useState<Product | null>(null);

  // Internal Team Chat State
  const [teamMessages, setTeamMessages] = useState<InternalTeamMessage[]>(INITIAL_TEAM_MESSAGES);

  // Store Profile / Preview Modal State
  const [activeStoreProfile, setActiveStoreProfile] = useState<Store | null>(null);
  const [isSuperAdminPreview, setIsSuperAdminPreview] = useState<boolean>(false);

  // QR Code Modal State
  const [storeQrModalStore, setStoreQrModalStore] = useState<Store | null>(null);

  // PWA & Mobile App Installation Modal State
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  React.useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // In-App Camera QR Scanner Modal State
  const [showCameraScanner, setShowCameraScanner] = useState<boolean>(false);

  // Detect QR code scan from real phone camera URL: ?store=... or ?code=...
  React.useEffect(() => {
    try {
      const search = window.location.search;
      if (!search) return;
      const params = new URLSearchParams(search);
      const storeParam = params.get('store');
      const codeParam = params.get('code');

      if (storeParam || codeParam) {
        const found = stores.find(
          (s) =>
            (storeParam && s.id === storeParam) ||
            (codeParam && s.storeCode.toLowerCase() === codeParam.toLowerCase()) ||
            (storeParam && s.storeCode.toLowerCase() === storeParam.toLowerCase())
        );
        if (found) {
          setActiveStoreProfile(found);
          setIsSuperAdminPreview(false);
          setCurrentScreen('customer_home');
        }
      }
    } catch (err) {
      console.error('Error parsing camera QR URL:', err);
    }
  }, [stores]);

  // Navigation handler
  const handleNavigate = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  // Follow / Unfollow Store
  const handleToggleFollow = (storeId: string) => {
    setFollowedStores((prev) => {
      const isAlready = prev.includes(storeId);
      const updated = isAlready ? prev.filter((id) => id !== storeId) : [...prev, storeId];

      // Update store followers count
      setStores((sList) =>
        sList.map((st) =>
          st.id === storeId
            ? { ...st, followersCount: Math.max(0, st.followersCount + (isAlready ? -1 : 1)) }
            : st
        )
      );

      return updated;
    });
  };

  // Customer sends in-app chat message -> directly saved. No AI or bot replies:
  // Macmiilku wuu sugayaa inta shaqaalaha u xilsaaran ama adminka dukaanka uu toos uga soo jawaabayo!
  const handleSendMessage = (storeId: string, text: string, product?: Product | null) => {
    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      storeId,
      sender: 'customer',
      text,
      timestamp: 'Hadda',
      productId: product?.id,
      productName: product?.nameSomali,
    };

    setChatMessages((prev) => [...prev, userMsg]);
  };

  // Staff direct reply in Staff Dashboard
  const handleSendCustomerReply = (storeId: string, text: string, staffName: string) => {
    const replyMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      storeId,
      sender: 'store',
      senderName: staffName,
      text,
      timestamp: 'Hadda',
    };
    setChatMessages((prev) => [...prev, replyMsg]);
  };

  // Team internal messaging handler
  const handleSendTeamMessage = (storeId: string, senderName: string, senderRole: string, text: string) => {
    const newTeamMsg: InternalTeamMessage = {
      id: `team-${Date.now()}`,
      storeId,
      senderName,
      senderRole,
      text,
      timestamp: 'Hadda',
    };
    setTeamMessages((prev) => [...prev, newTeamMsg]);
  };

  // Open Chat Trigger
  const handleOpenChat = (store: Store, product?: Product) => {
    setActiveChatStore(store);
    setActiveChatProduct(product || null);
  };

  // Open Store Profile (Customer View)
  const handleOpenStoreProfile = (store: Store) => {
    setActiveStoreProfile(store);
    setIsSuperAdminPreview(false);
  };

  // Open Store Preview (Super Admin or Staff Inspection Mode)
  const handlePreviewStore = (store: Store) => {
    setActiveStoreProfile(store);
    setIsSuperAdminPreview(true);
  };

  // Open QR Code Modal
  const handleOpenStoreQr = (store: Store) => {
    setStoreQrModalStore(store);
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handlePlaceOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  // Resubmit Payment TxID by customer if rejected or updating
  const handleResubmitOrderPayment = (orderId: string, newTxId: string, newProof?: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              transactionId: newTxId,
              paymentProofText: newProof || o.paymentProofText,
              status: 'awaiting_verification',
              paymentStatus: 'submitted',
              verificationRejectionReason: undefined,
            }
          : o
      )
    );
  };

  // Store Product operations
  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProd.id ? updatedProd : p))
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  // Store Employee operations (for Dukaan Weyn)
  const handleAddEmployee = (storeId: string, employee: Employee) => {
    setStores((prev) =>
      prev.map((s) => {
        if (s.id === storeId) {
          return {
            ...s,
            employees: [...(s.employees || []), employee],
          };
        }
        return s;
      })
    );
  };

  const handleToggleEmployeeStatus = (storeId: string, employeeId: string) => {
    setStores((prev) =>
      prev.map((s) => {
        if (s.id === storeId) {
          return {
            ...s,
            employees: s.employees.map((e) =>
              e.id === employeeId ? { ...e, isActive: !e.isActive } : e
            ),
          };
        }
        return s;
      })
    );
  };

  // Change Store Password
  const handleChangeStorePassword = (storeId: string, newPass: string) => {
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, password: newPass } : s))
    );
  };

  // Upgrade to Dukaan Weyn
  const handleUpgradeToLargeStore = (storeId: string) => {
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, storeType: 'large' } : s))
    );
  };

  // Order status update (Supports: Diyaari -> Dir -> Way Gaartay)
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  // Verify Payment by Cashier / Store Admin
  const handleVerifyOrderPayment = (orderId: string, staffName: string, staffId?: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'preparing',
              paymentStatus: 'verified',
              verifiedByStaffName: staffName,
              verifiedByStaffId: staffId,
              verifiedAt: 'Hadda (Just now)',
            }
          : o
      )
    );
  };

  // Reject Invalid Payment by Cashier / Store Admin
  const handleRejectOrderPayment = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'cancelled',
              paymentStatus: 'rejected',
              verificationRejectionReason: reason,
            }
          : o
      )
    );
  };

  // Update Store Payment Configuration (Mobile numbers or API Gateway)
  const handleUpdateStorePaymentConfig = (storeId: string, paymentConfig: StorePaymentConfig) => {
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, paymentConfig } : s))
    );
  };

  // Super Admin operations
  const handleCreateStore = (newStore: Store) => {
    setStores((prev) => [newStore, ...prev]);
  };

  const handleUpdateStore = (updatedStore: Store) => {
    setStores((prev) =>
      prev.map((s) => (s.id === updatedStore.id ? updatedStore : s))
    );
  };

  const handleUpdateStoreLogo = (storeId: string, logoUrl: string) => {
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, logoUrl } : s))
    );
  };

  const handleApproveStore = (storeId: string, operatingDays: number, customCode?: string) => {
    setStores((prev) =>
      prev.map((s) =>
        s.id === storeId
          ? {
              ...s,
              isPendingApproval: false,
              isVerified: true,
              operatingDays,
              ...(customCode ? { storeCode: customCode } : {}),
            }
          : s
      )
    );
  };

  const handleToggleStoreVerification = (storeId: string) => {
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, isVerified: !s.isVerified } : s))
    );
  };

  // Registration of new merchant
  const handleRegisterStore = (newStore: Store) => {
    setStores((prev) => [newStore, ...prev]);
  };

  const currentActiveStore =
    stores.find((s) => s.id === activeStoreId) || stores[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      {/* Universal Top Bar */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        onOpenInstallModal={() => setShowInstallModal(true)}
        onOpenCameraScanner={() => setShowCameraScanner(true)}
      />

      {/* Offline Status Alert Banner */}
      <OfflineBanner />

      {/* Simulator Frame (handles phone vs desktop view and quick screen switching) */}
      <MobileFrame
        isMobileView={isMobileView}
        onToggleMobileView={() => setIsMobileView(!isMobileView)}
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
      >
        {currentScreen === 'splash' && (
          <SplashScreen onProceed={() => setCurrentScreen('welcome')} />
        )}

        {currentScreen === 'welcome' && (
          <WelcomeScreen onNavigate={handleNavigate} />
        )}

        {currentScreen === 'customer_home' && (
          <CustomerHomeScreen
            products={products}
            stores={stores.filter((s) => !s.isPendingApproval)}
            cart={cart}
            currency={currency}
            followedStores={followedStores}
            onToggleFollow={handleToggleFollow}
            onSetCurrency={setCurrency}
            onAddToCart={handleAddToCart}
            onUpdateCartQuantity={handleUpdateCartQuantity}
            onClearCart={handleClearCart}
            onPlaceOrder={handlePlaceOrder}
            onOpenStoreProfile={handleOpenStoreProfile}
            onOpenChat={handleOpenChat}
            onOpenStoreQr={handleOpenStoreQr}
            onOpenInstallModal={() => setShowInstallModal(true)}
            onOpenCameraScanner={() => setShowCameraScanner(true)}
            onNavigate={handleNavigate}
            orders={orders}
            onResubmitPayment={handleResubmitOrderPayment}
          />
        )}

        {currentScreen === 'store_login' && (
          <StoreLoginScreen
            stores={stores}
            onLoginSuccess={(sId) => setActiveStoreId(sId)}
            onStaffLoginSuccess={(sess) => {
              setStaffSession(sess);
              setCurrentScreen('staff_dashboard');
            }}
            onRegisterStore={handleRegisterStore}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'staff_login' && (
          <StaffLoginScreen
            stores={stores}
            onStaffLoginSuccess={(sess) => {
              setStaffSession(sess);
              setCurrentScreen('staff_dashboard');
            }}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'staff_dashboard' && (
          staffSession ? (
            <StaffDashboardScreen
              session={staffSession}
              orders={orders}
              products={products}
              customerChatMessages={chatMessages}
              teamMessages={teamMessages}
              currency={currency}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onVerifyOrderPayment={handleVerifyOrderPayment}
              onRejectOrderPayment={handleRejectOrderPayment}
              onSendCustomerReply={handleSendCustomerReply}
              onSendTeamMessage={handleSendTeamMessage}
              onPreviewStore={handlePreviewStore}
              onLogout={() => {
                setStaffSession(null);
                setCurrentScreen('staff_login');
              }}
            />
          ) : (
            <StaffLoginScreen
              stores={stores}
              onStaffLoginSuccess={(sess) => {
                setStaffSession(sess);
                setCurrentScreen('staff_dashboard');
              }}
              onNavigate={handleNavigate}
            />
          )
        )}

        {currentScreen === 'store_dashboard' && (
          <StoreDashboardScreen
            currentStore={currentActiveStore}
            products={products}
            orders={orders}
            teamMessages={teamMessages}
            customerChatMessages={chatMessages}
            currency={currency}
            advertisements={advertisements}
            onCreateAdvertisement={handleCreateAdvertisement}
            onDeleteAdvertisement={handleDeleteAdvertisement}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddEmployee={handleAddEmployee}
            onToggleEmployeeStatus={handleToggleEmployeeStatus}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onVerifyOrderPayment={handleVerifyOrderPayment}
            onRejectOrderPayment={handleRejectOrderPayment}
            onUpdateStorePaymentConfig={handleUpdateStorePaymentConfig}
            onChangeStorePassword={handleChangeStorePassword}
            onUpgradeToLargeStore={handleUpgradeToLargeStore}
            onSendTeamMessage={handleSendTeamMessage}
            onSendCustomerReply={handleSendCustomerReply}
            onOpenStoreQr={handleOpenStoreQr}
            onUpdateStore={handleUpdateStore}
            onUpdateStoreLogo={handleUpdateStoreLogo}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'super_admin' && (
          <SuperAdminScreen
            stores={stores}
            currency={currency}
            advertisements={advertisements}
            onApproveAdvertisement={handleApproveAdvertisement}
            onRejectAdvertisement={handleRejectAdvertisement}
            onDeleteAdvertisement={handleDeleteAdvertisement}
            onCreateStore={handleCreateStore}
            onUpdateStore={handleUpdateStore}
            onApproveStore={handleApproveStore}
            onToggleStoreVerification={handleToggleStoreVerification}
            onPreviewStore={handlePreviewStore}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'ads_feed' && (
          <AdsFeedScreen
            advertisements={advertisements}
            stores={stores}
            currency={currency}
            onOpenStoreProfile={handleOpenStoreProfile}
            onOpenChat={handleOpenChat}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'qr_generator' && (
          <QrGeneratorScreen
            stores={stores}
            onOpenStoreProfile={handleOpenStoreProfile}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'apk_hub' && <ApkExportHub />}
      </MobileFrame>

      {/* In-App Live Chat Modal */}
      {activeChatStore && (
        <InAppChatModal
          store={activeChatStore}
          product={activeChatProduct}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onClose={() => {
            setActiveChatStore(null);
            setActiveChatProduct(null);
          }}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Store Profile & Follow Modal (Customer View & Super Admin / Staff Inspection Mode) */}
      {activeStoreProfile && (
        <StoreProfileModal
          store={activeStoreProfile}
          products={products}
          currency={currency}
          isSuperAdminPreview={isSuperAdminPreview}
          isFollowed={followedStores.includes(activeStoreProfile.id)}
          onToggleFollow={handleToggleFollow}
          onOpenChat={handleOpenChat}
          onOpenQr={handleOpenStoreQr}
          onLoginToStore={(st) => {
            setActiveStoreId(st.id);
            setCurrentScreen('store_login');
          }}
          onAddToCart={handleAddToCart}
          onSelectProduct={(p) => {
            handleAddToCart(p);
          }}
          onClose={() => {
            setActiveStoreProfile(null);
            setIsSuperAdminPreview(false);
          }}
        />
      )}

      {/* Store System QR Code Modal */}
      {storeQrModalStore && (
        <StoreQrModal
          store={storeQrModalStore}
          onClose={() => setStoreQrModalStore(null)}
          onEnterStore={(st) => {
            handleOpenStoreProfile(st);
          }}
          onLoginAsOwner={(st) => {
            setActiveStoreId(st.id);
            setCurrentScreen('store_login');
          }}
          onOpenCameraScanner={() => setShowCameraScanner(true)}
        />
      )}

      {/* PWA & Real APK Mobile Installation Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        deferredPrompt={deferredPrompt}
      />

      {/* In-App Camera QR Code Scanner */}
      <CameraQrScannerModal
        isOpen={showCameraScanner}
        stores={stores}
        onClose={() => setShowCameraScanner(false)}
        onStoreSelected={(st) => {
          setActiveStoreProfile(st);
          setIsSuperAdminPreview(false);
          setCurrentScreen('customer_home');
        }}
      />
    </div>
  );
}
