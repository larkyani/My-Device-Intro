import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Twitter, Github, Youtube, Instagram, Twitch, Linkedin,
  Link2, Plus, Trash2, Edit, ExternalLink, Heart, MessageCircle, Music2, Edit2
} from "lucide-react";
import { useAdmin } from "@/contexts/admin-context";
import { useSnsLinks, useCreateSnsLink, useUpdateSnsLink, useDeleteSnsLink } from "@/hooks/use-sns";
import { useSiteConfig, useUpdateSiteConfig } from "@/hooks/use-site-config";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSnsLinkSchema, type InsertSnsLink, type SnsLink } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlatformConfig {
  icon: React.ElementType;
  iconColor: string;
  cardBg: string;
  cardBorder: string;
  hoverShadow: string;
  badgeText: string;
  label: string;
}

const PLATFORM_CONFIG: Record<string, PlatformConfig> = {
  Twitter: {
    icon: Twitter,
    iconColor: "#0ea5e9",
    cardBg: "rgba(224,242,254,0.6)",
    cardBorder: "rgba(147,197,253,0.55)",
    hoverShadow: "0 12px 40px rgba(147,197,253,0.4)",
    badgeText: "text-sky-600",
    label: "Twitter / X",
  },
  GitHub: {
    icon: Github,
    iconColor: "#374151",
    cardBg: "rgba(243,244,246,0.6)",
    cardBorder: "rgba(156,163,175,0.45)",
    hoverShadow: "0 12px 40px rgba(156,163,175,0.3)",
    badgeText: "text-gray-600",
    label: "GitHub",
  },
  YouTube: {
    icon: Youtube,
    iconColor: "#ef4444",
    cardBg: "rgba(254,242,242,0.6)",
    cardBorder: "rgba(252,165,165,0.5)",
    hoverShadow: "0 12px 40px rgba(252,165,165,0.35)",
    badgeText: "text-red-500",
    label: "YouTube",
  },
  Discord: {
    icon: MessageCircle,
    iconColor: "#6366f1",
    cardBg: "rgba(238,242,255,0.6)",
    cardBorder: "rgba(165,180,252,0.5)",
    hoverShadow: "0 12px 40px rgba(165,180,252,0.35)",
    badgeText: "text-indigo-500",
    label: "Discord",
  },
  Instagram: {
    icon: Instagram,
    iconColor: "#ec4899",
    cardBg: "rgba(253,242,248,0.6)",
    cardBorder: "rgba(249,168,212,0.5)",
    hoverShadow: "0 12px 40px rgba(249,168,212,0.35)",
    badgeText: "text-pink-500",
    label: "Instagram",
  },
  Twitch: {
    icon: Twitch,
    iconColor: "#7c3aed",
    cardBg: "rgba(245,243,255,0.6)",
    cardBorder: "rgba(196,181,253,0.5)",
    hoverShadow: "0 12px 40px rgba(196,181,253,0.35)",
    badgeText: "text-violet-500",
    label: "Twitch",
  },
  TikTok: {
    icon: Music2,
    iconColor: "#f43f5e",
    cardBg: "rgba(255,241,242,0.6)",
    cardBorder: "rgba(253,164,175,0.5)",
    hoverShadow: "0 12px 40px rgba(253,164,175,0.3)",
    badgeText: "text-rose-500",
    label: "TikTok",
  },
  LinkedIn: {
    icon: Linkedin,
    iconColor: "#2563eb",
    cardBg: "rgba(239,246,255,0.6)",
    cardBorder: "rgba(147,197,253,0.5)",
    hoverShadow: "0 12px 40px rgba(147,197,253,0.3)",
    badgeText: "text-blue-600",
    label: "LinkedIn",
  },
  Other: {
    icon: Link2,
    iconColor: "#64748b",
    cardBg: "rgba(248,250,252,0.6)",
    cardBorder: "rgba(203,213,225,0.5)",
    hoverShadow: "0 12px 40px rgba(203,213,225,0.3)",
    badgeText: "text-slate-500",
    label: "Other",
  },
};

const PLATFORMS = Object.keys(PLATFORM_CONFIG);


const FOOTER_PARTICLES = Array.from({ length: 9 }, (_, i) => ({
  left: `${8 + i * 10}%`,
  duration: 2.4 + (i % 4) * 0.55,
  delay: i * 0.48,
}));

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 16 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, scale: 0.88, transition: { duration: 0.2 } },
};

