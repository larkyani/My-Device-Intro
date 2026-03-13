import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2, Monitor, LayoutGrid, Plus, Trash2, Edit, Joystick, Sparkles
} from "lucide-react";
import { useAdmin } from "@/contexts/admin-context";
import { useGames, useCreateGame, useUpdateGame, useDeleteGame } from "@/hooks/use-games";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGameSchema, type InsertGame, type Game } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlatformCfg {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  badgeStyle: string;
  hoverGlow: string;
  /** Theme color wash — the "じわっ" background color interpolation on hover */
  themeWash: string;
}

const PLATFORM_CONFIG: Record<string, PlatformCfg> = {
  PC: {
    icon: Monitor,
    iconColor: "#3b82f6",
    iconBg: "rgba(147,197,253,0.2)",
    badgeStyle: "bg-sky-100 text-sky-700 border border-sky-200",
    hoverGlow: "rgba(147,197,253,0.28)",
    themeWash: "radial-gradient(ellipse 90% 80% at 50% 50%, rgba(96,165,250,0.20) 0%, rgba(147,197,253,0.10) 60%, transparent 100%)",
  },
  PlayStation: {
    icon: Gamepad2,
    iconColor: "#2563eb",
    iconBg: "rgba(147,197,253,0.18)",
    badgeStyle: "bg-blue-100 text-blue-700 border border-blue-200",
    hoverGlow: "rgba(147,197,253,0.24)",
    themeWash: "radial-gradient(ellipse 90% 80% at 50% 50%, rgba(37,99,235,0.18) 0%, rgba(96,130,255,0.09) 60%, transparent 100%)",
  },
  Xbox: {
    icon: Gamepad2,
    iconColor: "#16a34a",
    iconBg: "rgba(110,231,183,0.2)",
    badgeStyle: "bg-green-100 text-green-700 border border-green-200",
    hoverGlow: "rgba(110,231,183,0.24)",
    themeWash: "radial-gradient(ellipse 90% 80% at 50% 50%, rgba(34,197,94,0.18) 0%, rgba(110,231,183,0.09) 60%, transparent 100%)",
  },
  Nintendo: {
    icon: LayoutGrid,
    iconColor: "#dc2626",
    iconBg: "rgba(252,165,165,0.2)",
    badgeStyle: "bg-red-100 text-red-700 border border-red-200",
    hoverGlow: "rgba(252,165,165,0.24)",
    themeWash: "radial-gradient(ellipse 90% 80% at 50% 50%, rgba(239,68,68,0.18) 0%, rgba(252,165,165,0.09) 60%, transparent 100%)",
  },
  Mobile: {
    icon: Gamepad2,
    iconColor: "#ca8a04",
    iconBg: "rgba(253,224,71,0.2)",
    badgeStyle: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    hoverGlow: "rgba(253,224,71,0.22)",
    themeWash: "radial-gradient(ellipse 90% 80% at 50% 50%, rgba(234,179,8,0.18) 0%, rgba(253,224,71,0.09) 60%, transparent 100%)",
  },
  Multi: {
    icon: Joystick,
    iconColor: "#7c3aed",
    iconBg: "rgba(196,181,253,0.2)",
    badgeStyle: "bg-violet-100 text-violet-700 border border-violet-200",
    hoverGlow: "rgba(196,181,253,0.24)",
    themeWash: "radial-gradient(ellipse 90% 80% at 50% 50%, rgba(139,92,246,0.18) 0%, rgba(196,181,253,0.09) 60%, transparent 100%)",
  },
  "PC/PS5": {
    icon: Monitor,
    iconColor: "#3b82f6",
    iconBg: "rgba(147,197,253,0.18)",
    badgeStyle: "bg-sky-100 text-sky-700 border border-sky-200",
    hoverGlow: "rgba(147,197,253,0.24)",
    themeWash: "radial-gradient(ellipse 90% 80% at 50% 50%, rgba(96,165,250,0.18) 0%, rgba(147,197,253,0.09) 60%, transparent 100%)",
  },
};

const PLATFORMS = ["PC", "PlayStation", "Xbox", "Nintendo", "Mobile", "Multi"];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export function GamesSection() {
  const { isAdmin } = useAdmin();
  const { data: games, isLoading } = useGames();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addHovered, setAddHovered] = useState(false);

  return (
    <section id="games" className="relative w-full max-w-6xl mx-auto px-5 sm:px-8 py-14 scroll-mt-16">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-12"
      >
        <Sparkles className="w-4 h-4 text-pink-400" />
        <span className="terminal-label">03. Favorite Games</span>
        <div
          className="flex-1 h-px"
          style={{ background: "linear-gradient(90deg, rgba(249,168,212,0.4), transparent)" }}
        />
        {isAdmin && <GameFormModal
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 w-full bg-pink-50 rounded-2xl" />
          ))}
        </div>
      ) : games?.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-3xl"
        >
          <Gamepad2 className="w-14 h-14 text-pink-200 mb-4" />
          <p className="text-lg text-slate-400 font-display">No games logged.</p>
          <p className="text-sm text-slate-300 mt-2">Add your favorite titles.</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {games?.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}

