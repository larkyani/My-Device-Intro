import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor, Cpu, Keyboard, Mouse, Smartphone, Headphones,
  Plus, Trash2, Edit, Server, Wifi, Layers
} from "lucide-react";
import { useAdmin } from "@/contexts/admin-context";
import { useDevices, useCreateDevice, useUpdateDevice, useDeleteDevice } from "@/hooks/use-devices";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDeviceSchema, type InsertDevice, type Device } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoryConfig {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  hoverGlow: string;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  Desktop: {
    icon: Cpu,
    iconColor: "#3b82f6",
    iconBg: "rgba(147,197,253,0.2)",
    hoverGlow: "rgba(147,197,253,0.35)",
  },
  Monitor: {
    icon: Monitor,
    iconColor: "#8b5cf6",
    iconBg: "rgba(196,181,253,0.2)",
    hoverGlow: "rgba(196,181,253,0.35)",
  },
  Keyboard: {
    icon: Keyboard,
    iconColor: "#10b981",
    iconBg: "rgba(110,231,183,0.2)",
    hoverGlow: "rgba(110,231,183,0.35)",
  },
  Mouse: {
    icon: Mouse,
    iconColor: "#f97316",
    iconBg: "rgba(253,186,116,0.2)",
    hoverGlow: "rgba(253,186,116,0.35)",
  },
  Headset: {
    icon: Headphones,
    iconColor: "#ec4899",
    iconBg: "rgba(249,168,212,0.2)",
    hoverGlow: "rgba(249,168,212,0.35)",
  },
  Mobile: {
    icon: Smartphone,
    iconColor: "#eab308",
    iconBg: "rgba(253,224,71,0.2)",
    hoverGlow: "rgba(253,224,71,0.3)",
  },
  Network: {
    icon: Wifi,
    iconColor: "#06b6d4",
    iconBg: "rgba(103,232,249,0.2)",
    hoverGlow: "rgba(103,232,249,0.35)",
  },
  Other: {
    icon: Server,
    iconColor: "#6b7280",
    iconBg: "rgba(209,213,219,0.25)",
    hoverGlow: "rgba(209,213,219,0.3)",
  },
};

const CATEGORIES = Object.keys(CATEGORY_CONFIG);

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.94, transition: { duration: 0.2 } },
};

