import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Announcement {
  id: string;
  title: string;
  subtitle: string | null;
  link_url: string | null;
  link_text: string | null;
  background_color: string;
  text_color: string;
}

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('id, title, subtitle, link_url, link_text, background_color, text_color')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (data && data.length > 0) {
        setAnnouncements(data);
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;
    
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex(prev => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  if (announcements.length === 0 || dismissed) return null;

  const current = announcements[currentIndex];

  const goNext = () => {
    setDirection(1);
    setCurrentIndex(prev => (prev + 1) % announcements.length);
  };
  const goPrev = () => {
    setDirection(-1);
    setCurrentIndex(prev => (prev - 1 + announcements.length) % announcements.length);
  };

  const variants = {
    enter: (direction: number) => {
      return {
        y: direction > 0 ? 20 : -20,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        y: direction < 0 ? 20 : -20,
        opacity: 0
      };
    }
  };

  return (
    <div 
      className="relative py-2.5 px-4 text-center transition-colors duration-500 overflow-hidden"
      style={{ backgroundColor: current.background_color, color: current.text_color }}
    >
      <div className="container mx-auto flex items-center justify-center gap-4 min-h-[24px]">
        {announcements.length > 1 && (
          <button 
            onClick={goPrev}
            className="p-1 hover:opacity-70 transition-opacity z-10"
            style={{ color: current.text_color }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        <div className="flex-1 relative flex items-center justify-center h-full">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                y: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute w-full flex items-center justify-center gap-2 min-w-0"
            >
              <span className="font-medium text-sm sm:text-base truncate">{current.title}</span>
              {current.subtitle && (
                <span className="hidden sm:inline text-sm opacity-80">— {current.subtitle}</span>
              )}
              {current.link_url && current.link_text && (
                <Link 
                  to={current.link_url}
                  className="ml-2 text-sm font-medium underline hover:no-underline transition-all"
                  style={{ color: current.text_color }}
                >
                  {current.link_text}
                </Link>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {announcements.length > 1 && (
          <button 
            onClick={goNext}
            className="p-1 hover:opacity-70 transition-opacity z-10"
            style={{ color: current.text_color }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        <button 
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity z-10"
          style={{ color: current.text_color }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Dots indicator */}
      {announcements.length > 1 && (
        <div className="flex justify-center gap-1 mt-1">
          {announcements.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-3' : 'opacity-50'}`}
              style={{ backgroundColor: current.text_color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}