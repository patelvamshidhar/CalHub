import React, { useState } from 'react';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageSquare, AlertCircle, CheckCircle2, Loader2, User, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FeedbackForm = () => {
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
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setErrorMessage('Failed to submit feedback. Please try again.');
      setStatus('error');
      handleFirestoreError(error, OperationType.CREATE, 'feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
                    className="transition-transform hover:scale-125 active:scale-90"
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
            <Select value={type} onValueChange={(v: any) => setType(v)}>
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
            />
          </div>

          <AnimatePresence mode="wait">
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-500/10 text-emerald-600 p-4 rounded-2xl border border-emerald-500/20 flex items-center gap-3 text-sm font-bold"
              >
                <CheckCircle2 className="h-5 w-5" />
                Thank you! Your feedback has been submitted successfully.
              </motion.div>
            )}
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
  );
};
