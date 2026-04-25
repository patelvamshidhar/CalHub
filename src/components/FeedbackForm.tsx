import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageSquare, AlertCircle, CheckCircle2, Loader2, User, Star, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FeedbackForm = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [type, setType] = useState<'Suggestion' | 'Bug' | 'Improvement'>('Suggestion');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setStatus('idle');

    const feedbackData = {
      message: message.trim(),
      type,
      rating,
      name: name.trim() || null,
      createdAt: new Date().toISOString(),
    };

    try {
      if (!navigator.onLine) {
        // Queue feedback offline
        const pending = JSON.parse(localStorage.getItem('pending-feedback') || '[]');
        localStorage.setItem('pending-feedback', JSON.stringify([...pending, feedbackData]));
        
        setMessage('');
        setName('');
        setRating(0);
        setStatus('success');
        setErrorMessage('You are offline. Your feedback has been saved locally and will sync when you are online.');
        
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      await addDoc(collection(db, 'feedback'), {
        ...feedbackData,
        createdAt: serverTimestamp(),
      });
      
      setMessage('');
      setName('');
      setRating(0);
      setStatus('success');
      
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      setErrorMessage('Failed to submit feedback. Please try again.');
      setStatus('error');
      handleFirestoreError(error, OperationType.CREATE, 'feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-md w-full bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-200 dark:border-emerald-800 rounded-3xl p-8 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mb-2 uppercase tracking-tight">Success!</h3>
              <p className="text-emerald-700 dark:text-emerald-300 font-bold mb-8">Thank you for your feedback!</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600/60 dark:text-emerald-400/60">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Redirecting to home...
                </div>
                <Button 
                  onClick={() => navigate('/')}
                  className="w-full h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-widest text-xs gap-2 transition-all duration-200"
                >
                  <Home className="h-4 w-4" />
                  Go to Home
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="border-none shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] bg-card dark:bg-zinc-950 overflow-hidden rounded-[2.5rem]">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-zinc-500 to-purple-600" />
        <CardHeader className="pb-6 sm:pb-8 pt-8 sm:pt-10 px-6 sm:px-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div className="p-3 bg-blue-600 font-black text-white rounded-2xl shadow-xl shadow-blue-500/20 w-fit">
              <MessageSquare className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic text-foreground dark:text-zinc-100">Feedback Hub</CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm font-medium text-muted-foreground">
            Help us calibrate the future of CalHub. Share your neural feedback or report system anomalies.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 sm:px-10 pb-8 sm:pb-10 space-y-6 sm:space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Identity Tag (Optional)</Label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors duration-500" />
                  <Input
                    placeholder="ENTER YOUR NAME"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-12 h-16 bg-muted/20 dark:bg-zinc-950 border-2 border-border dark:border-zinc-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl font-black text-lg text-foreground dark:text-zinc-100 uppercase tracking-wider transition-all duration-500 outline-none"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Experience Rating</Label>
                <div className="flex items-center gap-3 bg-muted/20 dark:bg-zinc-950 p-4 rounded-3xl border border-border dark:border-zinc-800">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      disabled={isSubmitting}
                      className="transition-transform hover:scale-125 active:scale-90 disabled:opacity-50"
                    >
                      <Star
                        className={`h-8 w-8 sm:h-10 sm:h-10 ${
                          (hoveredRating || rating) >= star
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                            : 'text-zinc-300 dark:text-zinc-800'
                        }`}
                      />
                    </button>
                  ))}
                  <div className="ml-auto px-4 py-2 bg-muted dark:bg-zinc-900 rounded-xl">
                    <span className="text-[10px] font-black text-foreground dark:text-zinc-100 uppercase tracking-widest">
                      {rating > 0 ? `${rating} / 5` : 'UNRATED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Transmission Category</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)} disabled={isSubmitting}>
                <SelectTrigger className="h-16 bg-muted/20 dark:bg-zinc-950 border-2 border-border dark:border-zinc-800 rounded-2xl font-black text-sm text-foreground dark:text-zinc-100 focus:ring-blue-500">
                  <SelectValue placeholder="Selection" />
                </SelectTrigger>
                <SelectContent className="bg-card dark:bg-zinc-900 border-border dark:border-zinc-800 text-foreground dark:text-zinc-100">
                  <SelectItem value="Suggestion">💡 Suggestion</SelectItem>
                  <SelectItem value="Bug">🐛 Bug Report</SelectItem>
                  <SelectItem value="Improvement">🚀 Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">System Feedback</Label>
              <Textarea
                placeholder="DESCRIBE YOUR EXPERIENCE..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[160px] bg-muted/20 dark:bg-zinc-950 border-2 border-border dark:border-zinc-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-2xl font-bold text-foreground dark:text-zinc-100 p-6 resize-none outline-none transition-all duration-500"
                required
                disabled={isSubmitting}
              />
            </div>

            <AnimatePresence mode="wait">
              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 text-red-500 p-4 rounded-2xl border border-red-500/20 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"
                >
                  <AlertCircle className="h-4 w-4" />
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <Button 
              type="submit" 
              disabled={isSubmitting || !message.trim()}
              className="w-full h-16 rounded-3xl bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-blue-500/20 transition-all duration-500 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  INITIATING TRANSMISSION...
                </>
              ) : (
                'SEND TO TERMINAL'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
