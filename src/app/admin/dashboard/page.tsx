'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { BiFolderPlus, BiDish } from 'react-icons/bi';
import { FiFolder, FiEdit2, FiList, FiTrash2, FiLogOut, FiHome } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

type Food = {
  id: number;
  name: string;
  price: number;
  image: string;
  categoryId?: number;
  category?: Category;
};

type Category = {
  id: number;
  name: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [catName, setCatName] = useState('');
  const [catLoading, setCatLoading] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // دریافت غذاها و دسته‌بندی‌ها از API
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await Promise.all([fetchFoods(), fetchCategories()]);
      } catch (err) {
        setError('خطا در دریافت اطلاعات');
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // بررسی وجود توکن در کوکی
    const token = Cookies.get('admin_token');
    if (!token) {
      router.push('/admin/login');
    }
    loadInitialData();
  }, [router]);

  const fetchFoods = async (query: string = '') => {
    try {
      const url = query ? `/api/food/search?q=${encodeURIComponent(query)}` : '/api/food';
      const res = await fetch(url);
      if (!res.ok) throw new Error('خطا در دریافت اطلاعات');
      const data = await res.json();
      setFoods(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching foods:', err);
      setError('خطا در دریافت اطلاعات غذاها');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/category');
      if (!res.ok) throw new Error('خطا در دریافت اطلاعات');
      const data = await res.json();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('خطا در دریافت اطلاعات دسته‌بندی‌ها');
    }
  };

  // جستجوی غذاها
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setIsLoading(true);
    
    const timeout = setTimeout(async () => {
      await fetchFoods(value);
      setIsLoading(false);
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const addFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !image || !categoryId) {
      alert('لطفاً همه فیلدها را پر کنید');
      return;
    }

    if (isNaN(Number(price))) {
      alert('لطفاً قیمت را به صورت عدد وارد کنید');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Sending food data:', {
        name,
        price: Number(price),
        image,
        categoryId: Number(categoryId)
      });

      const res = await fetch('/api/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price: Number(price),
          image,
          categoryId: Number(categoryId)
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'خطا در ایجاد غذا');
      }

      setFoods([data, ...foods]);
      setName('');
      setPrice('');
      setImage('');
      setCategoryId('');
      setError(null);
      alert('غذا با موفقیت اضافه شد');
    } catch (err) {
      console.error('Error creating food:', err);
      setError(err instanceof Error ? err.message : 'خطا در ایجاد غذا');
      alert(err instanceof Error ? err.message : 'خطا در ایجاد غذا');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;
    setCatLoading(true);
    const res = await fetch('/api/category', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: catName }),
    });
    if (res.ok) {
      const newCat = await res.json();
      setCategories([...categories, newCat]);
      setCatName('');
    }
    setCatLoading(false);
  };

  const startEdit = (food: Food) => {
    setEditingFood(food);
    setName(food.name);
    setPrice(food.price.toString());
    setImage(food.image);
    setCategoryId(food.categoryId || '');
    setShowEditModal(true);
  };

  const cancelEdit = () => {
    setEditingFood(null);
    setName('');
    setPrice('');
    setImage('');
    setCategoryId('');
    setShowEditModal(false);
  };

  const saveEdit = async () => {
    if (!editingFood) return;
    if (!name || !price || !image || !categoryId) {
      alert('لطفاً همه فیلدها را پر کنید');
      return;
    }

    if (isNaN(Number(price))) {
      alert('لطفاً قیمت را به صورت عدد وارد کنید');
      return;
    }

    setEditLoading(true);

    const res = await fetch(`/api/food/${editingFood.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        price: Number(price),
        image,
        categoryId: Number(categoryId)
      }),
    });

    if (res.ok) {
      const updatedFood = await res.json();
      setFoods(foods.map(f => f.id === updatedFood.id ? updatedFood : f));
      cancelEdit();
    }

    setEditLoading(false);
  };

  const deleteFood = async (id: number) => {
    if (!confirm('آیا از حذف این غذا مطمئن هستید؟')) return;

    const res = await fetch(`/api/food/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setFoods(foods.filter(f => f.id !== id));
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm('آیا از حذف این دسته‌بندی مطمئن هستید؟')) return;
    
    const res = await fetch(`/api/category/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setCategories(categories.filter(c => c.id !== id));
      // به‌روزرسانی غذاهایی که این دسته‌بندی را داشتند
      fetchFoods(searchQuery);
    }
  };

  const handleLogout = () => {
    // حذف توکن و ریدایرکت به صفحه لاگین
    Cookies.remove('admin_token');
    router.push('/admin/login');
  };

  return (
    <main dir="rtl" className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-800/30 p-4 md:p-6 rounded-2xl border border-zinc-700/50">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            داشبورد مدیریت
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-xl bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-300 transition-colors"
              title="بازگشت به صفحه اصلی"
            >
              <FiHome className="w-5 h-5" />
            </button>
            <div className="px-4 py-2 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
              <span className="text-zinc-400 ml-1">غذا:</span>
              <span className="text-emerald-400 font-medium">{foods.length}</span>
            </div>
            <div className="px-4 py-2 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
              <span className="text-zinc-400 ml-1">دسته‌بندی:</span>
              <span className="text-blue-400 font-medium">{categories.length}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              title="خروج"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-8">
          {/* فرم‌های مدیریت */}
          <div className="col-span-12 lg:col-span-4 space-y-4 md:space-y-8">
            {/* فرم افزودن دسته‌بندی */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <FiFolder className="w-5 h-5" />
                  </span>
                  دسته‌بندی‌ها
                </h2>
                <div className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 text-sm">
                  {categories.length} دسته‌بندی
                </div>
              </div>

              <form onSubmit={addCategory} className="space-y-4" dir="rtl">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="نام دسته‌بندی جدید را وارد کنید"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="flex-1 p-3 rounded-xl bg-zinc-700/50 border border-zinc-600/50 focus:border-blue-500/50 focus:bg-zinc-700/80 focus:outline-none transition-all text-right placeholder:text-zinc-500"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 px-6 rounded-xl font-bold text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 min-w-[48px] h-12 flex items-center justify-center"
                    disabled={catLoading}
                  >
                    {catLoading ? '...' : <BiFolderPlus className="w-6 h-6" />}
                  </button>
                </div>
              </form>

              {/* لیست دسته‌بندی‌ها */}
              <div className="border-t border-zinc-700/50 pt-4">
                <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {categories.length === 0 ? (
                    <div className="text-center py-4 text-zinc-500 text-sm">
                      هنوز دسته‌بندی‌ای اضافه نشده است
                    </div>
                  ) : (
                    categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="group flex items-center justify-between p-2 rounded-lg hover:bg-zinc-700/30 border border-zinc-600/30 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-400 text-sm">
                            <FiFolder className="w-4 h-4" />
                          </span>
                          <span className="text-sm font-medium">{cat.name}</span>
                        </div>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-all text-sm"
                          title="حذف دسته‌بندی"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* فرم افزودن غذا */}
            <div className="bg-zinc-800/40 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-zinc-700/50 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <BiDish className="w-5 h-5" />
                </span>
                غذای جدید
              </h2>
              <form onSubmit={addFood} className="space-y-4" dir="rtl">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">نام غذا</label>
                    <input
                      type="text"
                      placeholder="مثال: چلو کباب"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 rounded-xl bg-zinc-700/50 border border-zinc-600/50 focus:border-emerald-500/50 focus:bg-zinc-700/80 focus:outline-none transition-all text-right placeholder:text-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">قیمت (تومان)</label>
                    <input
                      type="text"
                      placeholder="مثال: 120000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full p-3 rounded-xl bg-zinc-700/50 border border-zinc-600/50 focus:border-emerald-500/50 focus:bg-zinc-700/80 focus:outline-none transition-all text-right placeholder:text-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">آدرس تصویر</label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="http://example.com/image.jpg"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full p-3 rounded-xl bg-zinc-700/50 border border-zinc-600/50 focus:border-emerald-500/50 focus:bg-zinc-700/80 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1.5">دسته‌بندی</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-3 rounded-xl bg-zinc-700/50 border border-zinc-600/50 focus:border-emerald-500/50 focus:bg-zinc-700/80 focus:outline-none transition-all text-right"
                    >
                      <option value="">انتخاب کنید</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 p-3 rounded-xl font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  disabled={loading}
                >
                  {loading ? 'در حال افزودن...' : 'افزودن غذا +'}
                </button>
              </form>
            </div>
          </div>

          {/* لیست غذاها */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-zinc-800/40 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-zinc-700/50 shadow-lg min-h-[calc(100vh-12rem)]">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-zinc-700/50 flex items-center justify-center text-zinc-300">
                      <FiList className="w-5 h-5" />
                    </span>
                    لیست غذاها
                  </h2>
                  <div className="flex items-center gap-2">
                    {searchQuery && (
                      <div className="animate-fade-in px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 text-sm">
                        نتایج جستجو: {foods.length}
                      </div>
                    )}
                    <div className="px-3 py-1.5 bg-zinc-800/50 rounded-lg border border-zinc-700/50 text-sm">
                      <span className="text-emerald-400 font-medium">{foods.length}</span>
                      <span className="text-zinc-400 mr-2">مورد</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="جستجو در نام غذاها..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full p-3 pr-10 rounded-xl bg-zinc-700/50 border border-zinc-600/50 focus:border-emerald-500/50 focus:bg-zinc-700/80 focus:outline-none transition-all text-right placeholder:text-zinc-500"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 flex items-center gap-2">
                    {searchQuery && (
                      <button
                        onClick={() => handleSearch('')}
                        className="w-6 h-6 rounded-md hover:bg-zinc-600/50 flex items-center justify-center transition-colors"
                        title="پاک کردن جستجو"
                      >
                        ×
                      </button>
                    )}
                    
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {error && (
                  <div className="col-span-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
                    {error}
                  </div>
                )}
                {isLoading ? (
                  <div className="col-span-full h-52 flex items-center justify-center">
                    <div className="animate-pulse text-zinc-500">در حال بارگذاری...</div>
                  </div>
                ) : (
                  <>
                    {foods.map((food) => (
                      <div
                        key={food.id}
                        className="group bg-zinc-800/40 rounded-2xl overflow-hidden border border-zinc-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="relative h-52 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
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
                          <div className="absolute bottom-3 right-3 z-20 flex flex-row-reverse items-center gap-2">
                            <span className="px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-xl text-sm font-medium border border-white/10">
                              {food.category?.name || 'بدون دسته‌بندی'}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-lg font-bold group-hover:text-emerald-400 transition-colors text-right">{food.name}</h3>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => startEdit(food)}
                                className="w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center text-blue-400 hover:text-blue-300 transition-all"
                                title="ویرایش"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => deleteFood(food.id)}
                                className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 hover:text-red-300 transition-all"
                                title="حذف"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-emerald-400 font-medium flex items-center gap-1">
                              <span className="text-sm text-zinc-400">تومان</span>
                              <span>{food.price.toLocaleString()}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!isLoading && foods.length === 0 && (
                      <div className="col-span-full text-center py-12 text-zinc-500">
                        {searchQuery ? 'نتیجه‌ای یافت نشد' : 'هنوز غذایی اضافه نشده است'}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* مودال ویرایش */}
      <EditFoodModal
        show={showEditModal}
        onClose={cancelEdit}
        onSave={saveEdit}
        loading={editLoading}
        name={name}
        setName={setName}
        price={price}
        setPrice={setPrice}
        image={image}
        setImage={setImage}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        categories={categories}
      />
    </main>
  );
}

// Modal کامپوننت برای ویرایش غذا
function EditFoodModal({ 
  show, 
  onClose,
  onSave,
  loading,
  name,
  setName,
  price,
  setPrice,
  image,
  setImage,
  categoryId,
  setCategoryId,
  categories
}: {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  loading: boolean;
  name: string;
  setName: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  image: string;
  setImage: (value: string) => void;
  categoryId: number | '';
  setCategoryId: (value: number | '') => void;
  categories: Category[];
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-800 rounded-2xl w-full max-w-lg border border-zinc-700" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-zinc-700">
          <h3 className="text-xl font-bold">ویرایش غذا</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">نام غذا</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-700/50 border border-zinc-600/50 focus:border-emerald-500/50 focus:bg-zinc-700/80 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">قیمت (تومان)</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-700/50 border border-zinc-600/50 focus:border-emerald-500/50 focus:bg-zinc-700/80 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">آدرس تصویر</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-700/50 border border-zinc-600/50 focus:border-emerald-500/50 focus:bg-zinc-700/80 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">دسته‌بندی</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
              className="w-full p-3 rounded-xl bg-zinc-700/50 border border-zinc-600/50 focus:border-emerald-500/50 focus:bg-zinc-700/80 focus:outline-none transition-all"
            >
              <option value="">انتخاب کنید</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-6 border-t border-zinc-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors"
          >
            انصراف
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
        </div>
      </div>
    </div>
  );
}