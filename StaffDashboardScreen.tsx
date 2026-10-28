import React, { useState } from 'react';
import {
  Truck,
  MessageSquare,
  Package,
  Eye,
  LogOut,
  Send,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Check,
  Building,
  User,
  ShieldCheck,
  Users,
  Copy,
  AlertCircle,
  X,
  CreditCard,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import {
  StaffSession,
  Order,
  OrderStatus,
  ChatMessage,
  InternalTeamMessage,
  Product,
  SomaliCurrency,
  ScreenType,
} from '../../types';
import { formatPrice } from '../../data/mockData';

interface StaffDashboardScreenProps {
  session: StaffSession;
  orders: Order[];
  products: Product[];
  customerChatMessages: ChatMessage[];
  teamMessages: InternalTeamMessage[];
  currency: SomaliCurrency;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onVerifyOrderPayment?: (orderId: string, staffName: string, staffId?: string) => void;
  onRejectOrderPayment?: (orderId: string, reason: string) => void;
  onSendCustomerReply: (storeId: string, text: string, staffName: string) => void;
  onSendTeamMessage: (storeId: string, senderName: string, senderRole: string, text: string) => void;
  onPreviewStore: (store: StaffSession['store']) => void;
  onLogout: () => void;
}

export const StaffDashboardScreen: React.FC<StaffDashboardScreenProps> = ({
  session,
  orders,
  products,
  customerChatMessages,
  teamMessages,
  currency,
  onUpdateOrderStatus,
  onVerifyOrderPayment,
  onRejectOrderPayment,
  onSendCustomerReply,
  onSendTeamMessage,
  onPreviewStore,
  onLogout,
}) => {
  const { store, employee } = session;
  const [activeTab, setActiveTab] = useState<'my_tasks' | 'team_chat'>('my_tasks');

  // Customer chat reply input (for customer_service role)
  const [chatReplyText, setChatReplyText] = useState('');

  // Internal team chat input
  const [teamInputText, setTeamInputText] = useState('');

  // Cashier state
  const [cashierFilter, setCashierFilter] = useState<'awaiting' | 'verified' | 'all'>('awaiting');
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('TxID lagama helin xisaabta dukaanka / Lacagtu may soo dhicin.');

  const storeOrders = orders.filter(
    (o) => o.storeId === store.id || o.storeCode === store.storeCode
  );
  const storeCustomerMessages = customerChatMessages.filter(
    (m) => m.storeId === store.id
  );
  const storeTeamMessages = teamMessages.filter((m) => m.storeId === store.id);

  const handleSendTeamMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamInputText.trim()) return;
    onSendTeamMessage(store.id, employee.name, employee.roleTitle, teamInputText.trim());
    setTeamInputText('');
  };

  const handleSendCustomerChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatReplyText.trim()) return;
    onSendCustomerReply(store.id, chatReplyText.trim(), `${employee.name} (${employee.roleTitle})`);
    setChatReplyText('');
  };

  return (
    <div className="min-h-full pb-20 bg-slate-50 text-slate-900 select-none">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-sm">
              {employee.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900">
                  {employee.name}
                </span>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  {employee.roleTitle}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block">
                {store.name} ({store.storeCode}) · ID: {employee.employeeCode}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Preview Button for Staff (Read-Only Inspection) */}
            <button
              onClick={() => onPreviewStore(store)}
              className="py-1.5 px-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Kormeer dukaanka sida macmiilku u arko"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Dukaan</span>
            </button>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Ka bax"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-4 mt-3 text-xs font-semibold border-b border-slate-100">
          <button
            onClick={() => setActiveTab('my_tasks')}
            className={`pb-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'my_tasks'
                ? 'border-teal-700 text-teal-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Howshayda ({employee.roleTitle})
          </button>
          <button
            onClick={() => setActiveTab('team_chat')}
            className={`pb-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'team_chat'
                ? 'border-teal-700 text-teal-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Wada-hadalka Kooxda ({storeTeamMessages.length})
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {activeTab === 'my_tasks' && (
          <div className="space-y-4">
            {/* Assigned task summary banner */}
            <div className="bg-teal-900 text-white p-4 rounded-2xl shadow-sm">
              <span className="text-[10px] text-teal-300 uppercase tracking-widest font-mono font-bold block mb-1">
                Hawsha laguu xilsaaray:
              </span>
              <p className="text-xs text-teal-100 leading-relaxed font-medium">
                {employee.assignedTasks}
              </p>
            </div>

            {/* 1. ROLE: DIRAHA GAARSIINTA (DELIVERY RIDER WORKFLOW: Diyaari -> Dir -> Way Gaartay) */}
            {employee.role === 'delivery' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-teal-700" />
                    Dalabaadka Gaarsiinta ee Dukaanka ({storeOrders.length})
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Maamul: <b>Diyaari ➔ Dir ➔ Way Gaartay</b>
                  </span>
                </div>

                {storeOrders.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                    Weli dalab gaarsiin ah laguma soo dirin.
                  </div>
                ) : (
                  storeOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm"
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
                            ord.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'in_transit'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.status === 'delivered'
                            ? '✓ Way Gaartay'
                            : ord.status === 'in_transit'
                            ? 'Waddada Ku Jira'
                            : 'Diyaarinta'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {ord.customerName}
                          </p>
                          <a
                            href={`tel:${ord.customerPhone}`}
                            className="text-teal-700 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{ord.customerPhone}</span>
                          </a>
                        </div>
                        <div>
                          <p className="flex items-center gap-1 text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>
                              {ord.customerCity} · {ord.customerAddress}
                            </span>
                          </p>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">
                            Bixinta: <b>{ord.paymentMethod.toUpperCase()}</b> · Wadarta: <b>{formatPrice(ord.totalUsd, currency)}</b>
                          </span>
                        </div>
                      </div>

                      {/* Delivery Rider 3-Step Controls: Diyaari, Dir, Way Gaartay */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 font-medium">
                          U beddel xaaladda gaarsiinta:
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onUpdateOrderStatus(ord.id, 'preparing')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              ord.status === 'preparing'
                                ? 'bg-amber-500 text-white shadow'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            1. Diyaari
                          </button>
                          <button
                            onClick={() => onUpdateOrderStatus(ord.id, 'in_transit')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              ord.status === 'in_transit'
                                ? 'bg-sky-600 text-white shadow'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            2. Dir (Waddada)
                          </button>
                          <button
                            onClick={() => onUpdateOrderStatus(ord.id, 'delivered')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              ord.status === 'delivered'
                                ? 'bg-emerald-600 text-white shadow'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            3. Way Gaartay
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 2. ROLE: ADEEGGA MACMIILKA & CHAT */}
            {employee.role === 'customer_service' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-teal-700" />
                    Fariimaha Tooska ah ee Macaamiisha ({storeCustomerMessages.length})
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Waxaad toos ugu jawaabaysaa macaamiisha dukaanka
                  </span>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 min-h-[300px] flex flex-col justify-between shadow-sm">
                  <div className="space-y-2.5 overflow-y-auto max-h-[350px] pr-1">
                    {storeCustomerMessages.map((msg) => {
                      const isCustomer = msg.sender === 'customer';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            isCustomer ? 'items-start' : 'items-end'
                          }`}
                        >
                          <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-semibold">
                            {isCustomer ? 'Macmiil' : msg.senderName || employee.name}
                          </span>
                          <div
                            className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                              isCustomer
                                ? 'bg-slate-100 text-slate-900 rounded-bl-none'
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
                    })}
                  </div>

                  <form onSubmit={handleSendCustomerChat} className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                    <input
                      type="text"
                      value={chatReplyText}
                      onChange={(e) => setChatReplyText(e.target.value)}
                      placeholder={`U jawaab macmiilka adigoo ah ${employee.name}...`}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                    />
                    <button
                      type="submit"
                      disabled={!chatReplyText.trim()}
                      className="px-4 py-2 bg-teal-800 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Jawaab</span>
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* 3. ROLE: KHASNAJI (CASHIER: Hubinta Lacagaha & Transaction IDs) */}
            {employee.role === 'cashier' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-teal-700" />
                      <span>Miiska Khasnajiga: Hubinta Lacagaha & TxID</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Hubi Transaction ID-ga macaamiishu soo direen ka hor inta aan alaabta la dirin
                    </p>
                  </div>

                  {/* Filter tabs for Cashier */}
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-sm self-start sm:self-auto">
                    <button
                      onClick={() => setCashierFilter('awaiting')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        cashierFilter === 'awaiting'
                          ? 'bg-amber-600 text-white shadow'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Sugaya Hubinta</span>
                      <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px]">
                        {storeOrders.filter((o) => o.status === 'awaiting_verification' || o.paymentStatus === 'submitted').length}
                      </span>
                    </button>

                    <button
                      onClick={() => setCashierFilter('verified')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        cashierFilter === 'verified'
                          ? 'bg-teal-800 text-white shadow'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      La Xaqiijiyay
                    </button>

                    <button
                      onClick={() => setCashierFilter('all')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        cashierFilter === 'all'
                          ? 'bg-slate-800 text-white shadow'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Dhammaan ({storeOrders.length})
                    </button>
                  </div>
                </div>

                {/* Orders List for Cashier */}
                {(() => {
                  const filteredOrders = storeOrders.filter((ord) => {
                    if (cashierFilter === 'awaiting') {
                      return ord.status === 'awaiting_verification' || ord.paymentStatus === 'submitted';
                    }
                    if (cashierFilter === 'verified') {
                      return ord.paymentStatus === 'verified' || ord.status === 'preparing' || ord.status === 'in_transit' || ord.status === 'delivered';
                    }
                    return true;
                  });

                  if (filteredOrders.length === 0) {
                    return (
                      <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs space-y-1">
                        <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-semibold text-slate-600">
                          {cashierFilter === 'awaiting'
                            ? 'Ma jiraan dalabaad hadda sugaya hubin lacageed.'
                            : 'Ma jiraan dalabaad la helay qaybtan.'}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {filteredOrders.map((ord) => {
                        const isAwaiting = ord.status === 'awaiting_verification' || ord.paymentStatus === 'submitted';
                        const isVerified = ord.paymentStatus === 'verified' || ord.status === 'preparing' || ord.status === 'in_transit' || ord.status === 'delivered';
                        const isRejected = ord.paymentStatus === 'rejected' || ord.status === 'cancelled';

                        return (
                          <div
                            key={ord.id}
                            className={`bg-white p-4 rounded-2xl border transition-all shadow-sm space-y-3 ${
                              isAwaiting
                                ? 'border-amber-300 ring-2 ring-amber-100'
                                : 'border-slate-200'
                            }`}
                          >
                            {/* Card Top */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-slate-900">
                                  {ord.orderNumber}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {ord.createdAt}
                                </span>
                              </div>

                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                  isAwaiting
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : isVerified
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {isAwaiting
                                  ? '⏳ Sugaya Hubinta TxID'
                                  : isVerified
                                  ? '✓ Lacagta Waa La Hubiyay'
                                  : '✕ La Diiday'}
                              </span>
                            </div>

                            {/* Customer & Items Summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-400 block">Macmiilka:</span>
                                <p className="font-bold text-slate-900">{ord.customerName}</p>
                                <a
                                  href={`tel:${ord.customerPhone}`}
                                  className="text-teal-700 hover:underline flex items-center gap-1 mt-0.5"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{ord.customerPhone}</span>
                                </a>
                              </div>

                              <div>
                                <span className="text-[10px] text-slate-400 block">Qaddarka & Bixinta:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-teal-800 text-sm">
                                    ${ord.totalUsd.toFixed(2)} USD
                                  </span>
                                  <span className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
                                    {ord.paymentMethod.toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-500">
                                  ({formatPrice(ord.totalUsd, currency)})
                                </span>
                              </div>
                            </div>

                            {/* Highlighted Transaction ID (TxID) & SMS Proof */}
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold text-slate-500">
                                  Transaction ID (TxID):
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-extrabold text-teal-900 text-xs sm:text-sm bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                                    {ord.transactionId || 'Lama gelin (None)'}
                                  </span>
                                  {ord.transactionId && (
                                    <button
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
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {ord.paymentProofText && (
                                <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100 leading-relaxed font-sans">
                                  <span className="font-bold text-slate-700 block text-[10px] mb-0.5">
                                    Fariinta SMS-ka ee Caddaynta:
                                  </span>
                                  "{ord.paymentProofText}"
                                </div>
                              )}

                              {ord.verifiedByStaffName && (
                                <div className="text-[10px] text-slate-400">
                                  Waxaa xaqiijiyay: <b>{ord.verifiedByStaffName}</b> ({ord.verifiedAt || 'Hadda'})
                                </div>
                              )}

                              {ord.verificationRejectionReason && (
                                <div className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                                  <b>Sababta loo diiday:</b> {ord.verificationRejectionReason}
                                </div>
                              )}
                            </div>

                            {/* Cashier Action Controls */}
                            {isAwaiting && (
                              <div className="pt-2 border-t border-slate-100 flex gap-2 justify-end">
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
                                      onVerifyOrderPayment(ord.id, `${employee.name} (Khasnaji)`, employee.id);
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
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 4. ROLE: INVENTORY */}
            {employee.role === 'inventory' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-teal-700" />
                  Kormeerka Kaydka Alaabta Dukaanka
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {products
                    .filter((p) => p.storeId === store.id)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.nameSomali}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {p.nameSomali}
                            </h4>
                            <span className="text-[11px] text-teal-700 font-bold tabular-nums">
                              {formatPrice(p.priceUsd, currency)}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold bg-teal-50 text-teal-800 px-2.5 py-1 rounded-lg border border-teal-200">
                          Kaydka: {p.stock} xabo
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: TEAM INTERNAL CHAT (Shaqaalaha & Adminka way wada xariiri karaan) */}
        {activeTab === 'team_chat' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 min-h-[420px] flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-700" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Wada-hadalka Shaqaalaha & Adminka ({store.name})
                  </h3>
                </div>
                <span className="text-[11px] text-teal-700 font-medium">
                  Toos & Qarasoodi ah
                </span>
              </div>

              <div className="space-y-3 my-3 overflow-y-auto max-h-[320px] pr-1">
                {storeTeamMessages.length === 0 ? (
                  <div className="text-center text-slate-400 py-10 text-xs">
                    Weli kooxdu farriin iskuma dirin. Qor fariin si aad ula xariirto kooxdaada.
                  </div>
                ) : (
                  storeTeamMessages.map((msg) => {
                    const isMe = msg.senderName === employee.name;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isMe ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5 px-1 text-[10px]">
                          <span className="font-bold text-slate-700">
                            {msg.senderName}
                          </span>
                          <span className="text-slate-400">({msg.senderRole})</span>
                        </div>
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-sm leading-relaxed ${
                            isMe
                              ? 'bg-teal-800 text-white rounded-br-none'
                              : 'bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200'
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

            <form onSubmit={handleSendTeamMsg} className="pt-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={teamInputText}
                onChange={(e) => setTeamInputText(e.target.value)}
                placeholder="La hadal shaqaalaha ama adminka dukaanka..."
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600"
              />
              <button
                type="submit"
                disabled={!teamInputText.trim()}
                className="px-4 py-2 bg-teal-800 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dir</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
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
              TxID-ga la soo diray: <b className="font-mono text-teal-800">{rejectingOrder.transactionId || 'Waxba'}</b>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sababta Loo Diiday (Reason):
              </label>
              <textarea
                rows={3}
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
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
                    onClick={() => setRejectionReasonText(sugg)}
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
                    onRejectOrderPayment(rejectingOrder.id, rejectionReasonText);
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
