import React, { useState } from 'react';
import {
  Store,
  UserCheck,
  UserPlus,
  MessageSquare,
  Star,
  MapPin,
  Calendar,
  Users,
  X,
  Plus,
  Eye,
  ShieldAlert,
  QrCode,
  LogIn,
} from 'lucide-react';
import { Store as StoreType, Product, SomaliCurrency } from '../../types';
import { formatPrice } from '../../data/mockData';

interface StoreProfileModalProps {
  store: StoreType;
  products: Product[];
  currency: SomaliCurrency;
  isSuperAdminPreview?: boolean;
  isFollowed?: boolean;
  onToggleFollow?: (storeId: string) => void;
  onOpenChat: (store: StoreType, product?: Product) => void;
  onOpenQr?: (store: StoreType) => void;
  onLoginToStore?: (store: StoreType) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onClose: () => void;
}

export const StoreProfileModal: React.FC<StoreProfileModalProps> = ({
  store,
  products,
  currency,
  isSuperAdminPreview = false,
  isFollowed = false,
  onToggleFollow,
  onOpenChat,
  onOpenQr,
  onLoginToStore,
  onAddToCart,
  onSelectProduct,
  onClose,
}) => {
  const storeProducts = products.filter(
    (p) => p.storeId === store.id || p.storeName === store.name
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in select-none">
      <div className="bg-white w-full sm:max-w-2xl h-[92vh] sm:h-[680px] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Super admin preview warning banner */}
        {isSuperAdminPreview && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              Kormeerka Maamulka Sare (Preview Mode) — Kaliya Baarid, waxbo lama beddeli karo.
            </span>
            <span className="bg-black text-amber-300 px-2 py-0.5 rounded text-[10px] font-mono">
              READ ONLY
            </span>
          </div>
        )}

        {/* Store Profile Hero Banner */}
        <div className="relative bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-5 sm:p-6 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/80 shadow-lg bg-white shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white text-teal-800 border-2 border-white/60 shadow-lg flex items-center justify-center text-xl sm:text-2xl font-black shrink-0">
                {store.avatar || store.name.substring(0, 2).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-black text-white truncate">
                  {store.name}
                </h2>
                {store.storeType === 'large' ? (
                  <span className="bg-teal-400 text-teal-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Dukaan Weyn (Enterprise)
                  </span>
                ) : (
                  <span className="bg-slate-700 text-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-full uppercase">
                    Dukaan Yar (Standard)
                  </span>
                )}
              </div>

              <p className="text-xs text-teal-100 line-clamp-2 max-w-lg">
                {store.description}
              </p>

              {/* Store metadata */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-teal-200">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {store.city}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {store.rating} ({store.salesCount} iib)
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {store.followersCount + (isFollowed ? 1 : 0)} Macmiil (Followers)
                </span>
                <span className="flex items-center gap-1 text-[11px] text-teal-300 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  {store.operatingDays} maalmood shaqo
                </span>
              </div>
            </div>
          </div>

          {/* Action Row: Follow & Live Chat & QR Code */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onToggleFollow && onToggleFollow(store.id)}
              disabled={isSuperAdminPreview}
              className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isFollowed
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-white text-teal-900 hover:bg-teal-50'
              }`}
            >
              {isFollowed ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Waad La Socotaa (Following)</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Noqo Macmiil (Follow)</span>
                </>
              )}
            </button>

            <button
              onClick={() => onOpenChat(store)}
              disabled={isSuperAdminPreview}
              className="py-2 px-4 rounded-xl bg-teal-700/90 hover:bg-teal-600 text-white text-xs font-semibold flex items-center gap-1.5 border border-teal-500/40 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>La Hadal Dukaanka (Live Chat)</span>
            </button>

            {onOpenQr && (
              <button
                onClick={() => onOpenQr(store)}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-teal-100 text-xs font-bold flex items-center gap-1.5 border border-white/20 transition-colors cursor-pointer"
                title="Fiiri QR Code-ka"
              >
                <QrCode className="w-4 h-4" />
                <span>QR Code</span>
              </button>
            )}

            {onLoginToStore && !isSuperAdminPreview && (
              <button
                onClick={() => {
                  onClose();
                  onLoginToStore(store);
                }}
                className="py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-teal-300 text-xs font-bold flex items-center gap-1.5 border border-teal-500/40 transition-colors cursor-pointer"
                title="Ma adigaa iska leh dukaanka? Gal akoonkaaga"
              >
                <LogIn className="w-4 h-4 text-teal-400" />
                <span>Gal Akoonka Dukaanka</span>
              </button>
            )}
          </div>
        </div>

        {/* Store Catalog Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Alaabta Dukaankan Laga Iibinayo ({storeProducts.length})
            </h3>
            <span className="text-xs text-slate-500">
              Qiimaha: {currency.replace('_', ' ')}
            </span>
          </div>

          {storeProducts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              Dukaankani hadda ma hayo alaab diyaar ah.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {storeProducts.map((p) => (
                <div
                  key={p.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div
                    onClick={() => onSelectProduct(p)}
                    className="cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.nameSomali}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                        {p.nameSomali}
                      </h4>
                      <p className="text-[11px] text-slate-500">{p.category}</p>
                      <div className="mt-1 font-bold text-sm text-teal-800 tabular-nums">
                        {formatPrice(p.priceUsd, currency)}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 pt-0 flex gap-1.5">
                    <button
                      onClick={() => onAddToCart(p)}
                      disabled={isSuperAdminPreview}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ku dar & dalbo</span>
                    </button>
                    <button
                      onClick={() => onOpenChat(store, p)}
                      disabled={isSuperAdminPreview}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Weydii dukaanka"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
