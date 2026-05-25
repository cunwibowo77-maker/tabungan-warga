import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Toast() {
  const { toast } = useApp();

  if (!toast) return null;

  const bgStyles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-slate-50 text-slate-800 border-slate-200',
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    error: <AlertTriangle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-slate-500" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-[100] max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg glass-panel pointer-events-auto ${bgStyles[toast.type]}`}
        >
          <div className="shrink-0">{icons[toast.type]}</div>
          <div className="flex-1 text-sm font-medium leading-relaxed">
            {toast.message}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
