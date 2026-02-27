import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Gamepad, Monitor, LayoutGrid, Plus, Trash2, Edit } from "lucide-react";
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

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  PC: Monitor,
  PlayStation: Gamepad2,
  Xbox: Gamepad,
  Nintendo: LayoutGrid,
  Mobile: LayoutGrid,
  Multi: Gamepad2,
};

const PLATFORMS = Object.keys(PLATFORM_ICONS);

export function GamesSection() {
  const { data: games, isLoading } = useGames();
  const [isAddOpen, setIsAddOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto py-8 px-6 mb-20">
        <Skeleton className="h-8 w-48 mb-8 bg-muted/50 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 w-full bg-muted/50 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-6 mb-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3 glow-text">
          <Gamepad2 className="w-8 h-8 text-primary" />
          Top_Played_Titles
        </h2>
        
        <GameFormModal 
          isOpen={isAddOpen} 
          setIsOpen={setIsAddOpen} 
          trigger={
            <Button className="bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:border-primary shadow-[0_0_10px_rgba(0,243,255,0.1)] hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all duration-300 rounded-xl px-4 h-10">
              <Plus className="w-4 h-4 mr-2" />
              <span className="font-display tracking-wider">ADD_GAME</span>
            </Button>
          }
        />
      </div>

      {games?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-3xl border-dashed border-white/10">
          <Gamepad2 className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <p className="text-xl text-muted-foreground font-display">No games logged in database.</p>
          <p className="text-sm text-muted-foreground/60 mt-2">Add your favorite titles to share what you play.</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <AnimatePresence>
            {games?.map((game, index) => (
              <GameCard key={game.id} game={game} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function GameCard({ game, index }: { game: Game, index: number }) {
  const deleteGame = useDeleteGame();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const Icon = PLATFORM_ICONS[game.platform] || PLATFORM_ICONS.Multi;

  const handleDelete = () => {
    if(confirm("Are you sure you want to remove this game?")) {
      deleteGame.mutate(game.id, {
        onSuccess: () => toast({ title: "Game removed from library" })
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      layout
      className="group relative bg-card/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-primary/50 transition-all duration-300 overflow-hidden flex items-stretch gap-5"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl bg-background border border-white/10 shadow-inner group-hover:shadow-[0_0_15px_rgba(0,243,255,0.2)] group-hover:border-primary/30 transition-all duration-300">
        <Icon className="w-8 h-8 text-primary/70 group-hover:text-primary" />
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-start">
          <h4 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors">{game.title}</h4>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <GameFormModal 
              isOpen={isEditOpen} 
              setIsOpen={setIsEditOpen} 
              game={game}
              trigger={
                <button className="p-1.5 text-muted-foreground hover:text-primary rounded-md transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
              }
            />
            <button 
              onClick={handleDelete}
              className="p-1.5 text-muted-foreground hover:text-destructive rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-1 mb-2">
          <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-[10px] font-bold tracking-widest uppercase border border-white/5">
            {game.platform}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-snug">{game.description}</p>
      </div>
    </motion.div>
  );
}

function GameFormModal({ 
  isOpen, 
  setIsOpen, 
  game, 
  trigger 
}: { 
  isOpen: boolean, 
  setIsOpen: (v: boolean) => void, 
  game?: Game, 
  trigger: React.ReactNode 
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
        onSuccess: () => {
          setIsOpen(false);
          toast({ title: "Game updated" });
        }
      });
    } else {
      createGame.mutate(data, {
        onSuccess: () => {
          setIsOpen(false);
          form.reset();
          toast({ title: "Game added to library" });
        }
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-white/10 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            {game ? "Edit Title" : "Add Title"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Game Title</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background/50 border-white/10 focus-visible:ring-primary h-11 rounded-lg" placeholder="e.g. Cyberpunk 2077" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Platform</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background/50 border-white/10 focus-visible:ring-primary h-11 rounded-lg">
                        <SelectValue placeholder="Select a platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover border-white/10">
                      {PLATFORMS.map(plat => (
                        <SelectItem key={plat} value={plat}>{plat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Description / Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="bg-background/50 border-white/10 focus-visible:ring-primary min-h-[100px] rounded-lg resize-none" 
                      placeholder="Why do you like this game?" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 rounded-xl font-display text-lg tracking-wider font-semibold shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all mt-4"
              disabled={createGame.isPending || updateGame.isPending}
            >
              {createGame.isPending || updateGame.isPending ? "PROCESSING..." : (game ? "UPDATE_DATA" : "SAVE_TO_LIBRARY")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
