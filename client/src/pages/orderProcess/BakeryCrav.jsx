import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MdAdd, MdRemove, MdShoppingCart } from "react-icons/md";
import useAuth from "../../context/useAuth";
import { buildCheckoutDataFromRestaurant, storeCheckoutData } from "../../utils/checkoutStorage";

const assetBase = import.meta.env.BASE_URL;
const BAKERY_CART_KEY = "bakerycrav_cart";

const bakeryItems = [
  { id: "bakery-cake", name: "Celebration Cake", description: "Soft vanilla cake with creamy frosting", price: 299, emoji: "🎂", search: "cake" },
  { id: "bakery-pastry", name: "Fresh Pastry", description: "Buttery pastry with chocolate cream", price: 99, model: "cravings-muffin.glb", search: "pastry" },
  { id: "bakery-kurkure", name: "Kurkure Crunch", description: "Spicy masala snack for every craving", price: 49, emoji: "🍟", search: "kurkure" },
  { id: "bakery-pizza", name: "Loaded Pizza", description: "Cheesy pizza with delicious toppings", price: 249, emoji: "🍕", search: "pizza" },
  { id: "bakery-burger", name: "Classic Burger", description: "Juicy burger with fresh crunchy layers", price: 199, model: "cravings-burger.glb", search: "burger" },
  { id: "bakery-popcorn", name: "Movie Popcorn", description: "Buttery caramel popcorn bucket", price: 129, emoji: "🍿", search: "popcorn" },
];

const BakeryCrav = () => {
  const navigate = useNavigate();
  const { isLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(BAKERY_CART_KEY)) || [];
    } catch {
      return [];
    }
  });
  const selectedDish = searchParams.get("dish");

  useEffect(() => {
    localStorage.setItem(BAKERY_CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const visibleItems = useMemo(() => selectedDish
    ? bakeryItems.filter((item) => item.search === selectedDish)
    : bakeryItems, [selectedDish]);

  const addToCart = (item) => setCart((current) => {
    const existing = current.find((cartItem) => cartItem.id === item.id);
    return existing
      ? current.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem)
      : [...current, { ...item, quantity: 1 }];
  });

  const updateQuantity = (id, change) => setCart((current) => current
    .map((item) => item.id === id ? { ...item, quantity: item.quantity + change } : item)
    .filter((item) => item.quantity > 0));

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleOrder = () => {
    if (!isLogin) {
      navigate("/login");
      return;
    }
    storeCheckoutData(buildCheckoutDataFromRestaurant({
      id: "bakery-crav",
      name: "BakeryCrav",
      image: "",
      city: "",
      address: "BakeryCrav Kitchen",
      geolocation: { lat: 0, lng: 0 },
    }, cart));
    localStorage.removeItem(BAKERY_CART_KEY);
    navigate("/checkout");
  };

  return (
    <main className="min-h-screen bg-[#fff7f1] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] bg-gradient-to-r from-[#3b160d] via-[#8f2f13] to-orange-600 p-6 text-white shadow-xl sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-200">Special restaurant menu</p>
          <div className="mt-2 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><h1 className="text-4xl font-black sm:text-5xl">BakeryCrav</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/75">All your favourite 3D cravings in one place. Add cake, pastry, kurkure, pizza, burger or popcorn to your cart.</p></div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold backdrop-blur"><MdShoppingCart className="mr-2 inline text-xl" />{cart.reduce((sum, item) => sum + item.quantity, 0)} items</div>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => {
            const quantity = cart.find((cartItem) => cartItem.id === item.id)?.quantity || 0;
            return <article key={item.id} className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-[0_18px_45px_rgba(113,52,18,0.1)]">
              <div className="relative grid h-64 place-items-center bg-gradient-to-br from-orange-50 via-pink-50 to-amber-100">
                {item.model ? <model-viewer src={`${assetBase}${item.model}`} alt={item.name} camera-controls disable-zoom disable-pan auto-rotate autoplay shadow-intensity="1.5" className="h-56 w-full" /> : <span className="cravings-emoji-rotate text-[8rem] drop-shadow-[0_18px_12px_rgba(113,52,18,0.2)]">{item.emoji}</span>}
                <span className="absolute bottom-3 left-4 rounded-full bg-white/85 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-orange-700">3D dish</span>
              </div>
              <div className="p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-black text-slate-900">{item.name}</h2><p className="mt-1 text-sm text-slate-500">{item.description}</p></div><b className="text-lg text-orange-700">₹{item.price}</b></div>{quantity ? <div className="mt-5 flex items-center justify-between rounded-2xl bg-orange-50 p-2"><span className="px-2 text-sm font-bold text-orange-700">In cart</span><div className="flex items-center gap-3"><button type="button" onClick={() => updateQuantity(item.id, -1)} className="grid h-9 w-9 place-items-center rounded-full bg-white text-orange-700 shadow"><MdRemove /></button><b>{quantity}</b><button type="button" onClick={() => updateQuantity(item.id, 1)} className="grid h-9 w-9 place-items-center rounded-full bg-orange-600 text-white shadow"><MdAdd /></button></div></div> : <button type="button" onClick={() => addToCart(item)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-3 text-sm font-black text-white transition hover:bg-orange-700"><MdAdd /> Add to cart</button>}</div>
            </article>;
          })}
        </div>

        {cart.length > 0 && <div className="sticky bottom-4 z-30 mx-auto mt-8 flex max-w-2xl items-center justify-between gap-4 rounded-2xl bg-slate-900 p-4 text-white shadow-2xl"><div><p className="text-xs font-bold uppercase tracking-wider text-white/60">BakeryCrav cart</p><p className="text-xl font-black">₹{total}</p></div><button type="button" onClick={handleOrder} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black transition hover:bg-orange-600">Order now</button></div>}
      </div>
    </main>
  );
};

export default BakeryCrav;
