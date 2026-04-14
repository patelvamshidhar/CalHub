import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  MessageSquare, 
  Filter, 
  ArrowUpDown, 
  Clock, 
  Mail, 
  Bug, 
  Lightbulb,
  Search,
  Loader2,
  AlertTriangle,
  LogIn,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

const ADMIN_EMAIL = 'reddyvamshi607@gmail.com';

interface FeedbackItem {
  id: string;
  message: string;
  type: 'Suggestion' | 'Bug';
  name?: string;
  email?: string;
  createdAt: Timestamp;
}

export const AdminDashboard = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'All' | 'Suggestion' | 'Bug'>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = auth.currentUser?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const feedbackRef = collection(db, 'feedback');
    let q = query(feedbackRef, orderBy('createdAt', sortOrder));

    if (filterType !== 'All') {
      q = query(feedbackRef, where('type', '==', filterType), orderBy('createdAt', sortOrder));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeedbackItem[];
      
      setFeedback(items);
      setLoading(false);
    }, (err) => {
      setError('Failed to fetch feedback. Check security rules.');
      setLoading(false);
      handleFirestoreError(err, OperationType.LIST, 'feedback');
    });

    return () => unsubscribe();
  }, [isAdmin, filterType, sortOrder]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (!auth.currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 shadow-2xl">
          <CardContent className="pt-10 pb-10 text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto rotate-3">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight uppercase">Admin Access</h3>
              <p className="text-muted-foreground font-medium">
                Please sign in with an authorized admin account to access the dashboard.
              </p>
            </div>
            <Button onClick={handleLogin} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-3">
              <LogIn className="h-5 w-5" />
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-destructive/20 shadow-2xl bg-destructive/5">
          <CardContent className="pt-10 pb-10 text-center space-y-6">
            <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight uppercase text-destructive">Access Denied</h3>
              <p className="text-muted-foreground font-medium">
                Your account ({auth.currentUser.email}) does not have administrative privileges.
              </p>
            </div>
            <Button variant="outline" onClick={() => auth.signOut()} className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredFeedback = feedback.filter(item => 
    item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-4xl font-black tracking-tighter uppercase">Admin Dashboard</h2>
          </div>
          <p className="text-muted-foreground font-medium">Monitoring user feedback and system suggestions in real-time.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-2xl border-2 bg-card focus:ring-2 focus:ring-primary outline-none text-sm font-medium transition-all"
            />
          </div>
          
          <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
            <SelectTrigger className="h-12 w-40 rounded-2xl border-2 font-bold text-xs uppercase tracking-widest">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="All" className="rounded-xl">All Types</SelectItem>
              <SelectItem value="Suggestion" className="rounded-xl">Suggestions</SelectItem>
              <SelectItem value="Bug" className="rounded-xl">Bugs</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="h-12 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Loading Feedback...</p>
        </div>
      ) : error ? (
        <Card className="border-2 border-destructive/20 bg-destructive/5">
          <CardContent className="py-20 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <p className="text-lg font-bold text-destructive">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="rounded-xl">Retry Connection</Button>
          </CardContent>
        </Card>
      ) : filteredFeedback.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-32 text-center space-y-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-black tracking-tight uppercase">No Feedback Found</p>
              <p className="text-muted-foreground font-medium">When users submit feedback, it will appear here instantly.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredFeedback.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full border-2 hover:border-primary/30 transition-all shadow-lg hover:shadow-xl bg-card group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${item.type === 'Bug' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'}`}>
                          {item.type === 'Bug' ? <Bug className="h-5 w-5" /> : <Lightbulb className="h-5 w-5" />}
                        </div>
                        <div>
                          <Badge variant="outline" className={`rounded-lg font-black uppercase tracking-widest text-[10px] ${item.type === 'Bug' ? 'border-red-200 text-red-600 bg-red-50' : 'border-amber-200 text-amber-600 bg-amber-50'}`}>
                            {item.type}
                          </Badge>
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {item.createdAt ? format(item.createdAt.toDate(), 'MMM d, yyyy • HH:mm') : 'Just now'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-foreground font-medium leading-relaxed whitespace-pre-wrap">
                      {item.message}
                    </p>
                    
                    <div className="pt-6 border-t flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-black uppercase tracking-tighter border-2 border-background shadow-sm">
                        {(item.name || item.email || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Submitted By</span>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                          {item.name ? (
                            <span className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-primary" />
                              {item.name}
                            </span>
                          ) : item.email ? (
                            <span className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-primary" />
                              {item.email}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">Anonymous User</span>
                          )}
                        </div>
                        {item.name && item.email && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <Mail className="h-3 w-3" />
                            {item.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
