import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";

const CITIES = ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton", "Winnipeg", "Halifax"];
const PACKAGES = ["Professional Package", "Executive Package", "Entry Level Package", "Cover Letter Add-on", "LinkedIn Optimization"];
const NAMES = ["Sarah", "Michael", "David", "Emily", "Jessica", "James", "Robert", "Jennifer", "John", "Lisa"];

export function FOMOPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [notification, setNotification] = useState({ name: "", city: "", package: "", time: "" });

  useEffect(() => {
    // Initial delay
    const initialTimeout = setTimeout(() => {
      showNotification();
    }, 5000);

    // Loop
    const interval = setInterval(() => {
      showNotification();
    }, 15000 + Math.random() * 20000); // Random interval between 15-35s

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const showNotification = () => {
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const pkg = PACKAGES[Math.floor(Math.random() * PACKAGES.length)];
    const time = Math.floor(Math.random() * 59) + 1;

    setNotification({ name, city, package: pkg, time: `${time} min ago` });
    setIsVisible(true);

    // Hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -50 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-lg border p-4 max-w-sm flex items-start gap-4"
        >
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
            <ShoppingBag className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              <span className="font-bold">{notification.name}</span> from {notification.city} purchased
            </p>
            <p className="text-sm font-bold text-primary">{notification.package}</p>
            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
          </div>
          <button 
            onClick={() => setIsVisible(false)} 
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
