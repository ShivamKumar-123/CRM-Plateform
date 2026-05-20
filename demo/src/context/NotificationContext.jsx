import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { api } from "../lib/api.js";
import { randomNotification } from "../lib/fakeData.js";
import { useIndustry } from "./IndustryContext.jsx";

const NotificationContext = createContext(null);

/**
 * Fake real-time notifications. Pushes a new notification every 20-40 seconds
 * while the tab is visible. Also exposes a tiny WebAudio "ping" toggle.
 */
export function NotificationProvider({ children }) {
  const { industry } = useIndustry();
  const industryRef = useRef(industry);
  industryRef.current = industry;

  const [items, setItems] = useState(() => api.listNotifications());
  const [soundEnabled, setSoundEnabled] = useState(() => api.getPreferences().soundEnabled);
  const [enabled, setEnabled] = useState(() => api.getPreferences().notificationsEnabled);

  const refresh = useCallback(() => setItems(api.listNotifications()), []);

  const ping = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880;
      o.type = "sine";
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      o.start();
      o.stop(ctx.currentTime + 0.42);
    } catch { /* ignore */ }
  }, [soundEnabled]);

  // Push a fake notification, persist + chime.
  const generate = useCallback(() => {
    const n = randomNotification(industryRef.current);
    api.pushNotification(n);
    setItems(api.listNotifications());
    ping();
    return n;
  }, [ping]);

  // Background interval. Restart whenever `enabled` flips.
  useEffect(() => {
    if (!enabled) return undefined;
    let timer;
    const schedule = () => {
      const delay = 20_000 + Math.random() * 20_000; // 20-40s
      timer = setTimeout(() => {
        if (!document.hidden) generate();
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [enabled, generate]);

  const markRead = useCallback((id) => { api.markNotificationRead(id); refresh(); }, [refresh]);
  const markAllRead = useCallback(() => { api.markAllNotificationsRead(); refresh(); }, [refresh]);
  const clearAll = useCallback(() => { api.clearNotifications(); refresh(); }, [refresh]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((s) => {
      const next = !s;
      api.setPreferences({ soundEnabled: next });
      return next;
    });
  }, []);

  const toggleEnabled = useCallback(() => {
    setEnabled((e) => {
      const next = !e;
      api.setPreferences({ notificationsEnabled: next });
      return next;
    });
  }, []);

  const unread = items.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      items, unread, enabled, soundEnabled,
      generate, markRead, markAllRead, clearAll,
      toggleSound, toggleEnabled, refresh,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationProvider>");
  return ctx;
}
