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

    try {
      await addDoc(collection(db, 'feedback'), {
        message: message.trim(),
        type,
        rating,
        name: name.trim() || null,
        createdAt: serverTimestamp(),
      });
      
      setMessage('');
      setName('');
      setRating(0);
      setStatus('success');
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
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
              className="max-w-md w-full bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-8 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-emerald-900 mb-2 uppercase tracking-tight">Success!</h3>
              <p className="text-emerald-700 font-bold mb-8">Thank you for your feedback!</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600/60">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Redirecting to home...
                </div>
                <Button 
                  onClick={() => navigate('/')}
                  className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go to Home
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="border-2 shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary text-primary-foreground rounded-xl">
              <MessageSquare className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight uppercase">Submit Feedback</CardTitle>
          </div>
          <CardDescription className="text-sm font-medium">
            Help us improve CalHub. Share your suggestions, report bugs, or suggest improvements.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Name (Optional)</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-11 h-12 rounded-2xl border-2 focus:ring-primary"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Rating</Label>
                <div className="flex items-center gap-2">
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
                        className={`h-8 w-8 ${
                          (hoveredRating || rating) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-4 text-sm font-black text-muted-foreground uppercase tracking-widest">
                    {rating > 0 ? `${rating} / 5` : 'Select Rating'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Feedback Type</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)} disabled={isSubmitting}>
                <SelectTrigger className="h-12 rounded-2xl border-2 focus:ring-primary">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="Suggestion" className="rounded-xl">💡 Suggestion</SelectItem>
                  <SelectItem value="Bug" className="rounded-xl">🐛 Bug Report</SelectItem>
                  <SelectItem value="Improvement" className="rounded-xl">🚀 Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Your Message</Label>
              <Textarea
                placeholder="Tell us what's on your mind..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[150px] rounded-2xl border-2 focus:ring-primary resize-none p-4"
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
                  className="bg-destructive/10 text-destructive p-4 rounded-2xl border border-destructive/20 flex items-center gap-3 text-sm font-bold"
                >
                  <AlertCircle className="h-5 w-5" />
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <Button 
              type="submit" 
              disabled={isSubmitting || !message.trim()}
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Send Feedback'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
