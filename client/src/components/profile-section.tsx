import { useState } from "react";
import { motion } from "framer-motion";
import { Edit2, Terminal, UserCircle2 } from "lucide-react";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProfileSchema, type InsertProfile } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export function ProfileSection() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertProfile>({
    resolver: zodResolver(insertProfileSchema),
    defaultValues: {
      name: profile?.name || "Player 1",
      bio: profile?.bio || "Welcome to my portfolio.",
    },
  });

  // Update form defaults when data loads
  if (profile && form.getValues("name") === "Player 1" && profile.name) {
    form.reset({ name: profile.name, bio: profile.bio });
  }

  const onSubmit = (data: InsertProfile) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        setIsOpen(false);
        toast({ title: "Profile Updated", description: "Your bio has been saved successfully." });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-6 glass-panel rounded-3xl mt-12 mb-16">
        <Skeleton className="h-16 w-64 mb-6 bg-muted/50 rounded-xl" />
        <Skeleton className="h-24 w-full max-w-2xl bg-muted/50 rounded-xl" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-5xl mx-auto py-16 px-6 sm:px-12 glass-panel rounded-[2rem] mt-12 mb-16 overflow-hidden group"
    >
      {/* Decorative background blur blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="w-6 h-6 text-primary" />
            <span className="text-primary font-display font-semibold tracking-widest uppercase text-sm">
              System.User_Profile
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-display font-bold text-foreground mb-6 glow-text">
            {profile?.name || "Player 1"}
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl border-l-2 border-primary/30 pl-4 py-1">
            {profile?.bio || "No biography provided. Click edit to setup your profile."}
          </p>
        </div>

        <div className="shrink-0 self-start md:self-stretch flex items-center">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-background/50 border-primary/30 hover:bg-primary/10 hover:border-primary text-primary transition-all duration-300 rounded-xl px-6 h-12"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                <span className="font-display tracking-wider">EDIT_PROFILE</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-white/10 rounded-2xl shadow-2xl shadow-black/50">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl flex items-center gap-2">
                  <UserCircle2 className="w-6 h-6 text-primary" />
                  Edit Profile
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider">Display Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-background/50 border-white/10 focus-visible:ring-primary h-12 rounded-xl text-lg" 
                            placeholder="Enter your name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider">Biography</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            className="bg-background/50 border-white/10 focus-visible:ring-primary min-h-[120px] rounded-xl resize-none" 
                            placeholder="Tell us about yourself..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl font-display text-lg tracking-wider font-semibold shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:shadow-[0_0_25px_rgba(0,243,255,0.5)] transition-all"
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? "SAVING..." : "SAVE_CHANGES"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </motion.div>
  );
}
