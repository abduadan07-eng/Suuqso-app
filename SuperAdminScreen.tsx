import React, { useState } from 'react';
import {
  ShieldCheck,
  Building,
  Users,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Settings,
  Plus,
  Edit,
  Eye,
  Calendar,
  X,
  AlertCircle,
  Clock,
  RefreshCw,
  QrCode,
  Film,
  Video,
  Play,
  Trash2,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Store, ScreenType, SomaliCurrency, StoreTier, Advertisement } from '../../types';
import { formatPrice } from '../../data/mockData';

interface SuperAdminScreenProps {
  stores: Store[];
  currency: SomaliCurrency;
  advertisements?: Advertisement[];
  onApproveAdvertisement?: (adId: string) => void;
  onRejectAdvertisement?: (adId: string, reason: string) => void;
  onDeleteAdvertisement?: (adId: string) => void;
  onCreateStore: (newStore: Store) => void;
  onUpdateStore: (updatedStore: Store) => void;
  onApproveStore: (storeId: string, operatingDays: number, customCode?: string) => void;
  onToggleStoreVerification: (storeId: string) => void;
  onPreviewStore: (store: Store) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const SuperAdminScreen: React.FC<SuperAdminScreenProps> = ({
  stores,
  currency,
  advertisements = [],
  onApproveAdvertisement,
  onRejectAdvertisement,
  onDeleteAdvertisement,
  onCreateStore,
  onUpdateStore,
  onApproveStore,
  onToggleStoreVerification,
  onPreviewStore,
  onNavigate,
}) => {
  const [commissionRate, setCommissionRate] = useState(2.5);

  // Create store modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStoreCode, setCreateStoreCode] = useState('DUK-301');
  const [createName, setCreateName] = useState('');
  const [createAdmin, setCreateAdmin] = useState('');
  const [createPhone, setCreatePhone] = useState('+252 ');
  const [createCity, setCreateCity] = useState('Muqdisho');
  const [createCategory, setCreateCategory] = useState('Elektaroonig');
  const [createType, setCreateType] = useState<StoreTier>('large');
  const [createDays, setCreateDays] = useState(90);

  // Edit store modal
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  // Approve store modal
  const [approvingStore, setApprovingStore] = useState<Store | null>(null);
  const [approveStoreCode, setApproveStoreCode] = useState('');
  const [approveDays, setApproveDays] = useState(60);

  const generateRandomStoreCode = () => `DUK-${Math.floor(200 + Math.random() * 799)}`;

  const totalGmv = 124800;
  const platformRevenue = totalGmv * (commissionRate / 100);

  const pendingStores = stores.filter((s) => s.isPendingApproval);
  const activeStores = stores.filter((s) => !s.isPendingApproval);

  // Tab: 'stores' | 'advertisements'
  const [activeTab, setActiveTab] = useState<'stores' | 'advertisements'>('stores');

  // Ad verification state
  const [adFilter, setAdFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [rejectingAd, setRejectingAd] = useState<Advertisement | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Waa muuqaal nuqul ah (copy/watermark) oo dhab ma aha.');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const pendingAds = advertisements.filter((a) => a.status === 'pending_approval');
  const approvedAds = advertisements.filter((a) => a.status === 'approved');
  const rejectedAds = advertisements.filter((a) => a.status === 'rejected');

  const filteredAds = advertisements.filter((a) => {
    if (adFilter === 'pending') return a.status === 'pending_approval';
    if (adFilter === 'approved') return a.status === 'approved';
    if (adFilter === 'rejected') return a.status === 'rejected';
    return true;
  });

  const handleApproveAd = (adId: string) => {
    if (onApproveAdvertisement) {
      onApproveAdvertisement(adId);
      setActionSuccessMsg('✓ Xayeysiiska si rasmi ah ayaa loo ansixiyay waxaana loo calaamadeeyay "Dhab / Authentic"! Hadda wuxuu ka muuqanayaa bogga Xayeysiisyo.');
      setTimeout(() => setActionSuccessMsg(null), 5000);
    }
  };

  const handleConfirmRejectAd = () => {
    if (!rejectingAd) return;
    if (onRejectAdvertisement) {
      onRejectAdvertisement(rejectingAd.id, rejectReason);
      setActionSuccessMsg(`✗ Xayeysiiskii "${rejectingAd.title}" waa la diiday (Sabab: ${rejectReason}).`);
      setTimeout(() => setActionSuccessMsg(null), 5000);
    }
    setRejectingAd(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName || !createAdmin) return;

    const assignedCode = createStoreCode.trim().toUpperCase() || generateRandomStoreCode();

    const newStore: Store = {
      id: `store-${Date.now()}`,
      storeCode: assignedCode,
      name: createName,
      adminName: createAdmin,
      phone: createPhone,
      password: 'default123',
      city: createCity,
      category: createCategory,
      storeType: createType,
      operatingDays: createDays,
      rating: 5.0,
      salesCount: 0,
      followersCount: 0,
      isVerified: true,
      isPendingApproval: false,
      avatar: createName.substring(0, 2).toUpperCase(),
      description: `Dukaanka ${createName} oo uu maamulo ${createAdmin}.`,
      employees: [],
    };

    onCreateStore(newStore);
    setIsCreateOpen(false);
    setCreateName('');
    setCreateAdmin('');
    setCreateStoreCode(generateRandomStoreCode());
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;
    onUpdateStore({
      ...editingStore,
      storeCode: editingStore.storeCode.trim().toUpperCase(),
    });
    setEditingStore(null);
  };

  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingStore) return;
    const finalCode = approveStoreCode.trim().toUpperCase() || approvingStore.storeCode;
    onApproveStore(approvingStore.id, approveDays, finalCode);
    setApprovingStore(null);
  };

