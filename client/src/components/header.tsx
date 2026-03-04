import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut } from "lucide-react";
import { useAdmin } from "@/contexts/admin-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const NAV_ITEMS = [
  { label: "About", id: "about" },
  { label: "Setup", id: "setup" },
  { label: "Games", id: "games" },
  { label: "SNS", id: "sns" },
];

export function Header() {
  const [activeSection, setActiveSection] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isProgrammaticScroll = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Admin login dialog (triggered by clicking logo 5 times)
  const { isAdmin, login, logout } = useAdmin();
  const { toast } = useToast();
  const [loginOpen, setLoginOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleLogoClick = () => {
    scrollToTop();
    logoClickCount.current += 1;
    clearTimeout(logoClickTimer.current);
    if (logoClickCount.current >= 5) {
      logoClickCount.current = 0;
      if (isAdmin) {
        logout().then(() => toast({ title: "ログアウトしました" }));
      } else {
        setLoginOpen(true);
      }
    } else {
      logoClickTimer.current = setTimeout(() => { logoClickCount.current = 0; }, 1500);
    }
  };

  const handleLogin = async () => {
    setLoggingIn(true);
    const result = await login(password);
    setLoggingIn(false);
    if (result === true) {
      setLoginOpen(false);
      setPassword("");
      toast({ title: "ログインしました" });
    } else {
      toast({ title: result, variant: "destructive" });
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -40% 0px", threshold: 0 }
    );
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    isProgrammaticScroll.current = true;
    clearTimeout(scrollTimeoutRef.current);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
    setMobileOpen(false);
    scrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 900);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveSection("");
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={
          isScrolled
            ? {
                background: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderBottom: "1px solid rgba(255,255,255,0.8)",
                boxShadow: "0 4px 24px rgba(147,197,253,0.15), 0 1px 0 rgba(255,255,255,0.6)",
              }
            : {
                background: "rgba(255,255,255,0.20)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderBottom: "1px solid rgba(255,255,255,0.4)",
              }
        }
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo — 5回クリックで管理者ログイン/ログアウト */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 group focus:outline-none focus-visible:outline-none"
          >
            <span className="font-display font-bold text-base sm:text-lg text-slate-700 tracking-widest transition-all duration-300 group-hover:text-sky-600">
              My file
            </span>
            <span
              className="font-display font-bold text-base sm:text-lg tracking-widest transition-all duration-300"
              style={{ color: "#38bdf8", filter: "drop-shadow(0 0 6px rgba(56,189,248,0.6))" }}
            >
              .
            </span>
            {isAdmin && (
              <span className="text-[9px] font-bold tracking-widest uppercase text-sky-500 opacity-70 flex items-center gap-0.5">
                <LogOut className="w-2.5 h-2.5" />
                admin
              </span>
            )}
          </button>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.map(({ label, id }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`relative px-4 py-2 text-sm font-display tracking-[0.15em] uppercase transition-all duration-300 rounded-xl focus:outline-none focus-visible:outline-none ${
                    isActive
                      ? "text-sky-600"
                      : "text-slate-500 hover:text-sky-500 hover:bg-sky-50/60"
                  }`}
                  style={{
                    outline: "none",
                    ...(isActive ? { textShadow: "0 0 14px rgba(96,165,250,0.6)" } : {}),
                  }}
                >
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0.5 left-3 right-3 h-px rounded-full"
                      style={{
                        background: "linear-gradient(90deg, #60a5fa, #c084fc, #f472b6)",
                        boxShadow: "0 0 8px rgba(96,165,250,0.7)",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="sm:hidden p-2 text-slate-500 hover:text-sky-500 transition-colors rounded-xl focus:outline-none focus-visible:outline-none hover:bg-sky-50/60"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-16 left-0 right-0 z-40"
            style={{
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderBottom: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "0 8px 32px rgba(147,197,253,0.15)",
            }}
          >
            <nav className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-1">
              {NAV_ITEMS.map(({ label, id }) => {
                const isActive = activeSection === id;
                return (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className={`text-left px-4 py-3 text-base font-display tracking-widest uppercase transition-all duration-200 rounded-xl focus:outline-none focus-visible:outline-none ${
                      isActive
                        ? "text-sky-600 bg-sky-50/80"
                        : "text-slate-500 hover:text-sky-500 hover:bg-sky-50/60"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Admin login dialog */}
      <Dialog open={loginOpen} onOpenChange={(o) => { setLoginOpen(o); setPassword(""); }}>
        <DialogContent
          className="sm:max-w-xs rounded-2xl"
          style={{ background: "rgba(255,255,255,0.94)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.8)" }}
        >
          <DialogHeader>
            <DialogTitle className="font-display text-slate-700 text-base tracking-wider">
              管理者ログイン
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
            className="space-y-4 mt-2"
          >
            <Input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-xl border-slate-200 focus-visible:ring-sky-400 bg-white text-slate-700"
              autoFocus
            />
            <Button
              type="submit"
              className="w-full h-10 rounded-xl font-display tracking-wider text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #60a5fa, #c084fc)", color: "white" }}
              disabled={loggingIn || !password}
            >
              {loggingIn ? "..." : "ログイン"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
