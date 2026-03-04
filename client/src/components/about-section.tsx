import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Feather, Edit2, UserCircle2, Sparkles, Camera } from "lucide-react";
import { useAdmin } from "@/contexts/admin-context";
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

function resizeImage(file: File, maxSize = 200): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.13, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

export function AboutSection() {
  const { isAdmin } = useAdmin();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [editHovered, setEditHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<InsertProfile>({
    resolver: zodResolver(insertProfileSchema),
    defaultValues: { name: profile?.name || "", bio: profile?.bio || "", avatarUrl: profile?.avatarUrl || "" },
  });

  if (profile && form.getValues("name") === "" && profile.name) {
    form.reset({ name: profile.name, bio: profile.bio, avatarUrl: profile.avatarUrl || "" });
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await resizeImage(file);
    setAvatarPreview(dataUrl);
    form.setValue("avatarUrl", dataUrl);
  };

  const handleDialogOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) setAvatarPreview(null);
  };

  const onSubmit = (data: InsertProfile) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        setIsOpen(false);
        setAvatarPreview(null);
        toast({ title: "Profile Updated", description: "変更を保存しました。" });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      },
    });
  };

  return (
    <section id="about" className="relative w-full max-w-6xl mx-auto px-5 sm:px-8 py-14 scroll-mt-16">
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-12"
      >
        <Feather className="w-4 h-4 text-sky-500" />
        <span className="terminal-label">01. About Me</span>
        <div
          className="flex-1 h-px"
          style={{ background: "linear-gradient(90deg, rgba(147,197,253,0.4), transparent)" }}
        />
      </motion.div>

      {isLoading ? (
        <div className="glass-panel rounded-3xl p-10">
          <Skeleton className="h-12 w-64 mb-6 bg-sky-100 rounded-xl" />
          <Skeleton className="h-24 w-full max-w-2xl bg-pink-50 rounded-xl" />
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="glass-panel rounded-3xl p-8 sm:p-12 overflow-hidden relative"
        >
          {/* Corner decorations */}
          <div
            className="absolute top-0 right-0 w-80 h-80 pointer-events-none"
            style={{
              background: "radial-gradient(circle at top right, rgba(174,198,255,0.25) 0%, transparent 65%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none"
            style={{
              background: "radial-gradient(circle at bottom left, rgba(255,182,193,0.18) 0%, transparent 65%)",
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-start gap-10">
            {/* Avatar */}
            <motion.div
              variants={itemVariants}
              className="shrink-0 w-24 h-24 rounded-3xl overflow-hidden flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1.5px solid rgba(147,197,253,0.5)",
                boxShadow: "0 4px 20px rgba(147,197,253,0.2), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <UserCircle2 className="w-12 h-12 text-sky-400/80" />
              )}
            </motion.div>

            <div className="flex-1">
              {/* Label */}
              <motion.div variants={itemVariants} className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-pink-400/70" />
                <span className="terminal-label text-[10px]">Display Name</span>
              </motion.div>

              {/* Name */}
              <motion.h2
                variants={itemVariants}
                className="text-4xl sm:text-5xl font-display font-bold leading-tight mb-6"
                style={{
                  background: "linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #be185d 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {profile?.name || "Player 1"}
              </motion.h2>

              {/* Bio */}
              <motion.div variants={itemVariants}>
                <div
                  className="pl-5 py-1"
                  style={{ borderLeft: "2px solid rgba(147,197,253,0.5)" }}
                >
                  <p className="text-base sm:text-lg text-slate-500 leading-relaxed">
                    {profile?.bio || "No biography provided. Click edit to setup your profile."}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Edit button — admin only */}
            {isAdmin && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="shrink-0">
              <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    onMouseEnter={() => setEditHovered(true)}
                    onMouseLeave={() => setEditHovered(false)}
                    className="flex items-center rounded-xl px-5 h-11 font-display tracking-wider text-sm uppercase focus:outline-none"
                    style={{
                      background: editHovered
                        ? "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(147,197,253,0.22) 100%)"
                        : "rgba(255,255,255,0.68)",
                      backdropFilter: "blur(24px)",
                      WebkitBackdropFilter: "blur(24px)",
                      border: `${editHovered ? "1.5px" : "1px"} solid ${editHovered ? "rgba(147,197,253,0.75)" : "rgba(147,197,253,0.5)"}`,
                      color: "#0369a1",
                      boxShadow: editHovered
                        ? "0 8px 28px rgba(147,197,253,0.35), inset 0 1px 0 rgba(255,255,255,0.95)"
                        : "0 4px 20px rgba(147,197,253,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
                      transform: editHovered ? "translateY(-2px)" : "translateY(0px)",
                      transition: "background 0.35s ease, border-color 0.35s ease, transform 0.3s ease, box-shadow 0.35s ease",
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    EDIT
                  </button>
                </DialogTrigger>
                <DialogContent
                  className="sm:max-w-md rounded-2xl shadow-2xl"
                  style={{
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.8)",
                  }}
                >
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl flex items-center gap-2 text-slate-700">
                      <UserCircle2 className="w-5 h-5 text-sky-500" />
                      Edit Profile
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
                      {/* Avatar upload */}
                      <div className="flex flex-col items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="relative w-20 h-20 rounded-2xl overflow-hidden group focus:outline-none"
                          style={{
                            background: "rgba(241,245,249,0.8)",
                            border: "1.5px solid rgba(147,197,253,0.5)",
                            boxShadow: "0 2px 12px rgba(147,197,253,0.15)",
                          }}
                        >
                          {avatarPreview || profile?.avatarUrl ? (
                            <img
                              src={avatarPreview || profile?.avatarUrl || ""}
                              alt="avatar preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserCircle2 className="w-10 h-10 text-sky-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl">
                            <Camera className="w-5 h-5 text-white" />
                          </div>
                        </button>
                        <span className="text-[10px] text-slate-400 tracking-wider uppercase">クリックして変更</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-500 uppercase text-xs tracking-wider">
                              Display Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="h-11 rounded-xl border-slate-200 focus-visible:ring-sky-400 bg-white text-slate-700"
                                placeholder="Your name"
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
                            <FormLabel className="text-slate-500 uppercase text-xs tracking-wider">
                              Biography
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                className="min-h-[120px] rounded-xl border-slate-200 focus-visible:ring-sky-400 resize-none bg-white text-slate-700"
                                placeholder="Tell us about yourself..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full h-11 rounded-xl font-display tracking-wider text-sm font-bold transition-all"
                        style={{
                          background: "linear-gradient(135deg, #60a5fa, #c084fc, #f472b6)",
                          color: "white",
                          boxShadow: "0 4px 16px rgba(147,197,253,0.35)",
                        }}
                        disabled={updateProfile.isPending}
                      >
                        {updateProfile.isPending ? "SAVING..." : "SAVE CHANGES"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </motion.div>}
          </div>
        </motion.div>
      )}
    </section>
  );
}
