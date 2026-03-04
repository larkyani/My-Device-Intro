import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

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
          {/* Logo */}
          <button
            onClick={scrollToTop}
            className="flex items-center group focus:outline-none focus-visible:outline-none"
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
    </>
  );
}
