import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Share2, Copy, Check, MessageSquare } from 'lucide-react';
import { downloadAsPDF, shareToWhatsApp, copyToClipboard } from '@/lib/exportUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { motion, AnimatePresence } from 'motion/react';

interface ExportActionsProps {
  title: string;
  inputs: { label: string; value: string }[];
  results: { label: string; value: string }[];
  disabled?: boolean;
}

export const ExportActions = ({ title, inputs, results, disabled }: ExportActionsProps) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const data = { title, inputs, results };

  const handlePDF = async () => {
    if (disabled) return;
    setLoading(true);
    try {
      downloadAsPDF(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (disabled) return;
    const success = await copyToClipboard(data);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    if (disabled) return;
    shareToWhatsApp(data);
  };

  return (
    <div className="flex flex-wrap gap-3 mt-6 pt-6">
      <Button
        variant="outline"
        onClick={handlePDF}
        disabled={disabled || loading}
        className="font-bold uppercase tracking-widest text-[10px] gap-2 h-9 border-2 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
      >
        <FileText className="h-4 w-4" />
        {loading ? 'Generating...' : 'Download PDF'}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={disabled}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "font-bold uppercase tracking-widest text-[10px] gap-2 h-9 border-2 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300"
          )}
        >
          <Share2 className="h-4 w-4" />
          Share Result
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 font-bold uppercase tracking-widest text-[10px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DropdownMenuItem onClick={handleWhatsApp} className="gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white">
            <MessageSquare className="h-4 w-4 text-green-500" />
            WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopy} className="gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white">
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2 text-green-600"
                >
                  <Check className="h-4 w-4" />
                  <span>Copied!</span>
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy Text</span>
                </motion.div>
              )}
            </AnimatePresence>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
