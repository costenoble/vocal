"use client";

import { useEffect, useState } from "react";

// Panier stocké côté navigateur (localStorage). Chaque article contient tout
// ce qui est nécessaire pour créer la commande : le produit, la taille, et la
// personnalisation complète (dont l'URL de l'audio déjà uploadé).
export interface CartItem {
  id: string; // identifiant client unique
  productSlug: string;
  productName: string;
  productSize: string;
  price: number;
  imageUrl: string;
  fromName: string;
  toName: string;
  date: string;
  theme: string;
  paper: string;
  cardFont: string;
  message: string;
  audioUrl: string;
  duration?: number;
}

const KEY = "nj_cart_v1";
const EVENT = "nj-cart-changed";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function getCart(): CartItem[] {
  return read();
}

export function addToCart(item: Omit<CartItem, "id">): CartItem {
  const full: CartItem = { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
  write([...read(), full]);
  return full;
}

export function removeFromCart(id: string) {
  write(read().filter((i) => i.id !== id));
}

export function clearCart() {
  write([]);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + (i.price || 0), 0);
}

// Hook réactif : renvoie le panier et se met à jour à chaque changement
// (même depuis un autre onglet).
export function useCart(): CartItem[] {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return items;
}
