import React, { useState } from 'react';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, AlertCircle, CheckCircle2, LogIn, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FeedbackForm = () => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'Suggestion' | 'Bug'>('Suggestion');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!message.trim()) return;

    setIsSubmitting(true);
    setStatus('idle');

    try {
      await addDoc(collection(db, 'feedback'), {
        message: message.trim(),
        type,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        createdAt: serverTimestamp(),
      });
      
      setMessage('');
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

  if (!auth.currentUser) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="pt-10 pb-10 text-center space-y-6">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <LogIn className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tight">Authentication Required</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Please sign in with your Google account to provide feedback or report bugs.
            </p>
          </div>
          <Button onClick={handleLogin} className="rounded-2xl font-black uppercase tracking-widest text-xs h-12 px-8">
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    );
  }

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
          Help us improve CalHub. Share your suggestions or report any issues you encounter.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Feedback Type</Label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger className="h-12 rounded-2xl border-2 focus:ring-primary">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="Suggestion" className="rounded-xl">💡 Suggestion</SelectItem>
                <SelectItem value="Bug" className="rounded-xl">🐛 Bug Report</SelectItem>
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

        <div className="pt-4 border-t flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Logged in as {auth.currentUser.email}
          </div>
          <button 
            onClick={() => auth.signOut()}
            className="hover:text-primary transition-colors"
          >
            Sign Out
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
