
import React, { useState, useMemo, useCallback } from 'react';
import { ProductItem, ComparisonResult } from './types';
import { DEFAULT_PRODUCTS, EUR_TO_BGN } from './constants';
import ProductCard from './components/ProductCard';
import { getShoppingAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>(
    JSON.parse(JSON.stringify(DEFAULT_PRODUCTS))
  );
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const handleUpdate = useCallback((id: string, field: keyof ProductItem, value: any) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  }, []);

  const results = useMemo(() => {
    const calculatedResults: ComparisonResult[] = products.map(p => {
      if (p.weight === '' || p.weight <= 0 || p.priceEur === '' || p.priceEur <= 0) {
        return { id: p.id, pricePerKgEur: 0, pricePerKgBgn: 0, isBestValue: false, totalWeightKg: 0 };
      }

      const qty = p.quantity === '' || p.quantity <= 0 ? 1 : (p.quantity as number);
      const unitWeightKg = p.unit === 'g' ? (p.weight as number) / 1000 : (p.weight as number);
      const totalWeightKg = unitWeightKg * qty;
      
      const pricePerKgEur = (p.priceEur as number) / totalWeightKg;
      const pricePerKgBgn = pricePerKgEur * EUR_TO_BGN;

      return {
        id: p.id,
        pricePerKgEur,
        pricePerKgBgn,
        isBestValue: false,
        totalWeightKg
      };
    });

    const validResults = calculatedResults.filter(r => r.pricePerKgEur > 0);
    if (validResults.length > 0) {
      const minPrice = Math.min(...validResults.map(r => r.pricePerKgEur));
      validResults.forEach(r => {
        if (Math.abs(r.pricePerKgEur - minPrice) < 0.0001) {
          const original = calculatedResults.find(orig => orig.id === r.id);
          if (original) original.isBestValue = true;
        }
      });
    }

    return calculatedResults;
  }, [products]);

  const resetAll = () => {
    setProducts(JSON.parse(JSON.stringify(DEFAULT_PRODUCTS)));
    setAdvice(null);
  };

  const fetchAdvice = async () => {
    setLoadingAdvice(true);
    const result = await getShoppingAdvice(products);
    setAdvice(result);
    setLoadingAdvice(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8 px-4 sm:px-10 overflow-x-hidden">
      <header className="max-w-4xl w-full mb-8 text-center flex flex-col items-center">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl shadow-xl flex items-center justify-center mb-5 rotate-3">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-[900] text-slate-900 tracking-tighter sm:text-5xl uppercase">
          SmartShop
        </h1>
        <p className="mt-2 text-slate-500 text-sm sm:text-lg max-w-md mx-auto font-bold uppercase tracking-widest opacity-80">
          Unit Price Calculator
        </p>
      </header>

      <main className="max-w-7xl w-full flex-grow pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {products.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              result={results[idx].pricePerKgEur > 0 ? results[idx] : undefined}
              onUpdate={handleUpdate}
            />
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-8">
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
            <button
              onClick={resetAll}
              className="w-full sm:w-auto px-10 py-4 bg-white text-slate-900 font-black rounded-2xl border-4 border-slate-200 hover:border-slate-300 transition-all shadow-sm active:scale-95 uppercase tracking-widest text-sm"
            >
              Clear All
            </button>
            <button
              onClick={fetchAdvice}
              disabled={loadingAdvice}
              className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
            >
              {loadingAdvice ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Thinking...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Analyze Value
                </>
              )}
            </button>
          </div>

          {advice && (
            <div className="w-full max-w-3xl bg-white p-8 rounded-[2.5rem] border-4 border-blue-50 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-xl uppercase tracking-tighter leading-none">Smart Insight</h3>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">Calculated by AI</p>
                </div>
              </div>
              <div className="prose prose-slate prose-lg whitespace-pre-wrap text-slate-700 font-bold leading-relaxed">
                {advice}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-8 text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] text-center py-10 border-t border-slate-100 w-full max-w-4xl">
        <p>© {new Date().getFullYear()} SmartShop • 1 EUR = 1.95583 BGN</p>
      </footer>
    </div>
  );
};

export default App;
