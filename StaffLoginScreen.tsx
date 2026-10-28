import React, { useState } from 'react';
import {
  Users,
  Lock,
  Building,
  UserCheck,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Store, Employee, ScreenType, StaffSession } from '../../types';

interface StaffLoginScreenProps {
  stores: Store[];
  onStaffLoginSuccess: (session: StaffSession) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const StaffLoginScreen: React.FC<StaffLoginScreenProps> = ({
  stores,
  onStaffLoginSuccess,
  onNavigate,
}) => {
  const [storeCodeInput, setStoreCodeInput] = useState('');
  const [employeeCodeInput, setEmployeeCodeInput] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedStoreCode = storeCodeInput.trim().toUpperCase();
    const targetStore = stores.find(
      (s) => s.storeCode.toUpperCase() === trimmedStoreCode
    );

    if (!targetStore) {
      setErrorMessage(`Dukaanka leh aqoonsiga "${trimmedStoreCode}" lama helin.`);
      return;
    }

    if (targetStore.storeType !== 'large' || !targetStore.employees?.length) {
      setErrorMessage('Dukaankani ma laha shaqaale diiwaangashan ama waa dukaan yar.');
      return;
    }

    // Match employee by employeeCode or phone or name
    const foundEmployee = targetStore.employees.find((emp) => {
      const matchId =
        emp.employeeCode.toUpperCase() === employeeCodeInput.trim().toUpperCase() ||
        emp.phone.replace(/\s+/g, '') === employeeCodeInput.trim().replace(/\s+/g, '') ||
        emp.name.toLowerCase() === employeeCodeInput.trim().toLowerCase();
      return matchId;
    });

    if (!foundEmployee) {
      setErrorMessage(`Shaqaalaha "${employeeCodeInput}" lagama helin dukaanka ${targetStore.name}.`);
      return;
    }

    if (!foundEmployee.isActive) {
      setErrorMessage('Akoonka shaqaalahan hadda waa la hakiyay. La hadal adminka dukaanka.');
      return;
    }

    if (foundEmployee.password && foundEmployee.password !== staffPassword) {
      setErrorMessage('Furaha sirta ah ee shaqaalaha ma saxna.');
      return;
    }

    // Success! Log into Staff Dashboard
    onStaffLoginSuccess({
      store: targetStore,
      employee: foundEmployee,
    });
    onNavigate('staff_dashboard');
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
        <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
          Staff Portal
        </span>
      </div>

      <div className="max-w-md mx-auto w-full my-auto py-4">
        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto mb-2.5 shadow-sm">
            <Users className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Gelitaanka Shaqaalaha Dukaanka
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Geli aqoonsiga dukaanka (Tusaale: DUK-101), ID-gaaga iyo password-ka
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleStaffLogin} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Aqoonsiga Dukaanka (Store Code)
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={storeCodeInput}
                onChange={(e) => setStoreCodeInput(e.target.value)}
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
                value={employeeCodeInput}
                onChange={(e) => setEmployeeCodeInput(e.target.value)}
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
                placeholder="••••••"
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
        </form>

        {/* Informative helper about staff roles */}
        <div className="mt-6 p-3 rounded-2xl bg-teal-50 border border-teal-200/80 text-[11px] text-teal-900 space-y-1">
          <p className="font-bold">Fiiro Gaar ah:</p>
          <p className="text-teal-800 leading-relaxed">
            Shaqaale kasta wuxuu kaliya arkayaa howsha u xilsaaran tahay (Diraha: dalabaadka diyaarinta & diridda; Adeegga macmiilka: fariimaha tooska ah). Dukaanka dhabta ah kaliya Adminka ayaa maamula.
          </p>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400">
        Suuqa App · Staff Access Gateway
      </div>
    </div>
  );
};
