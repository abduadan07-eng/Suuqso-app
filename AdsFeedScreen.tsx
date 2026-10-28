import React, { useState } from 'react';
import {
  Film,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Phone,
  MessageCircle,
  Share2,
  Heart,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Filter,
  Search,
  PlusCircle,
  ExternalLink,
  Store as StoreIcon,
  ShoppingBag,
  BadgeCheck,
  MapPin,
  Tag,
} from 'lucide-react';
import { Advertisement, ScreenType, SomaliCurrency, Product, Store } from '../../types';
import { formatPrice, SOMALI_CITIES } from '../../data/mockData';

interface AdsFeedScreenProps {
  advertisements: Advertisement[];
  stores?: Store[];
  currency: SomaliCurrency;
  onNavigate: (screen: ScreenType) => void;
  onAddToCart?: (product: Product) => void;
  onOpenStoreProfile?: (store: Store) => void;
  onOpenChat?: (store: Store) => void;
}

export const AdsFeedScreen: React.FC<AdsFeedScreenProps> = ({
  advertisements,
  stores = [],
  currency,
  onNavigate,
  onAddToCart,
  onOpenStoreProfile,
  onOpenChat,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [videoOnlyFilter, setVideoOnlyFilter] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [likedAdIds, setLikedAdIds] = useState<string[]>([]);
  const [copiedAdId, setCopiedAdId] = useState<string | null>(null);
  const [activeAdDetail, setActiveAdDetail] = useState<Advertisement | null>(null);

  // Filter approved ads only for public consumers
  const approvedAds = advertisements.filter((ad) => ad.status === 'approved');

  const filteredAds = approvedAds.filter((ad) => {
    const matchesCity = selectedCity === 'all' || ad.city === selectedCity;
    const matchesVideo = !videoOnlyFilter || !!ad.videoUrl;
    const matchesSearch =
      !searchQuery.trim() ||
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesVideo && matchesSearch;
  });

  const handleToggleLike = (adId: string) => {
    setLikedAdIds((prev) =>
      prev.includes(adId) ? prev.filter((id) => id !== adId) : [...prev, adId]
    );
  };

  const handleShareAd = (ad: Advertisement) => {
    const shareText = `${ad.title} - ${formatPrice(ad.priceUsd, currency)} ee dukaanka ${ad.storeName}. Wac: ${ad.contactPhone}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedAdId(ad.id);
      setTimeout(() => setCopiedAdId(null), 2500);
    }
  };

  return (
    <div className="min-h-full pb-24 bg-slate-950 text-white select-none">
      {/* Sticky Header Bar */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('customer_home')}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Ku noqo suuqa"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg text-white tracking-tight flex items-center gap-1.5">
                  <Film className="w-5 h-5 text-amber-400" />
                  <span>Xayeysiisyo & Muuqaallo</span>
                </span>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Live Feed
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Muuqaallada iyo xayeysiisyada dhabta ah ee dukaamada la ansixiyay
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('store_login')}
              className="py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Samee Xayeysiis</span>
              <span className="sm:hidden">Dhig Ad</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="max-w-4xl mx-auto mt-3 space-y-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Raadi xayeysiis, alaab, ama dukaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Quick Category & City Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <button
              onClick={() => setVideoOnlyFilter(!videoOnlyFilter)}
              className={`px-3 py-1 rounded-xl whitespace-nowrap font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                videoOnlyFilter
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Muuqaallo Kaliya (Videos)</span>
            </button>

            <button
              onClick={() => setSelectedCity('all')}
              className={`px-3 py-1 rounded-xl whitespace-nowrap font-semibold transition-all cursor-pointer ${
                selectedCity === 'all'
                  ? 'bg-teal-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Dhammaan Magaalooyinka
            </button>

            {SOMALI_CITIES.slice(0, 5).map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1 rounded-xl whitespace-nowrap font-semibold transition-all cursor-pointer ${
                  selectedCity === city
                    ? 'bg-teal-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Feed Container */}
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {filteredAds.length === 0 ? (
          <div className="p-10 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <Film className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">
              Weli ma jiraan xayeysiisyo shuruudahan buuxiyay
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Dukaamadu markay xayeysiis cusub soo dhigaan oo Super Admin-ku ansixiyo, halkan ayay toos uga soo muuqanayaan!
            </p>
            <button
              onClick={() => {
                setSelectedCity('all');
                setVideoOnlyFilter(false);
                setSearchQuery('');
              }}
              className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs font-semibold"
            >
              Dib u celi shaandhada
            </button>
          </div>
        ) : (
          filteredAds.map((ad) => {
            const isPlaying = playingVideoId === ad.id;
            const isLiked = likedAdIds.includes(ad.id);
            const totalLikes = (ad.likesCount || 0) + (isLiked ? 1 : 0);

            return (
              <div
                key={ad.id}
                className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl transition-all hover:border-slate-700 space-y-3"
              >
                {/* Store Header */}
                <div className="p-4 flex items-center justify-between gap-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    {ad.storeLogoUrl ? (
                      <img
                        src={ad.storeLogoUrl}
                        alt={ad.storeName}
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-teal-500/30"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-teal-800 text-white font-bold text-sm flex items-center justify-center">
                        {ad.storeName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">
                          {ad.storeName}
                        </span>
                        {ad.isVerifiedAuthentic && (
                          <BadgeCheck className="w-4 h-4 text-teal-400 shrink-0" />
                        )}
                        <span className="text-[10px] font-mono text-teal-300 bg-teal-950 px-1.5 py-0.2 rounded border border-teal-800">
                          {ad.storeCode || 'DUK'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {ad.city}
                        </span>
                        <span>•</span>
                        <span>{ad.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Super Admin Verified Authentic Badge */}
                  <div className="flex flex-col items-end">
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700/50">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Xayeysiis Dhab ah</span>
                    </span>
                    <span className="text-[9.5px] text-slate-500 mt-0.5">La Baaray oo Ansixiyay</span>
                  </div>
                </div>

                {/* Media Container (Video or Image) */}
                <div className="relative bg-black aspect-video sm:aspect-[16/10] overflow-hidden flex items-center justify-center group">
                  {ad.videoUrl ? (
                    <div className="w-full h-full relative flex items-center justify-center">
                      <video
                        id={`ad-video-${ad.id}`}
                        src={ad.videoUrl}
                        poster={ad.imageUrl}
                        muted={isMuted}
                        loop
                        playsInline
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        onClick={() => {
                          const vEl = document.getElementById(`ad-video-${ad.id}`) as HTMLVideoElement;
                          if (vEl) {
                            if (vEl.paused) {
                              vEl.play().catch(() => {});
                              setPlayingVideoId(ad.id);
                            } else {
                              vEl.pause();
                              setPlayingVideoId(null);
                            }
                          }
                        }}
                      />

                      {/* Video Controls Overlay */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
                        <button
                          type="button"
                          onClick={() => setIsMuted(!isMuted)}
                          className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md cursor-pointer transition-colors"
                          title={isMuted ? 'Fur Codka' : 'Aamusii Codka'}
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const vEl = document.getElementById(`ad-video-${ad.id}`) as HTMLVideoElement;
                            if (vEl) {
                              if (vEl.paused) {
                                vEl.play();
                                setPlayingVideoId(ad.id);
                              } else {
                                vEl.pause();
                                setPlayingVideoId(null);
                              }
                            }
                          }}
                          className="p-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold backdrop-blur-md cursor-pointer transition-colors"
                          title={isPlaying ? 'Hakiy' : 'Daaro'}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                        </button>
                      </div>

                      {/* Video Badge */}
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10.5px] font-bold text-amber-300 flex items-center gap-1 border border-white/10">
                        <Film className="w-3 h-3 text-amber-400" />
                        <span>Muuqaal Rasmi ah</span>
                      </div>
                    </div>
                  ) : ad.imageUrl ? (
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500 text-xs">
                      Sawir lama hayo
                    </div>
                  )}

                  {/* Price Badge Overlay */}
                  <div className="absolute bottom-3 left-3 bg-teal-950/90 backdrop-blur-md border border-teal-500/40 px-3 py-1.5 rounded-2xl shadow-lg">
                    <span className="text-[10px] text-teal-300 block font-semibold">Qiimaha:</span>
                    <span className="text-sm sm:text-base font-black text-white">
                      {formatPrice(ad.priceUsd, currency)}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                      {ad.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed whitespace-pre-line">
                      {ad.description}
                    </p>
                  </div>

                  {/* Social Counters & Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(ad.id)}
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isLiked ? 'text-rose-500 font-bold' : 'hover:text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{totalLikes}</span>
                      </button>

                      <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-slate-500" />
                        <span>{ad.viewsCount || 120} daawasho</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleShareAd(ad)}
                      className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copiedAdId === ad.id ? 'Waa la koobiyey!' : 'Wadaag'}</span>
                    </button>
                  </div>

                  {/* Immediate Contact / Order CTAs */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {/* Call CTA */}
                    <a
                      href={`tel:${ad.contactPhone}`}
                      className="py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-teal-400" />
                      <span>Wac Dukaanka</span>
                    </a>

                    {/* WhatsApp CTA */}
                    <a
                      href={`https://wa.me/${ad.contactPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Asc ${ad.storeName}, waxaan arkay xayeysiiskaaga: "${ad.title}" oo qiimihiisu yahay ${formatPrice(ad.priceUsd, currency)}. Fadlan faahfaahin dheeraad ah iga sii.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Order / Add To Cart CTA */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onAddToCart) {
                          const fakeProd: Product = {
                            id: `ad-prod-${ad.id}`,
                            storeId: ad.storeId,
                            storeName: ad.storeName,
                            storeCode: ad.storeCode,
                            name: ad.title,
                            nameSomali: ad.title,
                            category: 'Xayeysiis',
                            priceUsd: ad.priceUsd,
                            stock: 10,
                            rating: 5.0,
                            reviewCount: 1,
                            image: ad.imageUrl || '/app-icon.png',
                            videoUrl: ad.videoUrl,
                            descriptionSomali: ad.description,
                            descriptionEnglish: ad.description,
                          };
                          onAddToCart(fakeProd);
                          onNavigate('customer_home');
                        }
                      }}
                      className="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Dalbo Hadda</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
