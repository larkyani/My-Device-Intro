import { ProfileSection } from "@/components/profile-section";
import { DevicesSection } from "@/components/devices-section";
import { GamesSection } from "@/components/games-section";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden pt-4 pb-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <ProfileSection />
        
        <div className="w-full max-w-6xl mx-auto px-6 hidden sm:block">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-12" />
        </div>
        
        <DevicesSection />
        
        <div className="w-full max-w-6xl mx-auto px-6 hidden sm:block">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-12" />
        </div>
        
        <GamesSection />
      </motion.div>
    </div>
  );
}
