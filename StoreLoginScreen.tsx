import React, { useState } from 'react';
import {
  Store as StoreIcon,
  Lock,
  Building,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Phone,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  User,
  Users,
  UserCheck,
  ShieldAlert,
  CreditCard,
  Zap,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { ScreenType, Store, StoreTier, StaffSession, StorePaymentConfig } from '../../types';

interface StoreLoginScreenProps {
  stores: Store[];
  onLoginSuccess: (storeId: string) => void;
  onStaffLoginSuccess?: (session: StaffSession) => void;
  onRegisterStore: (newStore: Store) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const StoreLoginScreen: React.FC<StoreLoginScreenProps> = ({
  stores,
  onLoginSuccess,
  onStaffLoginSuccess,
  onRegisterStore,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'staff' | 'register'>('login');

  // Admin Login inputs: Aqoonsiga Dukaanka (e.g. DUK-101) + Password
  const [loginStoreCode, setLoginStoreCode] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Staff Login inputs
  const [staffStoreCode, setStaffStoreCode] = useState('');
  const [staffEmployeeCode, setStaffEmployeeCode] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  // Registration inputs
  const [regStoreName, setRegStoreName] = useState('');
  const [regLogoUrl, setRegLogoUrl] = useState<string>('');
  const [regAdminName, setRegAdminName] = useState('');
  const [regPhone, setRegPhone] = useState('+252 ');
  const [regStoreType, setRegStoreType] = useState<StoreTier>('large');
  const [regOperatingDays, setRegOperatingDays] = useState<number>(90);
  const [regPassword, setRegPassword] = useState('');
  const [regCity, setRegCity] = useState('Muqdisho');

  const handleRegLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setRegLogoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Registration Payment Setup
  const [regPaymentMode, setRegPaymentMode] = useState<'manual_numbers' | 'api_gateway'>('manual_numbers');
  const [regEvcNumber, setRegEvcNumber] = useState('');
  const [regZaadNumber, setRegZaadNumber] = useState('');
  const [regEdahabNumber, setRegEdahabNumber] = useState('');
  const [regTillNumber, setRegTillNumber] = useState('');
  const [regGatewayProvider, setRegGatewayProvider] = useState<'waafi' | 'edahab_api' | 'hormuud_api' | 'custom_unified'>('waafi');
  const [regGatewayUrl, setRegGatewayUrl] = useState('https://api.waafi.com/v1/checkout');
  const [regApiKey, setRegApiKey] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Post-registration confirmation modal showing system-generated Store Code and WhatsApp support
  const [registeredStoreData, setRegisteredStoreData] = useState<Store | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedCode = loginStoreCode.trim().toUpperCase();
    const foundStore = stores.find(
      (s) => s.storeCode.toUpperCase() === trimmedCode
    );

    if (!foundStore) {
      setErrorMsg(`Aqoonsiga dukaanka "${trimmedCode}" lama helin. Fadlan hubi ama is-diiwaangeli.`);
      return;
    }

    if (foundStore.password && foundStore.password !== loginPassword) {
      setErrorMsg('Furaha sirta ah (Password) ma saxna.');
      return;
    }

    onLoginSuccess(foundStore.id);
    onNavigate('store_dashboard');
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedStoreCode = staffStoreCode.trim().toUpperCase();
    const targetStore = stores.find(
      (s) => s.storeCode.toUpperCase() === trimmedStoreCode
    );

    if (!targetStore) {
      setErrorMsg(`Dukaanka leh aqoonsiga "${trimmedStoreCode}" lama helin.`);
      return;
    }

    if (targetStore.storeType !== 'large' || !targetStore.employees?.length) {
      setErrorMsg('Dukaankani ma laha shaqaale diiwaangashan ama waa dukaan yar.');
      return;
    }

    const foundEmployee = targetStore.employees.find((emp) => {
      const matchId =
        emp.employeeCode.toUpperCase() === staffEmployeeCode.trim().toUpperCase() ||
        emp.phone.replace(/\s+/g, '') === staffEmployeeCode.trim().replace(/\s+/g, '') ||
        emp.name.toLowerCase() === staffEmployeeCode.trim().toLowerCase();
      return matchId;
    });

    if (!foundEmployee) {
      setErrorMsg(`Shaqaalaha "${staffEmployeeCode}" lagama helin dukaanka ${targetStore.name}.`);
      return;
    }

    if (!foundEmployee.isActive) {
      setErrorMsg('Akoonka shaqaalahan hadda waa la hakiyay. La hadal adminka dukaanka.');
      return;
    }

    if (foundEmployee.password && foundEmployee.password !== staffPassword) {
      setErrorMsg('Furaha sirta ah ee shaqaalaha ma saxna.');
      return;
    }

    if (onStaffLoginSuccess) {
      onStaffLoginSuccess({
        store: targetStore,
        employee: foundEmployee,
      });
    }
    onNavigate('staff_dashboard');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regStoreName || !regAdminName || !regPhone || !regPassword) {
      setErrorMsg('Fadlan buuxi dhammaan meelaha banaan.');
      return;
    }

    // Generate unique system Store ID (e.g. DUK-245)
    const randomSuffix = Math.floor(200 + Math.random() * 799);
    const generatedStoreCode = `DUK-${randomSuffix}`;

    const newStoreId = `store-${Date.now()}`;

    const paymentConfig: StorePaymentConfig =
      regPaymentMode === 'api_gateway'
        ? {
            mode: 'api_gateway',
            gatewayProvider: regGatewayProvider,
            apiGatewayUrl: regGatewayUrl.trim() || 'https://api.waafi.com/v1/checkout',
            apiKey: regApiKey.trim() || `sk_live_${generatedStoreCode.toLowerCase()}_somalia`,
            merchantId: `MRCH-${generatedStoreCode}`,
            isLive: true,
            evcNumber: regEvcNumber.trim() || regPhone,
            instructions: 'API Gateway toos ah ayaa lacagta ku xaqiijinaya.',
          }
        : {
            mode: 'manual_numbers',
            evcNumber: regEvcNumber.trim() || regPhone,
            zaadNumber: regZaadNumber.trim() || regPhone,
            edahabNumber: regEdahabNumber.trim() || regPhone,
            merchantTillNumber: regTillNumber.trim(),
            instructions: 'U soo dir taleefanka dukaanka kadibna geli Transaction ID-ga.',
          };

    const newStore: Store = {
      id: newStoreId,
      storeCode: generatedStoreCode,
      name: regStoreName,
      adminName: regAdminName,
      phone: regPhone,
      password: regPassword,
      city: regCity,
      category: 'Ganacsi Guud',
      storeType: regStoreType,
      operatingDays: regOperatingDays,
      rating: 5.0,
      salesCount: 0,
      followersCount: 1,
      isVerified: true,
      isPendingApproval: false,
      avatar: regStoreName.substring(0, 2).toUpperCase(),
      logoUrl: regLogoUrl || undefined,
      description: `Dukaanka ${regStoreName} ee uu maamulo ${regAdminName}.`,
      employees: [],
      paymentConfig,
    };

    onRegisterStore(newStore);
    setRegisteredStoreData(newStore);
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-5 sm:p-8 bg-slate-50 text-slate-900 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('welcome')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors flex items-center gap-1 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dib u noqo</span>
        </button>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Merchant & Staff Portal
        </span>
      </div>

      <div className="max-w-md mx-auto w-full my-auto py-3">
        {/* Header Icon */}
        <div className="text-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto mb-2.5 shadow-sm">
            {activeTab === 'staff' ? (
              <Users className="w-7 h-7" />
            ) : (
              <StoreIcon className="w-7 h-7" />
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {activeTab === 'login'
              ? 'Gelitaanka Adminka Dukaanka'
              : activeTab === 'staff'
              ? 'Gelitaanka Shaqaalaha Dukaanka'
              : 'Is-Diiwaangelinta Dukaanka'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTab === 'login'
              ? 'Ku gal Aqoonsiga Dukaankaaga (Store ID e.g. DUK-101) iyo Password-ka'
              : activeTab === 'staff'
              ? 'Geli aqoonsiga dukaanka uu adminku ku siiyay iyo password-kaaga'
              : 'Diiwaangeli dukaankaaga si laguu siiyo aqoonsi gaar ah'}
          </p>
        </div>

        {/* 3-Tab Toggle: Admin Login | Staff Login | Register */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl mb-4 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'login'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gal Adminka
          </button>
          <button
            onClick={() => {
              setActiveTab('staff');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'staff'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gal Shaqaalaha
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'register'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Diiwaangeli
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: ADMIN LOGIN (Aqoonsiga Dukaanka + Password-ka Adminka) */}
        {activeTab === 'login' && (
          <form onSubmit={handleAdminLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Aqoonsiga Dukaanka (Store ID / Code)
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={loginStoreCode}
                  onChange={(e) => setLoginStoreCode(e.target.value)}
                  placeholder="Tusaale: DUK-101 ama DUK-245"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-teal-600 focus:outline-none bg-white font-mono uppercase"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Aqoonsiga dukaankaaga ee system-ku kuu abuuray markii la diiwaangeliyay
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Password-ka Adminka
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-teal-600 focus:outline-none bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
            >
              <span>Gal Dashboard-ka Adminka</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Switch to Staff Login Banner */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('staff');
                  setErrorMsg('');
                }}
                className="text-xs text-teal-800 hover:underline font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Shaqaale ma tahay? Guji halkan si aad u gasho shaqaale</span>
              </button>
            </div>

            {/* Direct WhatsApp Support Helper */}
            <div className="mt-4 p-3 rounded-xl bg-slate-100 border border-slate-200 text-center space-y-1">
              <span className="text-[11px] text-slate-500">
                Miyaad ilowday Aqoonsigaaga ama Password-kaaga?
              </span>
              <a
                href="https://wa.me/252618889126?text=Asc%20waxaan%20ahay%20ganacsade%20Suuqa%20App,%20waxaan%20u%20baahan%20ahay%20caawinaad"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kala xariir WhatsApp: +252 61 8889126</span>
              </a>
            </div>
          </form>
        )}

        {/* TAB 2: STAFF LOGIN (Ku dhex jira Store Login) */}
        {activeTab === 'staff' && (
          <form onSubmit={handleStaffLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Aqoonsiga Dukaanka aad ka socoto (Store Code)
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={staffStoreCode}
                  onChange={(e) => setStaffStoreCode(e.target.value)}
                  placeholder="Tusaale: DUK-101 ama DUK-245"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:border-teal-600 focus:outline-none bg-white font-mono uppercase"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Aqoonsiga dukaanka uu adminku ku siiyay
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Aqoonsiga Shaqaalaha (Employee Code ama Tel)
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={staffEmployeeCode}
                  onChange={(e) => setStaffEmployeeCode(e.target.value)}
                  placeholder="Tusaale: SHAQ-01 ama Telefoonkaaga"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:border-teal-600 focus:outline-none bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Password-ka Shaqaalaha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:border-teal-600 focus:outline-none bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
            >
              <span>Gal Howshaada (Staff Login)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200/80 text-[11px] text-teal-900">
              <span className="font-bold block">Fiiro gaar ah:</span>
              <span>Shaqaale kasta wuxuu kaliya maamulayaa howsha loo xilsaaray (Diraha gaarsiinta: Diyaari/Dir/Way Gaartay; Adeegga macmiilka: Chats toos ah).</span>
            </div>
          </form>
        )}

        {/* TAB 3: REGISTER (Buuxi magaca dukaan, magaca adminka, numberka, doorashada weyn/yar, maalmaha) */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Magaca Dukaanka (Store Name)
              </label>
              <input
                type="text"
                required
                value={regStoreName}
                onChange={(e) => setRegStoreName(e.target.value)}
                placeholder="Tusaale: Somaliland Fashion Mart"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-teal-600 focus:outline-none bg-white"
              />
            </div>

            {/* Store Icon / Logo Upload */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Icon-ka / Logo-da Dukaanka (Ikhtiyaari):</span>
                <span className="text-[10px] text-teal-700 font-normal">Gallery-ga ama Link</span>
              </label>
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {regLogoUrl ? (
                    <img src={regLogoUrl} alt="Store logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <label className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold border border-teal-200 flex items-center gap-1 cursor-pointer transition-colors">
                      <Upload className="w-3 h-3" />
                      <span>Xulo Sawirka</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleRegLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {regLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setRegLogoUrl('')}
                        className="p-1 rounded text-rose-500 hover:text-rose-700 cursor-pointer"
                        title="Tir sawirka"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder="Ama qor link-ga sawirka..."
                    value={regLogoUrl}
                    onChange={(e) => setRegLogoUrl(e.target.value)}
                    className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:border-teal-600 bg-slate-50"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Magaca Adminka
                </label>
                <input
                  type="text"
                  required
                  value={regAdminName}
                  onChange={(e) => setRegAdminName(e.target.value)}
                  placeholder="Magacaaga buuxa"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-teal-600 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Number-ka Telefoonka
                </label>
                <input
                  type="text"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+252 61..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-teal-600 focus:outline-none bg-white font-mono"
                />
              </div>
            </div>

            {/* Doorashada Dukaan Weyn ama Dukaan Yar */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Doorashada Nooca Dukaanka:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label
                  className={`p-2.5 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                    regStoreType === 'large'
                      ? 'border-teal-600 bg-teal-50/70 text-teal-950 font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Dukaan Weyn</span>
                    <input
                      type="radio"
                      name="storeType"
                      checked={regStoreType === 'large'}
                      onChange={() => setRegStoreType('large')}
                      className="accent-teal-700"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Waxa uu adminka ku dari karaa shaqaale howlo u dhiibto.
                  </span>
                </label>

                <label
                  className={`p-2.5 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                    regStoreType === 'small'
                      ? 'border-teal-600 bg-teal-50/70 text-teal-950 font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Dukaan Yar</span>
                    <input
                      type="radio"
                      name="storeType"
                      checked={regStoreType === 'small'}
                      onChange={() => setRegStoreType('small')}
                      className="accent-teal-700"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Kaliya waxa maamulaya adminka tooska ah.
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Inta Maalin uu u baahan yahay
                </label>
                <select
                  value={regOperatingDays}
                  onChange={(e) => setRegOperatingDays(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-teal-600 focus:outline-none bg-white font-mono"
                >
                  <option value={30}>30 Maalmood (1 Bil)</option>
                  <option value={90}>90 Maalmood (3 Bilood)</option>
                  <option value={180}>180 Maalmood (6 Bilood)</option>
                  <option value={365}>365 Maalmood (1 Sano)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Magaalada
                </label>
                <select
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-teal-600 focus:outline-none bg-white"
                >
                  <option value="Muqdisho">Muqdisho</option>
                  <option value="Hargeysa">Hargeysa</option>
                  <option value="Garoowe">Garoowe</option>
                  <option value="Boosaaso">Boosaaso</option>
                  <option value="Kismaayo">Kismaayo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Password-ka Adminka
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Geli furaha aad dukaanka ku gali doonto"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-teal-600 focus:outline-none bg-white"
              />
            </div>

            {/* Payment Setup for Merchant Registration */}
            <div className="p-3.5 bg-slate-100/90 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-teal-700" />
                  <span>Habka Lacag-Bixinta Dukaanka (Payment Setup)</span>
                </span>
                <span className="text-[10px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  {regPaymentMode === 'api_gateway' ? 'API Gateway' : 'Mobile Numbers'}
                </span>
              </div>

              {/* Toggle Manual vs API Gateway */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setRegPaymentMode('manual_numbers')}
                  className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                    regPaymentMode === 'manual_numbers'
                      ? 'border-teal-700 bg-white shadow-xs font-bold text-teal-950 ring-1 ring-teal-600/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold">
                    <Phone className="w-3 h-3 text-teal-700" />
                    <span>Nambarada Taleefanka</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-normal block mt-0.5">
                    EVC, Zaad, eDahab
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegPaymentMode('api_gateway')}
                  className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                    regPaymentMode === 'api_gateway'
                      ? 'border-teal-700 bg-white shadow-xs font-bold text-teal-950 ring-1 ring-teal-600/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>API Gateway Toos ah</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-normal block mt-0.5">
                    Waafi / Hormuud / eDahab API
                  </span>
                </button>
              </div>

              {regPaymentMode === 'manual_numbers' ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                        EVC Plus Number:
                      </label>
                      <input
                        type="text"
                        value={regEvcNumber}
                        onChange={(e) => setRegEvcNumber(e.target.value)}
                        placeholder="+252 61..."
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:border-teal-600 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                        Zaad Number:
                      </label>
                      <input
                        type="text"
                        value={regZaadNumber}
                        onChange={(e) => setRegZaadNumber(e.target.value)}
                        placeholder="+252 63..."
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:border-teal-600 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      Merchant Till Number (Ikhtiyaari):
                    </label>
                    <input
                      type="text"
                      value={regTillNumber}
                      onChange={(e) => setRegTillNumber(e.target.value)}
                      placeholder="Tusaale: 782910"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:border-teal-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 p-3 bg-teal-950 text-white rounded-xl text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-teal-300 mb-0.5">
                      Bixiyaha API-ga:
                    </label>
                    <select
                      value={regGatewayProvider}
                      onChange={(e) => setRegGatewayProvider(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-teal-900 border border-teal-700 rounded-lg text-white text-xs focus:outline-none"
                    >
                      <option value="waafi">Waafi Pay API</option>
                      <option value="hormuud_api">Hormuud Merchant API</option>
                      <option value="edahab_api">Somtel eDahab API</option>
                      <option value="custom_unified">Unified Somali Payment Gateway</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-teal-300 mb-0.5">
                      API Gateway URL:
                    </label>
                    <input
                      type="url"
                      value={regGatewayUrl}
                      onChange={(e) => setRegGatewayUrl(e.target.value)}
                      placeholder="https://api.waafi.com/v1/checkout"
                      className="w-full px-2.5 py-1.5 bg-teal-900 border border-teal-700 rounded-lg text-teal-200 text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-teal-300 mb-0.5">
                      API Secret Key:
                    </label>
                    <input
                      type="password"
                      value={regApiKey}
                      onChange={(e) => setRegApiKey(e.target.value)}
                      placeholder="sk_live_somalia_..."
                      className="w-full px-2.5 py-1.5 bg-teal-900 border border-teal-700 rounded-lg text-teal-200 text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Platform WhatsApp support info: 252618889126 */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-slate-700 text-[11px] flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-950 block">Xafiiska Taageerada & Diiwaangelinta:</span>
                <span className="text-emerald-800">WhatsApp: <b>+252 61 8889126</b></span>
              </div>
              <a
                href="https://wa.me/252618889126"
                target="_blank"
                rel="noreferrer"
                className="py-1 px-2.5 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-500 transition-colors"
              >
                WhatsApp
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-1"
            >
              <span>Diiwaangeli Dukaanka & Hel Aqoonsiga</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Confirmation Modal when a Store is Successfully Registered */}
      {registeredStoreData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Dukaankaaga Waa La Diiwaangeliyay!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                System-ku wuxuu kuu abuuray Aqoonsi Dukaanka oo gaar ah:
              </p>
            </div>

            {/* Big Prominent Store Code Display */}
            <div className="p-4 bg-teal-50 border-2 border-teal-500/40 rounded-2xl">
              <span className="text-xs text-teal-800 font-semibold uppercase block">
                Aqoonsigaaga Dukaanka (Store ID):
              </span>
              <span className="text-2xl font-black font-mono text-teal-950 tracking-wider">
                {registeredStoreData.storeCode}
              </span>
              <span className="text-[10px] text-teal-700 block mt-1">
                Fadlan meel ku qoro aqoonsigan, kan ayaad dukaanka ku gali doontaa!
              </span>
            </div>

            {/* Direct Merchant Payment Link */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1.5">
              <span className="font-bold text-slate-800 block text-[11px]">
                Link-gaaga Tooska ah ee Lacag-bixinta (Payment Link):
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={`https://suuqa.app/pay?store=${registeredStoreData.storeCode}`}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] font-mono select-all text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(`https://suuqa.app/pay?store=${registeredStoreData.storeCode}`);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    } catch {
                      // fallback
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Guuriyay' : 'Nuqul'}</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-500 block leading-tight">
                Habka lacagta: <b>{registeredStoreData.paymentConfig?.mode === 'api_gateway' ? 'API Gateway Toos ah' : 'Mobile Money Transfer'}</b>
              </span>
            </div>

            {/* WhatsApp Contact Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1">
              <span className="font-bold text-slate-800 block">
                Xiriirka Maamulka & Taageerada:
              </span>
              <p className="text-slate-600 text-[11px]">
                Haddii aad wax su'aal ah qabto, nagala soo xariir WhatsApp:
              </p>
              <a
                href={`https://wa.me/252618889126?text=Asc%20waxaan%20ahay%20${encodeURIComponent(
                  registeredStoreData.adminName
                )},%20dukaankayga%20waa%20${registeredStoreData.storeCode}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors mt-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: +252 61 8889126</span>
              </a>
            </div>

            <button
              onClick={() => {
                const sId = registeredStoreData.id;
                setRegisteredStoreData(null);
                onLoginSuccess(sId);
                onNavigate('store_dashboard');
              }}
              className="w-full py-3 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Gal Dashboard-ka Dukaanka Hadda
            </button>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-slate-400">
        Suuqa App · Merchant & Staff Authentication Gateway
      </div>
    </div>
  );
};