function GameCard({ game }: { game: Game }) {
  const { isAdmin } = useAdmin();
  const deleteGame = useDeleteGame();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const config = PLATFORM_CONFIG[game.platform] || PLATFORM_CONFIG.Multi;
  const Icon = config.icon;

  const handleDelete = () => {
    if (confirm("このゲームを削除しますか？")) {
      deleteGame.mutate(game.id, {
        onSuccess: () => toast({ title: "Game removed" }),
      });
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      exit="exit"
      layout
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative rounded-2xl p-5 overflow-hidden flex items-stretch gap-5"
      style={{
        background: hovered ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.30)",
        border: "1px solid rgba(255,255,255,0.65)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: hovered
          ? `0 6px 28px ${config.hoverGlow}, 0 2px 8px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.9)`
          : "0 2px 12px rgba(147,197,253,0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
        transition: "all 0.35s ease",
      }}
    >
      {/*
        ✦ Theme Color Wash — "じわっと" interpolation
        Uses platform's themeWash gradient, animates opacity via framer-motion
        for an organic, ink-bleeding-into-water feel.
      */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ background: config.themeWash }}
      />
      {/* Extra brightness layer — brightens the glass on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{ opacity: hovered ? 0.18 : 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{ background: "rgba(255,255,255,0.5)" }}
      />

      {/* Platform icon */}
      <div
        className="relative shrink-0 flex items-center justify-center w-[68px] h-[68px] rounded-2xl self-center"
        style={{
          background: config.iconBg,
          border: "1px solid rgba(255,255,255,0.7)",
          color: config.iconColor,
        }}
      >
        <Icon className="w-8 h-8" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center relative z-10 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-display font-bold text-slate-700 leading-tight">
            {game.title}
          </h3>
          {isAdmin && <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 shrink-0">
            <GameFormModal
              isOpen={isEditOpen}
              setIsOpen={setIsEditOpen}
              game={game}
              trigger={
                <button
                  className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 transition-colors"
                  style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.8)" }}
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              }
            />
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
              style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.8)" }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>}
        </div>

        <div className="mb-2.5">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-widest uppercase ${config.badgeStyle}`}>
            {game.platform}
          </span>
        </div>

        <p className="text-sm text-slate-400 leading-snug line-clamp-2">{game.description}</p>
      </div>
    </motion.div>
  );
}

function GameFormModal({
  isOpen, setIsOpen, game, trigger,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  game?: Game;
  trigger: React.ReactNode;
}) {
  const createGame = useCreateGame();
  const updateGame = useUpdateGame();
  const { toast } = useToast();

  const form = useForm<InsertGame>({
    resolver: zodResolver(insertGameSchema),
    defaultValues: {
      title: game?.title || "",
      platform: game?.platform || "PC",
      description: game?.description || "",
    },
  });

  const onSubmit = (data: InsertGame) => {
    if (game) {
      updateGame.mutate({ id: game.id, ...data }, {
        onSuccess: () => { setIsOpen(false); toast({ title: "Game updated" }); },
      });
    } else {
      createGame.mutate(data, {
        onSuccess: () => { setIsOpen(false); form.reset(); toast({ title: "Game added" }); },
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
          <DialogTitle className="font-display text-xl text-slate-700">
            {game ? "Edit Game" : "Add Game"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-slate-400">Title</FormLabel>
                <FormControl>
                  <Input {...field} className="h-11 rounded-xl border-slate-200 focus-visible:ring-sky-400 bg-white text-slate-700" placeholder="e.g. Apex Legends" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
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
                      <SelectItem key={plat} value={plat}>{plat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-slate-400">Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} className="min-h-[100px] rounded-xl border-slate-200 focus-visible:ring-sky-400 resize-none bg-white text-slate-700" placeholder="Why do you love this game?" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-display tracking-wider text-sm font-bold transition-all"
              style={{
                background: "linear-gradient(135deg, #f472b6, #c084fc)",
                color: "white",
                boxShadow: "0 4px 16px rgba(249,168,212,0.4)",
              }}
              disabled={createGame.isPending || updateGame.isPending}
            >
              {createGame.isPending || updateGame.isPending ? "PROCESSING..." : game ? "UPDATE" : "ADD GAME"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
