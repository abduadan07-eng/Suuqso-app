import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Store, Check, CheckCheck, Clock, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Store as StoreType, Product, ChatMessage } from '../../types';

interface InAppChatModalProps {
  store: StoreType;
  product?: Product | null;
  messages: ChatMessage[];
  onSendMessage: (storeId: string, text: string, product?: Product | null) => void;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
}

export const InAppChatModal: React.FC<InAppChatModalProps> = ({
  store,
  product,
  messages,
  onSendMessage,
  onClose,
  onAddToCart,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const storeMessages = messages.filter((m) => m.storeId === store.id);

  const quickPrompts = [
    'Asc, alaabtaan ma diyaar baa?',
    'Magaalada ma iigu keenaysaan?',
    'Qiimo dhimis ma leedahay?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [storeMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(store.id, inputText.trim(), product);
    setInputText('');
  };

  const handleQuickPromptClick = (prompt: string) => {
    onSendMessage(store.id, prompt, product);
  };

  const lastMessage = storeMessages[storeMessages.length - 1];
  const isWaitingForStore = lastMessage && lastMessage.sender === 'customer';

  // Check if store has dedicated customer service employee
  const customerServiceStaff = store.employees?.find(
    (e) => e.role === 'customer_service' && e.isActive
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in select-none">
      <div className="bg-white w-full sm:max-w-md h-[92vh] sm:h-[620px] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Chat Header */}
        <div className="bg-teal-900 text-white p-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-700 border-2 border-teal-500/40 flex items-center justify-center font-bold text-sm text-teal-100">
              {store.avatar || store.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white leading-tight">
                  {store.name}
                </h3>
                {store.storeType === 'large' ? (
                  <span className="text-[10px] bg-teal-800 text-teal-200 px-1.5 py-0.2 rounded font-medium">
                    Dukaan Weyn
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-medium">
                    Dukaan Yar
                  </span>
                )}
              </div>
              <span className="text-[11px] text-teal-200 flex items-center gap-1">
                <span>
                  {customerServiceStaff
                    ? `U xilsaaran: ${customerServiceStaff.name} (Adeegga Macmiilka)`
                    : `Maamulaha: ${store.adminName} (Direct Admin)`}
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-teal-800 text-teal-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Inquired Banner (if chat initiated from product) */}
        {product && (
          <div className="bg-teal-50/90 border-b border-teal-100 p-2.5 px-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={product.image}
                alt={product.nameSomali}
                className="w-10 h-10 rounded-lg object-cover bg-white shrink-0 border border-teal-200"
              />
              <div className="min-w-0">
                <span className="text-[10px] text-teal-800 font-semibold block uppercase">
                  Alaabta aad weydiinayso:
                </span>
                <p className="font-bold text-slate-900 truncate">
                  {product.nameSomali}
                </p>
                <span className="text-teal-700 font-bold tabular-nums">
                  ${product.priceUsd}
                </span>
              </div>
            </div>

            {onAddToCart && (
              <button
                onClick={() => onAddToCart(product)}
                className="py-1.5 px-2.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Ku Dar Gaariga</span>
              </button>
            )}
          </div>
        )}

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          <div className="text-center my-1">
            <span className="text-[10px] text-slate-400 bg-white border border-slate-200/80 px-2 py-0.5 rounded-full">
              Fariimaha tooska ah ee adiga iyo {store.name} ({store.storeCode})
            </span>
          </div>

          {storeMessages.map((msg) => {
            const isCustomer = msg.sender === 'customer';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isCustomer ? 'items-end' : 'items-start'
                }`}
              >
                {!isCustomer && (
                  <span className="text-[10px] text-teal-800 font-bold mb-0.5 px-1">
                    {msg.senderName || store.adminName}
                  </span>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed ${
                    isCustomer
                      ? 'bg-teal-700 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px] text-slate-400">
                  <span>{msg.timestamp}</span>
                  {isCustomer && <CheckCheck className="w-3 h-3 text-teal-600" />}
                </div>
              </div>
            );
          })}

          {/* Real Waiting Status Banner (No AI auto-reply: Macmiilku waa inuu sugo shaqaalaha ama adminka) */}
          {isWaitingForStore && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 shadow-sm animate-pulse">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-950">
                  Fariintaadu waxay toos u gaartay dukaanka:
                </span>
                <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                  Fadlan sug, {customerServiceStaff ? `shaqaalaha u xilsaaran (${customerServiceStaff.name})` : `milkiilaha dukaanka (${store.adminName})`} ayaa hadda toos kuugu soo jawaabaya...
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPromptClick(qp)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-200 text-slate-600 border border-slate-200 rounded-full text-[11px] whitespace-nowrap transition-colors cursor-pointer"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Qor fariintaada halkaan..."
            className="flex-1 px-3.5 py-2.5 bg-slate-100 rounded-xl text-xs text-slate-900 placeholder:text-slate-500 border border-transparent focus:border-teal-500 focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 disabled:opacity-40 text-white transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
