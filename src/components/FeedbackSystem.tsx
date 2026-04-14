import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquare, Send, X, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface FeedbackSystemProps {
  section?: 'Vehicle' | 'Interest' | 'Land';
  isSuggestion?: boolean;
  onClose?: () => void;
}

export const FeedbackSystem = ({ section, isSuggestion = false, onClose }: FeedbackSystemProps) => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [type, setType] = useState<string>(isSuggestion ? 'Suggestion' : 'General Feedback');
  const [category, setCategory] = useState<string>('UI Improvement');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side throttle
    const lastSubmit = localStorage.getItem('last_feedback_submit');
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < 60000) {
      setError('Please wait 1 minute before submitting again.');
      return;
    }

    if (!isSuggestion && rating === 0) {
      setError('Please provide a rating');
      return;
    }
    if (!message.trim()) {
      setError('Please provide a message');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isSuggestion) {
        await addDoc(collection(db, 'suggestions'), {
          category,
          section: section || 'General',
          message,
          timestamp: serverTimestamp(),
          status: 'New'
        });
      } else {
        await addDoc(collection(db, 'feedback'), {
          name: name || 'Anonymous',
          rating,
          type,
          message,
          timestamp: serverTimestamp(),
          status: 'New'
        });
      }
      
      localStorage.setItem('last_feedback_submit', Date.now().toString());
      setIsSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, isSuggestion ? 'suggestions' : 'feedback');
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-8 text-center space-y-4"
      >
        <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-xl font-black">Thank you for your feedback!</h3>
        <p className="text-muted-foreground">Your input helps us make EasyCalc Hub better for everyone in India.</p>
      </motion.div>
    );
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-black flex items-center gap-2">
          {isSuggestion ? <MessageSquare className="h-6 w-6 text-amber-500" /> : <Star className="h-6 w-6 text-yellow-500" />}
          {isSuggestion ? 'Suggest Improvement' : 'Give Feedback'}
        </CardTitle>
        <CardDescription>
          {isSuggestion 
            ? `Help us improve the ${section || 'app'} experience.` 
            : 'Share your thoughts on how we can improve.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isSuggestion && (
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Name (Optional)</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Your name"
                className="h-10 border-2"
              />
            </div>
          )}

          {!isSuggestion && (
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star 
                      className={`h-8 w-8 ${
                        (hoverRating || rating) >= star 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-muted-foreground/30'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">
                {isSuggestion ? 'Category' : 'Feedback Type'}
              </Label>
              <Select 
                value={isSuggestion ? category : type} 
                onValueChange={isSuggestion ? setCategory : setType}
              >
                <SelectTrigger className="h-10 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isSuggestion ? (
                    <>
                      <SelectItem value="UI Improvement">UI Improvement</SelectItem>
                      <SelectItem value="New Feature">New Feature</SelectItem>
                      <SelectItem value="Calculation Fix">Calculation Fix</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Bug">Bug</SelectItem>
                      <SelectItem value="Suggestion">Suggestion</SelectItem>
                      <SelectItem value="Improvement">Improvement</SelectItem>
                      <SelectItem value="General Feedback">General Feedback</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            {isSuggestion && (
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider">Section</Label>
                <div className="h-10 flex items-center px-3 bg-muted rounded-md border-2 font-bold text-sm">
                  {section || 'General'}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider">Message</Label>
            <Textarea 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              placeholder={isSuggestion ? "Describe the improvement..." : "What's on your mind?"}
              className="min-h-[100px] border-2 resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-xs font-bold bg-destructive/10 p-2 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 font-bold">
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="flex-1 font-bold gap-2">
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-center pt-4">
            <Link to="/admin-dashboard" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              Admin Dashboard
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export const FeedbackModal = ({ isOpen, onClose, section, isSuggestion }: { isOpen: boolean; onClose: () => void; section?: any; isSuggestion?: boolean }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-background border-2 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-end mb-2">
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <FeedbackSystem section={section} isSuggestion={isSuggestion} onClose={onClose} />
        </div>
      </motion.div>
    </div>
  );
};
