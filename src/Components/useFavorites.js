import { useState, useCallback } from "react";

/**
 * useFavorites
 * Manages a favorites list in sessionStorage.
 * Returns helpers to toggle favorites and check if an item is favorited.
 * If the user is not logged in, returns a navigate-to-login function instead.
 */
export function useFavorites() {
  const getStored = () => {
    try {
      return JSON.parse(sessionStorage.getItem("favorites") || "[]");
    } catch { return []; }
  };

  const [favorites, setFavorites] = useState(getStored);

  const isLoggedIn = () => sessionStorage.getItem("loggedIn") === "true";

  const isFavorited = useCallback((id) => {
    return favorites.some(f => f.id === id);
  }, [favorites]);

  // Returns true if successful, false if not logged in
  const toggleFavorite = useCallback((item) => {
    if (!isLoggedIn()) return false;

    setFavorites(prev => {
      const exists = prev.some(f => f.id === item.id);
      const next = exists
        ? prev.filter(f => f.id !== item.id)
        : [...prev, item];
      sessionStorage.setItem("favorites", JSON.stringify(next));
      return next;
    });
    return true;
  }, []);

  return { favorites, isFavorited, toggleFavorite };
}