export function SetupSection() {
  const { isAdmin } = useAdmin();
  const { data: devices, isLoading } = useDevices();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addHovered, setAddHovered] = useState(false);

  return (
    <section id="setup" className="relative w-full max-w-6xl mx-auto px-5 sm:px-8 py-14 scroll-mt-16">
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-12"
      >
        <Layers className="w-4 h-4 text-sky-500" />
        <span className="terminal-label">02. My Setup</span>
        <div
          className="flex-1 h-px"
          style={{ background: "linear-gradient(90deg, rgba(147,197,253,0.4), transparent)" }}
        />
        {isAdmin && <DeviceFormModal
          isOpen={isAddOpen}
          setIsOpen={setIsAddOpen}
          trigger={
            <button
              onMouseEnter={() => setAddHovered(true)}
              onMouseLeave={() => setAddHovered(false)}
              className="shrink-0 px-4 h-9 text-xs font-display tracking-wider uppercase rounded-xl focus:outline-none"
              style={{
                background: addHovered
                  ? "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(147,197,253,0.22) 100%)"
                  : "rgba(255,255,255,0.68)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: `${addHovered ? "1.5px" : "1px"} solid ${addHovered ? "rgba(147,197,253,0.75)" : "rgba(147,197,253,0.5)"}`,
                color: "#0369a1",
                boxShadow: addHovered
                  ? "0 8px 28px rgba(147,197,253,0.35), inset 0 1px 0 rgba(255,255,255,0.95)"
                  : "0 4px 20px rgba(147,197,253,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 w-full bg-sky-50 rounded-2xl" />
          ))}
        </div>
      ) : devices?.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-3xl"
        >
          <Cpu className="w-14 h-14 text-sky-200 mb-4" />
          <p className="text-lg text-slate-400 font-display">No hardware registered.</p>
          <p className="text-sm text-slate-300 mt-2">Add your gear to showcase your setup.</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {devices?.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}

function DeviceCard({ device }: { device: Device }) {
  const { isAdmin } = useAdmin();
  const deleteDevice = useDeleteDevice();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const config = CATEGORY_CONFIG[device.category] || CATEGORY_CONFIG.Other;
  const Icon = config.icon;

  const handleDelete = () => {
    if (confirm("このデバイスを削除しますか？")) {
      deleteDevice.mutate(device.id, {
        onSuccess: () => toast({ title: "Device removed" }),
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
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative rounded-2xl p-6 overflow-hidden cursor-default"
      style={{
        background: hovered ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.30)",
        border: "1px solid rgba(255,255,255,0.65)",
        boxShadow: hovered
          ? `0 12px 40px ${config.hoverGlow}, 0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)`
          : "0 2px 16px rgba(147,197,253,0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        transition: "all 0.35s ease",
      }}
    >
      {/* Hover color wash */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 20% 20%, ${config.hoverGlow} 0%, transparent 60%)`,
          opacity: hovered ? 0.6 : 0,
        }}
      />

      {/* Edit/Delete — admin only */}
      {isAdmin && <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <DeviceFormModal
          isOpen={isEditOpen}
          setIsOpen={setIsEditOpen}
          device={device}
          trigger={
            <button
              className="p-1.5 rounded-lg transition-all duration-200 text-slate-400 hover:text-sky-600"
              style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.8)" }}
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          }
        />
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-lg transition-all duration-200 text-slate-400 hover:text-red-400"
          style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.8)" }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>}

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 relative z-10"
        style={{
          background: config.iconBg,
          border: "1px solid rgba(255,255,255,0.7)",
          color: config.iconColor,
        }}
      >
        <Icon className="w-6 h-6" />
      </div>

      {/* Category */}
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-1.5 relative z-10">
        {device.category}
      </p>

      {/* Name */}
      <h3 className="text-base font-display font-semibold text-slate-700 mb-2.5 leading-snug relative z-10">
        {device.name}
      </h3>

      {/* Specs */}
      <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 relative z-10">{device.specs}</p>
    </motion.div>
  );
}

function DeviceFormModal({
  isOpen, setIsOpen, device, trigger,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  device?: Device;
  trigger: React.ReactNode;
}) {
  const createDevice = useCreateDevice();
  const updateDevice = useUpdateDevice();
  const { toast } = useToast();

  const form = useForm<InsertDevice>({
    resolver: zodResolver(insertDeviceSchema),
    defaultValues: {
      name: device?.name || "",
      category: device?.category || "Desktop",
      specs: device?.specs || "",
    },
  });

  const onSubmit = (data: InsertDevice) => {
    if (device) {
      updateDevice.mutate({ id: device.id, ...data }, {
        onSuccess: () => { setIsOpen(false); toast({ title: "Device updated" }); },
      });
    } else {
      createDevice.mutate(data, {
        onSuccess: () => { setIsOpen(false); form.reset(); toast({ title: "Device added" }); },
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
            {device ? "Edit Device" : "Add Device"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-slate-400">Device Name</FormLabel>
                <FormControl>
                  <Input {...field} className="h-11 rounded-xl border-slate-200 focus-visible:ring-sky-400 bg-white text-slate-700" placeholder="e.g. Custom PC" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-slate-400">Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 rounded-xl border-slate-200 focus-visible:ring-sky-400 bg-white text-slate-700">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border-slate-200 rounded-xl">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="specs" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-slate-400">Specifications</FormLabel>
                <FormControl>
                  <Input {...field} className="h-11 rounded-xl border-slate-200 focus-visible:ring-sky-400 bg-white text-slate-700" placeholder="e.g. Intel i9, 64GB RAM" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-display tracking-wider text-sm font-bold transition-all"
              style={{
                background: "linear-gradient(135deg, #60a5fa, #c084fc)",
                color: "white",
                boxShadow: "0 4px 16px rgba(147,197,253,0.35)",
              }}
              disabled={createDevice.isPending || updateDevice.isPending}
            >
              {createDevice.isPending || updateDevice.isPending ? "PROCESSING..." : device ? "UPDATE" : "ADD DEVICE"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