export function SnsSection() {
  const { isAdmin } = useAdmin();
  const { data: links, isLoading } = useSnsLinks();
  const { data: siteConf } = useSiteConfig();
  const updateSiteConfig = useUpdateSiteConfig();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addHovered, setAddHovered] = useState(false);
  const [thankEditOpen, setThankEditOpen] = useState(false);
  const [thankEditHovered, setThankEditHovered] = useState(false);
  const [thankDraft, setThankDraft] = useState("");

  const thankYouMessage = siteConf?.thankYouMessage ?? "Thank you for looking ദി >⩊<︎︎ ͡ 𐦯";

  const openThankEdit = () => {
    setThankDraft(thankYouMessage);
    setThankEditOpen(true);
  };
  const submitThankEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteConfig.mutate({ thankYouMessage: thankDraft }, {
      onSuccess: () => { setThankEditOpen(false); toast({ title: "サンクスメッセージを更新しました" }); },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  };

  return (
    <section id="sns" className="relative w-full max-w-6xl mx-auto px-5 sm:px-8 py-14 pb-24 scroll-mt-16">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-12"
      >
        <Heart className="w-4 h-4 fill-pink-400 text-pink-400" />
        <span className="terminal-label">04. SNS Links</span>
        <div
          className="flex-1 h-px"
          style={{ background: "linear-gradient(90deg, rgba(249,168,212,0.4), transparent)" }}
        />
        {isAdmin && <SnsFormModal
          isOpen={isAddOpen}
          setIsOpen={setIsAddOpen}
          trigger={
            <button
              onMouseEnter={() => setAddHovered(true)}
              onMouseLeave={() => setAddHovered(false)}
              className="shrink-0 px-4 h-9 text-xs font-display tracking-wider uppercase rounded-xl focus:outline-none"
              style={{
                background: addHovered
                  ? "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(249,168,212,0.22) 100%)"
                  : "rgba(255,255,255,0.68)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: `${addHovered ? "1.5px" : "1px"} solid ${addHovered ? "rgba(249,168,212,0.75)" : "rgba(249,168,212,0.5)"}`,
                color: "#9d174d",
                boxShadow: addHovered
                  ? "0 8px 28px rgba(249,168,212,0.35), inset 0 1px 0 rgba(255,255,255,0.95)"
                  : "0 4px 20px rgba(249,168,212,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
                transform: addHovered ? "translateY(-2px)" : "translateY(0px)",
                transition: "background 0.35s ease, border-color 0.35s ease, transform 0.3s ease, box-shadow 0.35s ease",
              }}
            >
              <span className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                ADD
              </span>
            </button>
          }
        />}
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-44 w-full bg-sky-50 rounded-2xl" />
          ))}
        </div>
      ) : links?.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-3xl"
        >
          <Heart className="w-14 h-14 text-pink-200 mb-4" />
          <p className="text-lg text-slate-400 font-display">No SNS links yet.</p>
          <p className="text-sm text-slate-300 mt-2">Add your social media links.</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {links?.map((link) => (
              <SnsCard key={link.id} link={link} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.4 }}
        className="mt-28 text-center relative"
        style={{ overflow: "visible" }}
      >
        {/* Floating sky-blue heart particles */}
        {FOOTER_PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className="absolute pointer-events-none select-none"
            style={{ left: p.left, bottom: "100%", fontSize: 9 }}
            animate={{ y: [0, -55, -80], opacity: [0, 0.45, 0] }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeOut",
            }}
          >
            💙
          </motion.span>
        ))}

        <div
          className="h-px w-full max-w-xl mx-auto mb-8"
          style={{ background: "linear-gradient(90deg, transparent, rgba(249,168,212,0.45), rgba(147,197,253,0.45), transparent)" }}
        />
        <div className="flex items-center justify-center gap-3">
          <p className="font-display text-sm tracking-[0.3em] uppercase text-slate-300">
            {thankYouMessage}
          </p>
          {isAdmin && (
            <button
              onClick={openThankEdit}
              onMouseEnter={() => setThankEditHovered(true)}
              onMouseLeave={() => setThankEditHovered(false)}
              className="flex items-center rounded-lg px-3 h-8 font-display tracking-wider text-xs uppercase focus:outline-none shrink-0"
              style={{
                background: thankEditHovered
                  ? "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(249,168,212,0.22) 100%)"
                  : "rgba(255,255,255,0.68)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: `1px solid ${thankEditHovered ? "rgba(249,168,212,0.75)" : "rgba(249,168,212,0.5)"}`,
                color: "#9d174d",
                boxShadow: thankEditHovered
                  ? "0 6px 20px rgba(249,168,212,0.3), inset 0 1px 0 rgba(255,255,255,0.95)"
                  : "0 2px 12px rgba(249,168,212,0.15), inset 0 1px 0 rgba(255,255,255,0.9)",
                transform: thankEditHovered ? "translateY(-1px)" : "translateY(0px)",
                transition: "all 0.3s ease",
              }}
            >
              <Edit2 className="w-3 h-3 mr-1" />
              EDIT
            </button>
          )}
        </div>
      </motion.div>

      {/* Thank you message edit dialog */}
      <Dialog open={thankEditOpen} onOpenChange={setThankEditOpen}>
        <DialogContent
          className="sm:max-w-sm rounded-2xl shadow-2xl"
          style={{ background: "rgba(255,255,255,0.94)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.8)" }}
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg flex items-center gap-2 text-slate-700">
              <Heart className="w-4 h-4 fill-pink-400 text-pink-400" />
              Edit Thanks Message
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitThankEdit} className="space-y-4 mt-2">
            <Input
              value={thankDraft}
              onChange={(e) => setThankDraft(e.target.value)}
              className="h-11 rounded-xl border-slate-200 focus-visible:ring-pink-400 bg-white text-slate-700"
              autoFocus
            />
            <Button
              type="submit"
              className="w-full h-10 rounded-xl font-display tracking-wider text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #60a5fa, #c084fc, #f472b6)", color: "white" }}
              disabled={updateSiteConfig.isPending}
            >
              {updateSiteConfig.isPending ? "SAVING..." : "SAVE"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/** 8-directional heart particles that burst from the card center */
function HeartBurst({ show }: { show: boolean }) {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  const distances = [58, 52, 58, 52, 58, 52, 58, 52];
  return (
    <AnimatePresence>
      {show &&
        angles.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const tx = Math.cos(rad) * distances[i];
          const ty = Math.sin(rad) * distances[i];
          return (
            <motion.span
              key={i}
              className="absolute top-1/2 left-1/2 pointer-events-none select-none z-30"
              style={{ marginTop: -11, marginLeft: -10, fontSize: 15, lineHeight: 1 }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.25, rotate: 0 }}
              animate={{ x: tx, y: ty, opacity: 0, scale: 1.15, rotate: angle }}
              transition={{
                duration: 0.78,
                delay: i * 0.042,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              💙
            </motion.span>
          );
        })}
    </AnimatePresence>
  );
}

