import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, orderBy, where, Timestamp, getDocs, writeBatch, deleteDoc, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  MessageSquare, 
  Filter, 
  ArrowUpDown, 
  Clock, 
  Bug, 
  Lightbulb,
  Rocket,
  Search,
  Loader2,
  AlertTriangle,
  Lock,
  User,
  Star,
  Trash2,
  CheckCircle2,
  Users,
  CalendarDays,
  RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { doc, onSnapshot } from 'firebase/firestore';
import { fetchAllPrices } from '@/services/priceService';

interface FeedbackItem {
  id: string;
  message: string;
  type: 'Suggestion' | 'Bug' | 'Improvement';
  rating?: number;
  name?: string;
  createdAt: Timestamp;
}

export const AdminDashboard = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [visitorStats, setVisitorStats] = useState<{ totalCount: number; dailyCount: number }>({ totalCount: 0, dailyCount: 0 });
  const [recentVisitors, setRecentVisitors] = useState<{ name: string; timestamp: Timestamp; userId: string; date: string }[]>([]);
  const [priceHealth, setPriceHealth] = useState<{ lastFetchTime: any; status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'All' | 'Suggestion' | 'Bug' | 'Improvement'>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearAllReports = async () => {
    setIsClearing(true);
    try {
      const snapshot = await getDocs(collection(db, 'feedback'));
      
      if (snapshot.empty) {
        setIsClearing(false);
        setShowConfirm(false);
        return;
      }

      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      setShowSuccess(true);
      setShowConfirm(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to clear reports:', err);
      handleFirestoreError(err, OperationType.DELETE, 'feedback');
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
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
  }, [isLoggedIn, filterType, sortOrder]);

  // Fetch Visitor Stats
  useEffect(() => {
    if (!isLoggedIn) return;

    const today = new Date().toISOString().split('T')[0];
    const statsRef = doc(db, 'stats/visitors');
    const dailyRef = doc(db, `stats/daily_${today}`);

    const unsubStats = onSnapshot(statsRef, (doc) => {
      if (doc.exists()) {
        setVisitorStats(prev => ({ ...prev, totalCount: doc.data().totalCount || 0 }));
      }
    });

    const unsubDaily = onSnapshot(dailyRef, (doc) => {
      if (doc.exists()) {
        setVisitorStats(prev => ({ ...prev, dailyCount: doc.data().dailyCount || 0 }));
      }
    });

    return () => {
      unsubStats();
      unsubDaily();
    };
  }, [isLoggedIn]);

  // Fetch Price Health
  useEffect(() => {
    if (!isLoggedIn) return;

    const healthRef = doc(db, 'system/price_health');
    const unsubscribe = onSnapshot(healthRef, (doc) => {
      if (doc.exists()) {
        setPriceHealth(doc.data() as any);
      }
    });

    return () => unsubscribe();
  }, [isLoggedIn]);

  // Fetch Recent Visitors
  useEffect(() => {
    if (!isLoggedIn) return;

    const vRef = collection(db, 'visitor_list');
    const q = query(vRef, orderBy('timestamp', 'desc'), limit(20));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setRecentVisitors(docs);
    });

    return () => unsubscribe();
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Patel@9488') {
      setIsLoggedIn(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full"
        >
          <Card className="border-2 shadow-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 pb-8 text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                <Lock className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-black tracking-tight uppercase">Admin Login</CardTitle>
            </CardHeader>
            <CardContent className="pt-8 pb-10 space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Enter Password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginError(false);
                      }}
                      className={`pl-11 h-12 rounded-2xl border-2 transition-all ${
                        loginError ? 'border-destructive focus:ring-destructive' : 'focus:ring-primary'
                      }`}
                      autoFocus
                    />
                  </div>
                  <AnimatePresence>
                    {loginError && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-[10px] font-black text-destructive uppercase tracking-widest text-center"
                      >
                        Invalid Password
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-lg shadow-primary/20">
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const filteredFeedback = feedback.filter(item => 
    item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary text-primary-foreground rounded-lg shadow-lg shadow-primary/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase">Admin Dashboard</h2>
          </div>
          <p className="text-muted-foreground text-xs font-medium">Monitoring user feedback and system suggestions.</p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsLoggedIn(false)}
          className="h-10 rounded-xl font-black uppercase tracking-widest text-[10px] text-muted-foreground hover:text-destructive transition-colors"
        >
          Logout
        </Button>
      </div>

      {/* Visitor Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-2 shadow-sm bg-primary/5 border-primary/10 overflow-hidden relative">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <Users className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Total Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter text-foreground">
              {visitorStats.totalCount.toLocaleString()}
            </div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Unique lifetime visits</p>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm bg-emerald-500/5 border-emerald-500/10 overflow-hidden relative">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <CalendarDays className="h-16 w-16 text-emerald-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Today's Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter text-foreground">
              {visitorStats.dailyCount.toLocaleString()}
            </div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Unique visits today</p>
          </CardContent>
        </Card>

        {priceHealth && (
          <Card className={`border-2 shadow-sm relative overflow-hidden col-span-1 sm:col-span-2 ${priceHealth.status === 'Success' ? 'bg-blue-500/5 border-blue-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <RefreshCcw className={`h-16 w-16 ${priceHealth.status === 'Success' ? 'text-blue-500' : 'text-red-500'} ${priceHealth.status === 'Success' ? '' : 'animate-pulse'}`} />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className={`text-[10px] font-black uppercase tracking-[0.2em] ${priceHealth.status === 'Success' ? 'text-blue-600' : 'text-red-600'}`}>
                Price API Health
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${priceHealth.status === 'Success' ? 'bg-emerald-500' : 'bg-red-500 animate-ping'}`} />
                  <span className="text-2xl font-black uppercase tracking-tighter">Status: {priceHealth.status}</span>
                </div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">
                  Last Sync: {priceHealth.lastFetchTime ? format(priceHealth.lastFetchTime.toDate(), 'HH:mm:ss') : 'Never'}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchAllPrices()}
                className="h-9 rounded-xl font-black uppercase tracking-widest text-[9px] border-2 border-primary/20"
              >
                Force Sync Now
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Unified Clear Button */}
      <div className="pt-0">
        {!showConfirm ? (
          <Button
            variant="destructive"
            onClick={() => setShowConfirm(true)}
            disabled={isClearing || feedback.length === 0}
            className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs gap-3 shadow-lg shadow-destructive/20 transition-all hover:scale-[1.005] active:scale-[0.995]"
          >
            <Trash2 className="h-5 w-5" />
            Clear All Reports
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-destructive/5 border-2 border-destructive/20 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-sm font-bold text-destructive">
                Are you sure you want to clear all bugs and suggestions?
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirm(false)}
                className="flex-1 sm:flex-none h-10 rounded-xl font-bold uppercase tracking-widest text-[10px] border-2"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleClearAllReports}
                disabled={isClearing}
                className="flex-1 sm:flex-none h-10 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-destructive/20"
              >
                {isClearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Confirm Clear
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border-2 bg-card focus:ring-2 focus:ring-primary outline-none text-xs font-medium transition-all"
          />
        </div>
        
        <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
          <SelectTrigger className="h-10 w-32 rounded-xl border-2 font-bold text-[10px] uppercase tracking-widest">
            <Filter className="h-3.5 w-3.5 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="All" className="rounded-lg">All Types</SelectItem>
            <SelectItem value="Suggestion" className="rounded-lg">Suggestions</SelectItem>
            <SelectItem value="Bug" className="rounded-lg">Bugs</SelectItem>
            <SelectItem value="Improvement" className="rounded-lg">Improvements</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="h-10 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] gap-2"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortOrder === 'desc' ? 'New' : 'Old'}
        </Button>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-center justify-center gap-2 text-green-600 text-[10px] font-black uppercase tracking-widest"
          >
            <CheckCircle2 className="h-4 w-4" />
            All reports cleared successfully ✅
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visitor Activity Log */}
      <Card className="border-2 shadow-sm overflow-hidden bg-muted/30">
        <CardHeader className="pb-2 border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em]">Recent Visitor Activity</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Live Tracking</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[200px] overflow-y-auto divide-y">
            {recentVisitors.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-[10px] font-bold uppercase">No activity logged yet</div>
            ) : (
              recentVisitors.map((visitor, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                      {visitor.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-tighter truncate max-w-[150px]">{visitor.name || 'Anonymous User'}</h4>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">ID: {visitor.userId?.substring(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-primary text-[9px] font-bold uppercase">
                      <Clock className="h-3 w-3" />
                      {visitor.timestamp ? format(visitor.timestamp.toDate(), 'HH:mm:ss') : 'Just now'}
                    </div>
                    <p className="text-[8px] font-black text-muted-foreground uppercase">{visitor.date || 'Today'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

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
                        <div className={`p-2 rounded-xl ${
                          item.type === 'Bug' ? 'bg-red-500/10 text-red-600' : 
                          item.type === 'Improvement' ? 'bg-blue-500/10 text-blue-600' :
                          'bg-amber-500/10 text-amber-600'
                        }`}>
                          {item.type === 'Bug' ? <Bug className="h-5 w-5" /> : 
                           item.type === 'Improvement' ? <Rocket className="h-5 w-5" /> :
                           <Lightbulb className="h-5 w-5" />}
                        </div>
                        <div>
                          <Badge variant="outline" className={`rounded-lg font-black uppercase tracking-widest text-[10px] ${
                            item.type === 'Bug' ? 'border-red-200 text-red-600 bg-red-50' : 
                            item.type === 'Improvement' ? 'border-blue-200 text-blue-600 bg-blue-50' :
                            'border-amber-200 text-amber-600 bg-amber-50'
                          }`}>
                            {item.type}
                          </Badge>
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {item.createdAt ? format(item.createdAt.toDate(), 'MMM d, yyyy • HH:mm') : 'Just now'}
                          </div>
                        </div>
                      </div>
                      {item.rating && (
                        <div className="flex items-center gap-0.5 bg-amber-500/10 px-2 py-1 rounded-lg">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <span className="text-xs font-black text-amber-600">{item.rating}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-foreground font-medium leading-relaxed whitespace-pre-wrap">
                      {item.message}
                    </p>
                    
                    <div className="pt-6 border-t flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs font-black uppercase tracking-tighter border-2 border-background shadow-sm">
                        {(item.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Submitted By</span>
                        <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                          {item.name ? (
                            <span className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-primary" />
                              {item.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic">Anonymous User</span>
                          )}
                        </div>
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
