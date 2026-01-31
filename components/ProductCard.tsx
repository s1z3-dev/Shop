
import React from 'react';
import { ProductItem, WeightUnit } from '../types';
import { EUR_TO_BGN } from '../constants';

interface ProductCardProps {
  product: ProductItem;
  result?: {
    pricePerKgEur: number;
    pricePerKgBgn: number;
    isBestValue: boolean;
    totalWeightKg: number;
  };
  onUpdate: (id: string, field: keyof ProductItem, value: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, result, onUpdate }) => {
  const handleChange = (field: keyof ProductItem, value: string) => {
    if (field === 'weight' || field === 'priceEur' || field === 'quantity') {
      const num = value === '' ? '' : parseFloat(value);
      onUpdate(product.id, field, num);
    } else {
      onUpdate(product.id, field, value);
    }
  };

  const bgnValue = product.priceEur !== '' ? (Number(product.priceEur) * EUR_TO_BGN).toFixed(2) : '0.00';
  const totalWeightStr = result ? `${result.totalWeightKg.toFixed(2)} kg` : '0.00 kg';

  return (
    <div className={`relative p-5 rounded-2xl transition-all duration-300 border-2 flex flex-col h-full ${
      result?.isBestValue 
        ? 'bg-white border-emerald-500 shadow-xl ring-4 ring-emerald-500/10 scale-[1.02] z-10' 
        : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
    }`}>
      {result?.isBestValue && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg whitespace-nowrap">
          Best Value
        </div>
      )}

      <div className="space-y-4 flex-grow">
        <div>
          <label className="block text-[11px] font-black text-slate-500 uppercase mb-1 tracking-widest">Item Name</label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 text-base font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            placeholder="e.g. Ribs Pack"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-1">
            <label className="block text-[11px] font-black text-slate-500 uppercase mb-1 tracking-widest">Weight/Size</label>
            <input
              type="number"
              inputMode="decimal"
              value={product.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 text-base font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-[11px] font-black text-slate-500 uppercase mb-1 tracking-widest">Unit</label>
            <select
              value={product.unit}
              onChange={(e) => handleChange('unit', e.target.value as WeightUnit)}
              className="w-full px-3 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 text-base font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer appearance-none"
            >
              <option value="g">g / ml</option>
              <option value="kg">kg / L</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-black text-slate-500 uppercase mb-1 tracking-widest">Quantity in Pack</label>
          <div className="relative">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">×</span>
             <input
              type="number"
              inputMode="numeric"
              value={product.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              className="w-full pl-8 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 text-base font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
              placeholder="1"
            />
          </div>
          {result && (
            <div className="mt-1 text-[10px] text-slate-400 font-bold uppercase text-right">
              Total Weight: <span className="text-slate-600">{totalWeightStr}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-black text-slate-500 uppercase mb-1 tracking-widest">Price (€ Total)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-base">€</span>
            <input
              type="number"
              inputMode="decimal"
              value={product.priceEur}
              onChange={(e) => handleChange('priceEur', e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 text-base font-black placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
              placeholder="0.00"
            />
          </div>
          
          <div className="mt-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-center justify-between">
             <span className="text-[10px] text-blue-400 font-black uppercase tracking-tighter leading-none">Total BGN</span>
             <span className="text-xl font-black text-blue-700 tabular-nums">
               {bgnValue} <span className="text-xs">BGN</span>
             </span>
          </div>
        </div>

        {result && result.pricePerKgEur > 0 && (
          <div className="pt-5 border-t-2 border-dashed border-slate-100 mt-2">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Price Insight</span>
              <div className="flex flex-col gap-0">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 tabular-nums">
                    €{result.pricePerKgEur.toFixed(2)}
                  </span>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">
                    per kg/L
                  </span>
                </div>
                <div className="text-xl font-black text-blue-600 tabular-nums flex items-baseline gap-1">
                  <span>{result.pricePerKgBgn.toFixed(2)}</span>
                  <span className="text-[11px] uppercase tracking-tighter">BGN / kg</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
