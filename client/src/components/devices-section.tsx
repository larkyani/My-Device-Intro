import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Cpu, Keyboard, Mouse, Smartphone, Headphones, Plus, Trash2, Edit, X } from "lucide-react";
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

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  PC: Cpu,
  Monitor: Monitor,
  Keyboard: Keyboard,
  Mouse: Mouse,
  Headset: Headphones,
  Mobile: Smartphone,
  Other: Monitor,
};

const CATEGORIES = Object.keys(CATEGORY_ICONS);

export function DevicesSection() {
  const { data: devices, isLoading } = useDevices();
  const [isAddOpen, setIsAddOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto py-8 px-6">
        <Skeleton className="h-8 w-48 mb-8 bg-muted/50 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full bg-muted/50 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3 glow-text-accent">
          <Monitor className="w-8 h-8 text-accent" />
          My_Arsenal
        </h2>
        
        <DeviceFormModal 
          isOpen={isAddOpen} 
          setIsOpen={setIsAddOpen} 
          trigger={
            <Button className="bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 hover:border-accent shadow-[0_0_10px_rgba(191,0,255,0.1)] hover:shadow-[0_0_20px_rgba(191,0,255,0.3)] transition-all duration-300 rounded-xl px-4 h-10">
              <Plus className="w-4 h-4 mr-2" />
              <span className="font-display tracking-wider">ADD_DEVICE</span>
            </Button>
          }
        />
      </div>

      {devices?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-3xl border-dashed border-white/10">
          <Cpu className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <p className="text-xl text-muted-foreground font-display">No hardware registered yet.</p>
          <p className="text-sm text-muted-foreground/60 mt-2">Add your gear to showcase your setup.</p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {devices?.map((device, index) => (
              <DeviceCard key={device.id} device={device} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function DeviceCard({ device, index }: { device: Device, index: number }) {
  const deleteDevice = useDeleteDevice();
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const Icon = CATEGORY_ICONS[device.category] || CATEGORY_ICONS.Other;

  const handleDelete = () => {
    if(confirm("Are you sure you want to unregister this device?")) {
      deleteDevice.mutate(device.id, {
        onSuccess: () => toast({ title: "Device removed" })
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
      className="group relative bg-card/80 backdrop-blur-sm border border-white/5 rounded-2xl p-6 glow-border overflow-hidden flex flex-col"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[40px] pointer-events-none transition-all duration-500 group-hover:bg-accent/10" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-3 bg-background/80 rounded-xl border border-white/5 text-accent group-hover:text-primary group-hover:scale-110 transition-all duration-300">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <DeviceFormModal 
            isOpen={isEditOpen} 
            setIsOpen={setIsEditOpen} 
            device={device}
            trigger={
              <button className="p-2 text-muted-foreground hover:text-primary bg-background/50 rounded-lg backdrop-blur-md transition-colors">
                <Edit className="w-4 h-4" />
              </button>
            }
          />
          <button 
            onClick={handleDelete}
            className="p-2 text-muted-foreground hover:text-destructive bg-background/50 rounded-lg backdrop-blur-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative z-10 mt-auto">
        <h3 className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-1">{device.category}</h3>
        <h4 className="text-xl font-display font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">{device.name}</h4>
        <p className="text-sm text-muted-foreground/80 line-clamp-2">{device.specs}</p>
      </div>
    </motion.div>
  );
}

function DeviceFormModal({ 
  isOpen, 
  setIsOpen, 
  device, 
  trigger 
}: { 
  isOpen: boolean, 
  setIsOpen: (v: boolean) => void, 
  device?: Device, 
  trigger: React.ReactNode 
}) {
  const createDevice = useCreateDevice();
  const updateDevice = useUpdateDevice();
  const { toast } = useToast();

  const form = useForm<InsertDevice>({
    resolver: zodResolver(insertDeviceSchema),
    defaultValues: {
      name: device?.name || "",
      category: device?.category || "PC",
      specs: device?.specs || "",
    },
  });

  const onSubmit = (data: InsertDevice) => {
    if (device) {
      updateDevice.mutate({ id: device.id, ...data }, {
        onSuccess: () => {
          setIsOpen(false);
          toast({ title: "Device updated" });
        }
      });
    } else {
      createDevice.mutate(data, {
        onSuccess: () => {
          setIsOpen(false);
          form.reset();
          toast({ title: "Device registered successfully" });
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
            {device ? "Edit Gear" : "Register Gear"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Device Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background/50 border-white/10 focus-visible:ring-accent h-11 rounded-lg" placeholder="e.g. Custom Rig, RTX 4090" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background/50 border-white/10 focus-visible:ring-accent h-11 rounded-lg">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover border-white/10">
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Specifications</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background/50 border-white/10 focus-visible:ring-accent h-11 rounded-lg" placeholder="e.g. Intel i9, 64GB RAM, 2TB SSD" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 rounded-xl font-display text-lg tracking-wider font-semibold shadow-[0_0_15px_rgba(191,0,255,0.3)] transition-all mt-4"
              disabled={createDevice.isPending || updateDevice.isPending}
            >
              {createDevice.isPending || updateDevice.isPending ? "PROCESSING..." : (device ? "UPDATE_DATA" : "INITIALIZE_DEVICE")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