function SnsCard({ link }: { link: SnsLink }) {
  const { isAdmin } = useAdmin();
  const deleteSnsLink = useDeleteSnsLink();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [burst, setBurst] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const config = PLATFORM_CONFIG[link.platform] || PLATFORM_CONFIG.Other;
  const Icon = config.icon;

  const handleDelete = () => {
    if (confirm("このリンクを削除しますか？")) {
      deleteSnsLink.mutate(link.id, {
        onSuccess: () => toast({ title: "Link removed" }),
      });
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);

    try {
      await navigator.clipboard.writeText(link.url);
    } catch {
      // Fallback for non-secure contexts
      const el = document.createElement("textarea");
      el.value = link.url;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }

    setCopied(true);
    setBurst(true);
    toast({
      title: "Copied! 💙",
      description: link.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
    });

    setTimeout(() => {
      setBurst(false);
      setCopied(false);
      setBusy(false);
    }, 1100);
  };

  return (
    <motion.div
      variants={cardVariants}
      exit="exit"
      layout
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative rounded-2xl overflow-visible cursor-pointer"
      style={{
        background: copied
          ? config.cardBg.replace("0.6", "0.95")
          : hovered
          ? config.cardBg.replace("0.6", "0.85")
          : config.cardBg,
        border: copied
          ? `1.5px solid ${config.cardBorder.replace("0.55", "0.9")}`
          : `1px solid ${config.cardBorder}`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: copied
          ? `${config.hoverShadow}, 0 0 0 3px rgba(96,165,250,0.25), inset 0 1px 0 rgba(255,255,255,0.95)`
          : hovered
          ? `${config.hoverShadow}, inset 0 1px 0 rgba(255,255,255,0.9)`
          : "0 2px 12px rgba(147,197,253,0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
        transition: "all 0.35s ease",
      }}
      onClick={handleCopy}
    >
      {/* Heart burst particles — positioned relative to card center */}
      <div className="absolute inset-0 pointer-events-none" style={{ overflow: "visible", zIndex: 30 }}>
        <HeartBurst show={burst} />
      </div>

      {/* Sparkle inner glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 25% 25%, rgba(255,255,255,0.5) 0%, transparent 60%)`,
          opacity: hovered || copied ? 1 : 0.4,
        }}
      />

      {/* Copied! flash overlay */}
      <AnimatePresence>
        {copied && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none z-20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ background: "rgba(255,255,255,0.35)" }}
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-xl">💙</span>
              <span
                className="font-display font-bold text-xs tracking-widest text-sky-600"
                style={{ fontFamily: "'M PLUS Rounded 1c', sans-serif" }}
              >
                Copied!
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit/Delete/Open buttons — admin only */}
      {isAdmin && <div
        className="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Open in new tab */}
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md text-slate-400 hover:text-sky-600 transition-colors"
          style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.9)" }}
          title="Open link"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
        <SnsFormModal
          isOpen={isEditOpen}
          setIsOpen={setIsEditOpen}
          link={link}
          trigger={
            <button
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
              style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.9)" }}
            >
              <Edit className="w-3 h-3" />
            </button>
          }
        />
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-md text-slate-400 hover:text-red-400 transition-colors"
          style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.9)" }}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center p-6 min-h-[148px] gap-4">
        <motion.div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          animate={{ scale: copied ? 1.15 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 16 }}
          style={{
            background: "rgba(255,255,255,0.65)",
            border: "1px solid rgba(255,255,255,0.85)",
            color: config.iconColor,
            boxShadow: hovered || copied ? "0 4px 16px rgba(0,0,0,0.07)" : "none",
          }}
        >
          <Icon className="w-7 h-7" />
        </motion.div>

        <div className="text-center">
          <p className={`font-display font-semibold text-sm tracking-wider ${config.badgeText}`}>
            {config.label}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 opacity-60 truncate max-w-[100px] mx-auto">
            {link.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
          </p>
          <p className="text-[9px] text-slate-300 mt-0.5 font-medium tracking-wider">
            tap to copy
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function SnsFormModal({
  isOpen, setIsOpen, link, trigger,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  link?: SnsLink;
  trigger: React.ReactNode;
}) {
  const createSnsLink = useCreateSnsLink();
  const updateSnsLink = useUpdateSnsLink();
  const { toast } = useToast();

  const form = useForm<InsertSnsLink>({
    resolver: zodResolver(insertSnsLinkSchema),
    defaultValues: {
      platform: link?.platform || "Twitter",
      url: link?.url || "",
      displayOrder: link?.displayOrder || 0,
    },
  });

  const onSubmit = (data: InsertSnsLink) => {
    if (link) {
      updateSnsLink.mutate({ id: link.id, ...data }, {
        onSuccess: () => { setIsOpen(false); toast({ title: "Link updated" }); },
      });
    } else {
      createSnsLink.mutate(data, {
        onSuccess: () => { setIsOpen(false); form.reset(); toast({ title: "Link added" }); },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="sm:max-w-md rounded-2xl shadow-2xl"
        style={{ background: "rgba(255,255,255,0.94)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.8)" }}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-slate-700 flex items-center gap-2">
            <Heart className="w-5 h-5 fill-pink-400 text-pink-400" />
            {link ? "Edit SNS Link" : "Add SNS Link"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
            <FormField control={form.control} name="platform" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-slate-400">Platform</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 focus-visible:ring-sky-400 bg-white text-slate-700">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border-slate-200 rounded-xl">
                    {PLATFORMS.map((plat) => (
                      <SelectItem key={plat} value={plat}>
                        {PLATFORM_CONFIG[plat]?.label || plat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="url" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-slate-400">URL</FormLabel>
                <FormControl>
                  <Input {...field} className="h-11 rounded-xl border-slate-200 focus-visible:ring-sky-400 bg-white text-slate-700" placeholder="https://twitter.com/username" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-display tracking-wider text-sm font-bold transition-all"
              style={{
                background: "linear-gradient(135deg, #60a5fa, #c084fc, #f472b6)",
                color: "white",
                boxShadow: "0 4px 16px rgba(249,168,212,0.4)",
              }}
              disabled={createSnsLink.isPending || updateSnsLink.isPending}
            >
              {createSnsLink.isPending || updateSnsLink.isPending ? "PROCESSING..." : link ? "UPDATE" : "ADD LINK"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
