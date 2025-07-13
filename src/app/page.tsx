'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { BiSearch } from 'react-icons/bi';
import { IoClose } from 'react-icons/io5';

type FoodWithCategory = {
  id: number;
  name: string;
  price: number;
  image: string;
  category?: { id: number; name: string } | null;
};

export default function HomePage() {
  const [foods, setFoods] = useState<FoodWithCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const res = await fetch('/api/food');
      if (!res.ok) throw new Error('خطا در دریافت اطلاعات');
      const data = await res.json();
      setFoods(data);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  // فیلتر کردن غذاها بر اساس جستجو
  const filteredFoods = foods.filter(food => 
    food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    food.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // گروه‌بندی غذاها بر اساس دسته‌بندی
  const grouped: Record<string, FoodWithCategory[]> = {};
  for (const food of filteredFoods) {
    const cat = food.category?.name || 'بدون دسته‌بندی';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(food);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl mb-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">منو هتل پارادایس</h1>
          <p className="text-zinc-400 text-sm">غذاهای خوشمزه ما را کشف کنید</p>
        </div>
        
        {/* باکس جستجو */}
        <div className="relative mx-auto max-w-md">
          <input
            type="text"
            placeholder="جستجو در منو..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 pr-12 rounded-xl bg-zinc-800/50 border border-zinc-700 focus:border-emerald-500/50 focus:outline-none transition-all text-right placeholder:text-zinc-500"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <BiSearch size={20} />
          </div>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300 transition-colors p-1"
            >
              <IoClose size={18} />
            </button>
          )}
        </div>

        {/* نمایش وضعیت جستجو */}
        {searchQuery && (
          <div className="text-center text-sm text-zinc-400">
            {Object.values(grouped).reduce((acc, curr) => acc + curr.length, 0)} نتیجه برای &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      <div className="w-full max-w-4xl flex flex-col gap-8">
        {loading ? (
          <div className="text-center py-12 text-zinc-500">در حال بارگذاری...</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12 text-zinc-500">موردی یافت نشد</div>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <section key={cat}>
              <h2 className="text-xl font-bold mb-4 border-b border-zinc-700 pb-1">{cat}</h2>
              <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 md:grid-cols-3">
                {items.map((food) => (
                  <div
                    key={food.id}
                    className="group bg-zinc-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-zinc-700/30 shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-[1.02] flex sm:block h-24 sm:h-auto relative"
                  >
                    <div className="w-32 sm:w-full h-24 sm:h-48 shrink-0 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative w-full h-full">
                        <Image 
                          src={food.image} 
                          alt={food.name}
                          fill
                          className="object-cover transform group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-food.jpg';
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-center sm:block relative">
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold line-clamp-2 min-h-[3.5rem] group-hover:text-emerald-400 transition-colors">
                          {food.name}
                        </h3>
                        <p className="text-sm flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent font-bold">
                          <span>{food.price.toLocaleString()}</span>
                          <span className="text-zinc-400 text-xs">تومان</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
}