  return (
    <div className="min-h-full pb-20 bg-slate-900 text-slate-100 select-none">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('welcome')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="font-bold text-sm text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Maamulka Sare (Super Admin)
            </span>
            <span className="text-[11px] text-slate-400">
              Xafiiska Maamulka & Dukaamada
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'stores' && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Abuuro Dukaan Cusub</span>
            </button>
          )}
          {activeTab === 'advertisements' && (
            <button
              onClick={() => onNavigate('ads_feed')}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Arag Bogga Xayeysiisyada</span>
            </button>
          )}
        </div>
      </div>

      {/* Super Admin Main Tabs (Stores vs Ads Verification) */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 pt-2">
        <div className="max-w-4xl mx-auto flex gap-4 text-xs font-semibold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('stores')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'stores'
                ? 'border-teal-400 text-teal-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Dukaamada ({stores.length})</span>
            {pendingStores.length > 0 && (
              <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full border border-amber-500/30">
                {pendingStores.length} codsi
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('advertisements')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'advertisements'
                ? 'border-teal-400 text-teal-300 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Xayeysiisyada & Ansixinta ({advertisements.length})</span>
            {pendingAds.length > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold shadow animate-pulse">
                {pendingAds.length} sugaya ansixin
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {actionSuccessMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* ================= VIEW 1: STORES MANAGEMENT ================= */}
        {activeTab === 'stores' && (
          <div className="space-y-4">
            {/* KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
            <span className="text-[11px] text-slate-400">Dakhliga Guud (GMV)</span>
            <div className="text-base sm:text-lg font-bold text-white mt-1 tabular-nums">
              {formatPrice(totalGmv, currency)}
            </div>
            <span className="text-[10px] text-emerald-400">Suuqa oo dhan</span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
            <span className="text-[11px] text-slate-400">Komishanka ({commissionRate}%)</span>
            <div className="text-base sm:text-lg font-bold text-teal-300 mt-1 tabular-nums">
              {formatPrice(platformRevenue, currency)}
            </div>
            <span className="text-[10px] text-teal-400">Dakhliga shirkadda</span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
            <span className="text-[11px] text-slate-400">Dukaamada Firfircoon</span>
            <div className="text-base sm:text-lg font-bold text-white mt-1 tabular-nums">
              {activeStores.length} Dukaan
            </div>
            <span className="text-[10px] text-slate-400">
              {pendingStores.length > 0 ? `${pendingStores.length} ayaa sugaya` : 'Dhammaan waa xaqiijisan'}
            </span>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
            <span className="text-[11px] text-slate-400">Macaamiisha</span>
            <div className="text-base sm:text-lg font-bold text-white mt-1 tabular-nums">
              3,892
            </div>
            <span className="text-[10px] text-emerald-400">EVC / Zaad</span>
          </div>
        </div>

        {/* 1. DUKAAMADA SUGAYA OGGOLAANSHAHA (Pending Approval & Operating Days Allocation) */}
        {pendingStores.length > 0 && (
          <div className="bg-amber-950/40 border border-amber-600/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                Dukaamada Cusub ee Soo Dalbaday ({pendingStores.length})
              </h3>
              <span className="text-[11px] text-amber-400/80">
                Oggolow oo u qoondee maalmaha uu shaqaynayo
              </span>
            </div>

            <div className="space-y-2">
              {pendingStores.map((st) => (
                <div
                  key={st.id}
                  className="bg-slate-800/90 p-3 rounded-xl border border-amber-500/30 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">
                        {st.name}
                      </span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-medium">
                        Codsade Cusub
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {st.storeType === 'large' ? 'Dukaan Weyn' : 'Dukaan Yar'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Adminka: <b>{st.adminName}</b> · Tel: {st.phone} · Magaalada: {st.city}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onPreviewStore(st)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-700 hover:bg-slate-600 text-teal-300 flex items-center gap-1 cursor-pointer"
                      title="Kormeer dukaankan khalad ma ku jiro"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => {
                        setApprovingStore(st);
                        setApproveDays(st.operatingDays || 60);
                        setApproveStoreCode(st.storeCode || generateRandomStoreCode());
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow cursor-pointer"
                    >
                      Aqbal & Maalmo U Dar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. ACTIVE STORES LIST (Edit, Preview, Operating Days, Verification) */}
        <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-teal-400" />
              Dhammaan Dukaamada Diiwaangashan ({activeStores.length})
            </h3>
            <span className="text-[11px] text-slate-400">
              Guji <b>Preview</b> si aad u kormeerto ama <b>Edit</b> si aad wax uga beddesho
            </span>
          </div>

          <div className="space-y-2">
            {activeStores.map((st) => (
              <div
                key={st.id}
                className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  {st.logoUrl ? (
                    <img
                      src={st.logoUrl}
                      alt={st.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-teal-900/60 border border-teal-500/30 text-teal-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {st.avatar || st.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {st.name}
                      </span>
                    {st.storeType === 'large' ? (
                      <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded border border-teal-500/30">
                        Dukaan Weyn ({st.employees?.length || 0} Shaqaale)
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded">
                        Dukaan Yar
                      </span>
                    )}
                    <span className="text-[10px] bg-slate-700/80 text-teal-300 px-1.5 py-0.2 rounded font-mono">
                      {st.operatingDays} Maalmood
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Adminka: <b>{st.adminName}</b> · Tel: {st.phone} · {st.city} · {st.followersCount} Macmiil
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  {/* PREVIEW BUTTON (Kormeer Dukaan si khalad loogu baaro) */}
                  <button
                    onClick={() => onPreviewStore(st)}
                    className="px-2.5 py-1 text-xs rounded-lg bg-teal-950 text-teal-300 border border-teal-700/60 hover:bg-teal-900 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Kormeer dukaankan sida macmiilku u arko"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  {/* EDIT BUTTON (Edit ku sameyn karo) */}
                  <button
                    onClick={() => setEditingStore({ ...st })}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Wax ka beddel dukaankan"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {/* STATUS TOGGLE */}
                  <button
                    onClick={() => onToggleStoreVerification(st.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                      st.isVerified
                        ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {st.isVerified ? 'Haki' : 'Oggolow'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. PLATFORM SETTINGS */}
        <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700 space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-teal-400" />
            Dejinta Komishanka Suuqa (Commission Rate)
          </h3>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={commissionRate}
              onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
              className="flex-1 accent-teal-400 cursor-pointer"
            />
            <span className="text-sm font-bold text-teal-300 font-mono w-14">
              {commissionRate.toFixed(1)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Boqolkiiba {commissionRate}% ayaa laga jarayaa dalab kasta oo lagu bixiyo EVC Plus / Zaad.
          </p>
        </div>
      </div>
    )}

    {/* ================= VIEW 2: ADVERTISEMENTS & VIDEO AUTHENTICITY MODERATION ================= */}
    {activeTab === 'advertisements' && (
      <div className="space-y-4">
        {/* Verification Console Intro Header */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-teal-400" />
              <span>Qaybta Hubinta & Ansixinta Muuqaallada (Video Moderation)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Super Admin ahaan, waxaad toos u daawan kartaa fiidiyow kasta oo dukaamadu soo geliyeen, waxaadna xaqiijin kartaa inuu yahay <b>mid dhab ah (authentic)</b> oo uusan ahayn <b>nuqul (copy/scam)</b> ka hor inta aan dadweynaha loo oggolaan.
            </p>
          </div>

          <button
            onClick={() => onNavigate('ads_feed')}
            className="py-2 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-colors shrink-0 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Fiiri Bogga Xayeysiisyada (Reels)</span>
          </button>
        </div>

        {/* Ads KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div
            onClick={() => setAdFilter('pending')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              adFilter === 'pending'
                ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/30'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
            }`}
          >
            <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Sugaya Ansixin</span>
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-amber-300 mt-1 tabular-nums">
              {pendingAds.length}
            </div>
            <span className="text-[10px] text-amber-400/80">U baahan go'aan degdeg ah</span>
          </div>

          <div
            onClick={() => setAdFilter('approved')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              adFilter === 'approved'
                ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
            }`}
          >
            <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>La Ansixiyay (Dhab ah)</span>
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-300 mt-1 tabular-nums">
              {approvedAds.length}
            </div>
            <span className="text-[10px] text-emerald-400/80">Dadweynaha u muuqda</span>
          </div>

          <div
            onClick={() => setAdFilter('rejected')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              adFilter === 'rejected'
                ? 'bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/30'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
            }`}
          >
            <span className="text-[11px] text-rose-300 font-semibold flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>La Diiday (Nuqul/Copy)</span>
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-rose-300 mt-1 tabular-nums">
              {rejectedAds.length}
            </div>
            <span className="text-[10px] text-rose-400/80">Loo diiday khalad dartiis</span>
          </div>

          <div
            onClick={() => setAdFilter('all')}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              adFilter === 'all'
                ? 'bg-slate-700/80 border-teal-400 ring-2 ring-teal-500/30'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
            }`}
          >
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <Film className="w-3.5 h-3.5 text-teal-400" />
              <span>Dhammaan Xayeysiisyada</span>
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-white mt-1 tabular-nums">
              {advertisements.length}
            </div>
            <span className="text-[10px] text-slate-400">Dukaamada oo dhan</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setAdFilter('pending')}
            className={`py-1.5 px-3 rounded-xl font-bold cursor-pointer transition-colors ${
              adFilter === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            Sugaya Ansixin ({pendingAds.length})
          </button>
          <button
            onClick={() => setAdFilter('approved')}
            className={`py-1.5 px-3 rounded-xl font-bold cursor-pointer transition-colors ${
              adFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            La Ansixiyay & Dhab ah ({approvedAds.length})
          </button>
          <button
            onClick={() => setAdFilter('rejected')}
            className={`py-1.5 px-3 rounded-xl font-bold cursor-pointer transition-colors ${
              adFilter === 'rejected'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            La Diiday ({rejectedAds.length})
          </button>
          <button
            onClick={() => setAdFilter('all')}
            className={`py-1.5 px-3 rounded-xl font-bold cursor-pointer transition-colors ${
              adFilter === 'all'
                ? 'bg-teal-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            Dhammaan ({advertisements.length})
          </button>
        </div>

        {/* List of Ads to Moderate */}
        {filteredAds.length === 0 ? (
          <div className="p-8 text-center bg-slate-800/50 rounded-2xl border border-slate-700 text-slate-400 space-y-2">
            <Film className="w-8 h-8 mx-auto text-slate-500" />
            <h4 className="text-sm font-bold text-white">Ma jiro xayeysiis ku jira qaybtaan</h4>
            <p className="text-xs">
              {adFilter === 'pending'
                ? 'Ma jiraan xayeysiisyo hadda sugaya ansixin. Dukaamada cusub marka ay xayeysiis soo geliyaan halkan ayay ka soo muuqanayaan.'
                : 'Wax xayeysiis ah lagama helin miirahaan.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAds.map((ad) => (
              <div
                key={ad.id}
                className="bg-slate-800/90 rounded-2xl border border-slate-700 overflow-hidden shadow-lg p-4 sm:p-5 space-y-4"
              >
                {/* Store Header & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-900/60 border border-teal-500/40 text-teal-300 font-bold flex items-center justify-center shrink-0">
                      {ad.storeName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          {ad.storeName}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-teal-900/60 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
                          {ad.storeCode}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          📍 {ad.city}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        📞 Tel: <b className="text-slate-200">{ad.contactPhone}</b> · Soo gudbiyay: {ad.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {ad.status === 'pending_approval' && (
                      <span className="bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Sugaya Go'aanka Super Admin</span>
                      </span>
                    )}
                    {ad.status === 'approved' && (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>La Ansixiyay & Dhab ah (Authentic)</span>
                      </span>
                    )}
                    {ad.status === 'rejected' && (
                      <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>La Diiday: Nuqul / Copy</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Moderation Body: Video Player + Product Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Video Player for Super Admin to WATCH & VERIFY */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-teal-400" />
                        <span>Daawashada Muuqaalka (Watch Video):</span>
                      </span>
                      {ad.videoUrl ? (
                        <span className="text-[10.5px] text-teal-400 font-mono">Video Live Preview</span>
                      ) : (
                        <span className="text-[10.5px] text-slate-400">Kaliya Sawir</span>
                      )}
                    </div>

                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-700 flex items-center justify-center">
                      {ad.videoUrl ? (
                        <video
                          src={ad.videoUrl}
                          controls
                          playsInline
                          preload="auto"
                          className="w-full h-full object-contain"
                          onError={(e) => {
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
                    </div>

                    {/* Authenticity Verification Guide Box */}
                    <div className="p-3 bg-slate-900/80 border border-slate-700 rounded-xl space-y-1 text-xs">
                      <span className="text-teal-400 font-bold block flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                        <span>Baaritaanka Dhabnimada (Copy mise Dhab?):</span>
                      </span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Hubi haddii muuqaalka ay ku jiraan: Watermark shisheeye, calaamado internet-ka laga soo koobiyay (copy/scam), mise waa alaabta dhabta ah ee dukaanka {ad.storeName} yaal.
                      </p>
                    </div>
                  </div>

                  {/* Right: Product & Campaign Details */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                          Magaca Alaabta & Qiimaha:
                        </span>
                        <div className="flex items-baseline justify-between mt-0.5">
                          <h4 className="text-base font-bold text-white">
                            {ad.title}
                          </h4>
                          <span className="text-base font-extrabold text-teal-300 font-mono">
                            {formatPrice(ad.priceUsd, currency)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                          Faahfaahinta Dukaanku Qoray:
                        </span>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-700/60">
                          {ad.description}
                        </p>
                      </div>

                      {/* Rejection notice if already rejected */}
                      {ad.status === 'rejected' && ad.rejectionReason && (
                        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/40 text-rose-300 text-xs space-y-1">
                          <span className="font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Sababta aad u diiday:</span>
                          </span>
                          <p className="text-[11px] text-rose-200/90">{ad.rejectionReason}</p>
                        </div>
                      )}

                      {/* Approval notice if approved */}
                      {ad.status === 'approved' && (
                        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 text-xs flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Xayeysiiskan waa la ansixiyay, hadda wuxuu ka muuqdaa bogga <b>Xayeysiisyo (Reels)</b> oo dadweynuhu daawan karaan.</span>
                        </div>
                      )}
                    </div>

                    {/* SUPER ADMIN ACTION BUTTONS (Ansixi vs Diid) */}
                    <div className="pt-3 border-t border-slate-700 flex flex-wrap items-center gap-2">
                      {ad.status === 'pending_approval' && (
                        <>
                          <button
                            onClick={() => handleApproveAd(ad.id)}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Ansixi Xayeysiiska (Dhab & Authentic)</span>
                          </button>

                          <button
                            onClick={() => {
                              setRejectingAd(ad);
                              setRejectReason('Waa muuqaal nuqul ah (copy/watermark) oo dhab ma aha.');
                            }}
                            className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Diid (Nuqul/Copy)</span>
                          </button>
                        </>
                      )}

                      {ad.status === 'approved' && (
                        <>
                          <button
                            onClick={() => onNavigate('ads_feed')}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-teal-300 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Ku Arag Bogga Xayeysiisyada</span>
                          </button>

                          <button
                            onClick={() => {
                              setRejectingAd(ad);
                              setRejectReason('Muuqaalka waxaa lagu arkay khalad ama nuqul ka dib markii la kormeeray.');
                            }}
                            className="py-2 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-300 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Ka Noqo & Diid</span>
                          </button>
                        </>
                      )}

                      {ad.status === 'rejected' && (
                        <button
                          onClick={() => handleApproveAd(ad.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Dib u Ansixi Xayeysiiska</span>
                        </button>
                      )}

                      {onDeleteAdvertisement && (
                        <button
                          onClick={() => onDeleteAdvertisement(ad.id)}
                          className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Tirtir xayeysiiskaan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>

      {/* Modal: Create New Store (Abuuro Dukaan Cusub) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-5 shadow-2xl text-slate-100">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-teal-400" />
                Abuuro Dukaan Cusub
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 mt-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">
                    Aqoonsiga Dukaanka (Store Code / ID)
                  </label>
                  <button
                    type="button"
                    onClick={() => setCreateStoreCode(generateRandomStoreCode())}
                    className="text-[11px] text-teal-400 hover:text-teal-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Abuur ID Cusub</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={createStoreCode}
                  onChange={(e) => setCreateStoreCode(e.target.value.toUpperCase())}
                  placeholder="Tusaale: DUK-301 ama DUK-999"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase focus:outline-none focus:border-teal-400"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Super Adminku wuxuu qori karaa aqoonsi kasta oo uu rabo ama guji "Abuur ID Cusub".
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Magaca Dukaanka
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Tusaale: Somaliland Tech Mart"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Magaca Adminka
                  </label>
                  <input
                    type="text"
                    required
                    value={createAdmin}
                    onChange={(e) => setCreateAdmin(e.target.value)}
                    placeholder="Magaca maamulaha"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Telefoonka (ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nooca Dukaanka
                  </label>
                  <select
                    value={createType}
                    onChange={(e) => setCreateType(e.target.value as StoreTier)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="large">Dukaan Weyn (Shaqaale leh)</option>
                    <option value="small">Dukaan Yar (Kaliya Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Maalmaha Shaqada
                  </label>
                  <input
                    type="number"
                    value={createDays}
                    onChange={(e) => setCreateDays(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Magaalada
                  </label>
                  <select
                    value={createCity}
                    onChange={(e) => setCreateCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="Muqdisho">Muqdisho</option>
                    <option value="Hargeysa">Hargeysa</option>
                    <option value="Garoowe">Garoowe</option>
                    <option value="Boosaaso">Boosaaso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Qaybta
                  </label>
                  <select
                    value={createCategory}
                    onChange={(e) => setCreateCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="Elektaroonig">Elektaroonig</option>
                    <option value="Dharka & Moodada">Dharka & Moodada</option>
                    <option value="Raashinka & Uunsiga">Raashinka & Uunsiga</option>
                    <option value="Qalabka Guriga">Qalabka Guriga</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-white transition-colors cursor-pointer mt-2"
              >
                Dhis & Diiwaangeli Dukaanka
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Existing Store (Edit ku sameyn karo) */}
      {editingStore && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-5 shadow-2xl text-slate-100">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-teal-400" />
                Wax ka Beddel Dukaanka (Edit Store)
              </h3>
              <button
                onClick={() => setEditingStore(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 mt-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">
                    Aqoonsiga Dukaanka (Store Code / ID)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingStore({
                        ...editingStore,
                        storeCode: generateRandomStoreCode(),
                      })
                    }
                    className="text-[11px] text-teal-400 hover:text-teal-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Beddel ID Cusub</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={editingStore.storeCode}
                  onChange={(e) =>
                    setEditingStore({
                      ...editingStore,
                      storeCode: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Magaca Dukaanka
                </label>
                <input
                  type="text"
                  required
                  value={editingStore.name}
                  onChange={(e) =>
                    setEditingStore({ ...editingStore, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Magaca Adminka
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStore.adminName}
                    onChange={(e) =>
                      setEditingStore({ ...editingStore, adminName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Telefoonka (ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStore.phone}
                    onChange={(e) =>
                      setEditingStore({ ...editingStore, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nooca Dukaanka
                  </label>
                  <select
                    value={editingStore.storeType}
                    onChange={(e) =>
                      setEditingStore({
                        ...editingStore,
                        storeType: e.target.value as StoreTier,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="large">Dukaan Weyn (Shaqaale leh)</option>
                    <option value="small">Dukaan Yar (Kaliya Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Maalmaha Shaqada (Days)
                  </label>
                  <input
                    type="number"
                    value={editingStore.operatingDays}
                    onChange={(e) =>
                      setEditingStore({
                        ...editingStore,
                        operatingDays: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-teal-400 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-white transition-colors cursor-pointer mt-2"
              >
                Cusboonaysii Dukaanka (Save Changes)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Approve Store & Allocate Operating Days */}
      {approvingStore && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-5 shadow-2xl text-slate-100">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Aqbal Dukaanka: {approvingStore.name}
              </h3>
              <button
                onClick={() => setApprovingStore(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApproveSubmit} className="space-y-3 mt-3 text-xs">
              <p className="text-slate-300">
                U qoondee aqoonsiga iyo inta maalmood ee uu dukaankan shaqeynayo:
              </p>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">
                    Aqoonsiga Dukaanka (Store Code)
                  </label>
                  <button
                    type="button"
                    onClick={() => setApproveStoreCode(generateRandomStoreCode())}
                    className="text-[11px] text-teal-400 hover:text-teal-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Abuur Cusub</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={approveStoreCode}
                  onChange={(e) => setApproveStoreCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Maalmaha Shaqada (Operating Days)
                </label>
                <select
                  value={approveDays}
                  onChange={(e) => setApproveDays(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-sm"
                >
                  <option value={30}>30 Maalmood (1 Bil)</option>
                  <option value={60}>60 Maalmood (2 Bilood)</option>
                  <option value={90}>90 Maalmood (3 Bilood)</option>
                  <option value={180}>180 Maalmood (6 Bilood)</option>
                  <option value={365}>365 Maalmood (1 Sano)</option>
                </select>
              </div>

              <div className="p-2.5 bg-slate-800 rounded-lg text-[11px] text-slate-400">
                Marka aad gujiso "Xaqiiji & Fur Dukaanka", dukaanku wuxuu toos ugu biirayaa suuqa macmiilka.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-colors cursor-pointer"
              >
                Xaqiiji & Fur Dukaanka
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Diid Xayeysiiska (Super Admin Rejection Reason) */}
      {rejectingAd && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-5 shadow-2xl text-slate-100">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5 text-rose-400">
                <XCircle className="w-4 h-4" />
                <span>Diid Xayeysiiska (Nuqul / Copy Check)</span>
              </h3>
              <button
                onClick={() => setRejectingAd(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-3 p-3 bg-rose-950/50 border border-rose-600/40 rounded-xl text-rose-200 text-xs space-y-1">
              <span className="font-bold block">Alaabta: {rejectingAd.title}</span>
              <span className="text-[11px] text-rose-300 block">Dukaanka: {rejectingAd.storeName} ({rejectingAd.storeCode})</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Dooro Sababta Diidmada (Preset Reasons):
                </label>
                <div className="space-y-1.5">
                  {[
                    'Waa muuqaal nuqul ah (copy/watermark) oo dhab ma aha.',
                    'Muuqaalka tayadiisu ma cadda ama aad bay u liidataa.',
                    'Qiimaha iyo alaabta muuqaalka ku jirta isma laha.',
                    'Lambarka xiriirka ama macluumaadka dukaanka waa khalad.',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectReason(preset)}
                      className={`w-full text-left p-2.5 rounded-xl border text-[11px] transition-all cursor-pointer ${
                        rejectReason === preset
                          ? 'bg-rose-900/60 border-rose-500 text-white font-semibold'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      • {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Faahfaahinta Sababta (Custom Reason):
                </label>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingAd(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Ka Noqo
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRejectAd}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer shadow"
                >
                  Xaqiiji Diidmada
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
