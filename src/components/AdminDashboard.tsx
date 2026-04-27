import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, query, orderBy, where, Timestamp, getDocs, writeBatch, deleteDoc, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
          <Card className="border-none shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] bg-card dark:bg-zinc-950 overflow-hidden rounded-[2.5rem]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
            <CardHeader className="pb-6 sm:pb-8 pt-8 sm:pt-10 px-6 sm:px-10 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-500 text-white rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/20 group hover:rotate-12 transition-transform duration-500">
                <Lock className="h-8 w-8 sm:h-10 sm:h-10" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-black tracking-tighter uppercase italic text-foreground dark:text-zinc-100">Neural Gate</CardTitle>
              <CardDescription className="text-muted-foreground font-medium text-xs sm:text-sm">Authentication required to access the central terminal.</CardDescription>
            </CardHeader>
            <CardContent className="px-6 sm:px-10 pb-10 sm:pb-12 space-y-6 sm:space-y-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Access Key</Label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors duration-500" />
                    <Input
                      type="password"
                      placeholder="ENTER KEYCODE"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginError(false);
                      }}
                      className={`pl-12 h-16 bg-muted/20 dark:bg-zinc-950 border-2 transition-all duration-500 font-black text-lg text-foreground dark:text-zinc-100 uppercase tracking-[0.3em] rounded-2xl outline-none ${
                        loginError ? 'border-red-500 focus:ring-red-500/20' : 'border-border dark:border-zinc-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
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
                        className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center"
                      >
                        Access Denied: Invalid Keycode
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-16 rounded-3xl bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-blue-500/20 transition-all duration-500 hover:scale-[1.01] active:scale-[0.99]"
                >
                  Decrypt & Authorize
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
    <div className="space-y-10 animate-in fade-in duration-700 max-w-[90rem] mx-auto pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 p-4 sm:p-0">
        <div className="space-y-2 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic text-foreground dark:text-zinc-100">Central <span className="text-blue-500">Terminal</span></h2>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium">Monitoring real-time neural feedback and system performance matrix.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLoggedIn(false)}
            className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[11px] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            Terminal Logout
          </Button>
        </div>
      </div>

      {/* Visitor Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-0">
        <Card className="border-none shadow-2xl bg-card dark:bg-zinc-950 overflow-hidden relative rounded-[2rem] p-1">
          <div className="absolute right-0 top-0 p-6 opacity-[0.05]">
            <Users className="h-20 w-20 text-blue-500" />
          </div>
          <CardHeader className="pb-2 pt-6 px-6 relative z-10">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Core Visitors</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 relative z-10">
            <div className="text-5xl font-black tracking-tighter text-foreground dark:text-zinc-100">
              {visitorStats.totalCount.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Lifetime Instances</p>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
        </Card>

        <Card className="border-none shadow-2xl bg-card dark:bg-zinc-950 overflow-hidden relative rounded-[2rem] p-1">
          <div className="absolute right-0 top-0 p-6 opacity-[0.05]">
            <CalendarDays className="h-20 w-20 text-emerald-500" />
          </div>
          <CardHeader className="pb-2 pt-6 px-6 relative z-10">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Active Cycle Sessions</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 relative z-10">
            <div className="text-5xl font-black tracking-tighter text-foreground dark:text-zinc-100">
              {visitorStats.dailyCount.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Current 24h Window</p>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
        </Card>

        <Card className="border-none shadow-2xl bg-card dark:bg-zinc-950 overflow-hidden relative rounded-[2rem] p-1">
          <div className="absolute right-0 top-0 p-6 opacity-[0.05]">
            <MessageSquare className="h-20 w-20 text-purple-500" />
          </div>
          <CardHeader className="pb-2 pt-6 px-6 relative z-10">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Feedback Packets</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 relative z-10">
            <div className="text-5xl font-black tracking-tighter text-foreground dark:text-zinc-100">
              {feedback.length}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1 w-1 rounded-full bg-purple-500 animate-pulse" />
              <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest">Awaiting Analysis</p>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-600" />
        </Card>

        <Card className="border-none shadow-2xl bg-card dark:bg-zinc-950 overflow-hidden relative rounded-[2rem] p-1">
          <div className="absolute right-0 top-0 p-6 opacity-[0.05]">
            <RefreshCcw className="h-20 w-20 text-amber-500" />
          </div>
          <CardHeader className="pb-2 pt-6 px-6 relative z-10">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sync Status</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 relative z-10">
            <div className="text-4xl font-black tracking-tighter text-foreground dark:text-zinc-100 uppercase italic">
              ONLINE
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Real-time Datastream</p>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
        </Card>
      </div>

      {/* Unified Clear Button */}
      <div className="pt-4 px-4 sm:px-0">
        {!showConfirm ? (
          <Button
            variant="destructive"
            onClick={() => setShowConfirm(true)}
            disabled={isClearing || feedback.length === 0}
            className="w-full h-16 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] gap-4 shadow-2xl shadow-red-500/10 transition-all duration-500 hover:scale-[1.005] active:scale-[0.995] bg-red-950/20 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
          >
            <Trash2 className="h-6 w-6" />
            Purge All Neural Records
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-950/40 border-2 border-red-500/20 p-6 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-2xl">
                <AlertTriangle className="h-6 w-6 text-red-500 animate-bounce" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-black text-red-500 uppercase tracking-tight">Destructive Protocol Initialized</p>
                <p className="text-xs font-bold text-red-400 opacity-60">This action will irreversibly wipe all user feedback and logs.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => setShowConfirm(false)}
                className="flex-1 sm:flex-none h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                Abort Protocol
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleClearAllReports}
                disabled={isClearing}
                className="flex-1 sm:flex-none h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] gap-3 shadow-2xl shadow-red-500/20 bg-red-600 hover:bg-red-700 text-white"
              >
                {isClearing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                Confirm Purge
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-10">
        <div className="relative flex-1 w-full sm:min-w-[300px] group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors duration-500" />
          <input
            type="text"
            placeholder="SCAN FEEDBACK MATRIX..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-14 pr-6 rounded-[1.5rem] border-2 border-border dark:border-zinc-800 bg-muted/20 dark:bg-zinc-950 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-black uppercase tracking-widest text-foreground dark:text-zinc-100 transition-all duration-500"
          />
        </div>
        
        <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
          <SelectTrigger className="h-14 w-44 rounded-[1.5rem] border-2 border-border dark:border-zinc-800 bg-muted/20 dark:bg-zinc-950 font-black text-[11px] uppercase tracking-widest text-foreground dark:text-zinc-100 focus:ring-blue-500">
            <Filter className="h-4 w-4 mr-3 text-blue-500" />
            <SelectValue placeholder="Matrix Filter" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl bg-card dark:bg-zinc-900 border-border dark:border-zinc-800 text-foreground dark:text-zinc-100">
            <SelectItem value="All">All Entities</SelectItem>
            <SelectItem value="Suggestion">Suggestions</SelectItem>
            <SelectItem value="Bug">System Anomalies</SelectItem>
            <SelectItem value="Improvement">Optimizations</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="h-14 px-6 rounded-[1.5rem] border border-gray-300 dark:border-gray-600 font-black uppercase tracking-widest text-[11px] gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 shadow-xl"
        >
          <ArrowUpDown className="h-4 w-4 text-blue-500" />
          {sortOrder === 'desc' ? 'Chronological' : 'Reverse'}
        </Button>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-center gap-3 text-emerald-500 text-[11px] font-black uppercase tracking-widest"
          >
            <CheckCircle2 className="h-5 w-5" />
            Neural Wipe Completed Successfully
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Activity Log */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="border-none shadow-2xl overflow-hidden bg-card dark:bg-zinc-950 rounded-[2.5rem]">
            <CardHeader className="pb-6 pt-10 px-10 relative bg-muted/30 dark:bg-zinc-950/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <CardTitle className="text-[11px] font-black uppercase tracking-[0.25em] text-foreground dark:text-zinc-100">Live Node Activity</CardTitle>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Stream Active</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto scrollbar-hide">
                {recentVisitors.length === 0 ? (
                  <div className="py-20 text-center text-muted-foreground text-[11px] font-black uppercase italic tracking-widest">No activity log detected</div>
                ) : (
                  recentVisitors.map((visitor, idx) => (
                    <div key={idx} className="p-6 flex items-center justify-between hover:bg-muted/50 dark:hover:bg-zinc-900/50 transition-colors duration-500 border-l-2 border-transparent hover:border-blue-500 group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-muted dark:bg-zinc-900 border border-border dark:border-zinc-800 flex items-center justify-center text-sm font-black text-blue-500 shadow-xl group-hover:scale-110 transition-transform duration-500">
                          {visitor.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h4 className="text-[13px] font-black uppercase tracking-tighter text-foreground dark:text-zinc-100 truncate max-w-[140px]">{visitor.name || 'Anonymous Node'}</h4>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">ID: {visitor.userId?.substring(0, 12)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">
                          <Clock className="h-3.5 w-3.5" />
                          {visitor.timestamp ? format(visitor.timestamp.toDate(), 'HH:mm') : 'NOW'}
                        </div>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{visitor.date || 'CYCLE T0'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Feedback List */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="h-[600px] flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-4 border-muted dark:border-zinc-900 border-t-blue-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <RefreshCcw className="h-8 w-8 text-blue-500 animate-pulse" />
                </div>
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Syncing Neural Grid...</p>
            </div>
          ) : error ? (
            <Card className="border-2 border-red-500/20 bg-red-950/10 rounded-[3rem]">
              <CardContent className="py-24 text-center space-y-6">
                <AlertTriangle className="h-16 w-16 text-red-500 mx-auto animate-bounce" />
                <p className="text-2xl font-black text-red-500 uppercase tracking-tight italic">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="h-14 px-8 rounded-2xl border-2 border-red-500/20 text-red-500 font-black uppercase tracking-widest text-[11px]">Retry Authorization</Button>
              </CardContent>
            </Card>
          ) : filteredFeedback.length === 0 ? (
            <Card className="border-2 border-dashed border-border dark:border-zinc-800 bg-muted/20 dark:bg-zinc-950/50 rounded-[3rem]">
              <CardContent className="py-32 text-center space-y-6">
                <div className="w-24 h-24 bg-card dark:bg-zinc-900 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl border border-border dark:border-zinc-800">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-black tracking-tight uppercase text-muted-foreground/40 italic">No Neural Data Captured</p>
                  <p className="text-muted-foreground/30 font-bold uppercase text-[10px] tracking-widest">Waiting for user broadcasts to populate the matrix.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredFeedback.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Card className="border-none transition-all duration-500 shadow-2xl bg-card dark:bg-zinc-950 group relative overflow-hidden rounded-[2.5rem] p-1">
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${
                        item.type === 'Bug' ? 'bg-red-500' : 
                        item.type === 'Improvement' ? 'bg-blue-500' :
                        'bg-amber-500'
                      }`} />
                      
                      <CardHeader className="pb-4 pt-8 px-8">
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${
                              item.type === 'Bug' ? 'bg-red-500/10 text-red-500' : 
                              item.type === 'Improvement' ? 'bg-blue-500/10 text-blue-500' :
                              'bg-amber-500/10 text-amber-500'
                            } shadow-xl`}>
                              {item.type === 'Bug' ? <Bug className="h-6 w-6" /> : 
                               item.type === 'Improvement' ? <Rocket className="h-6 w-6" /> :
                               <Lightbulb className="h-6 w-6" />}
                            </div>
                            <div>
                               <div className="flex items-center gap-2 mb-2">
                                  <Badge className={`rounded-xl font-black uppercase tracking-widest text-[9px] px-3 py-1 ${
                                    item.type === 'Bug' ? 'bg-red-600 text-white' : 
                                    item.type === 'Improvement' ? 'bg-blue-600 text-white' :
                                    'bg-amber-500 text-white'
                                  }`}>
                                    {item.type}
                                  </Badge>
                                  {item.rating && (
                                    <div className="flex items-center gap-1.5 bg-muted dark:bg-zinc-900 px-3 py-1 rounded-xl border border-border dark:border-zinc-800">
                                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                      <span className="text-[10px] font-black text-gray-900 dark:text-zinc-100">{item.rating}</span>
                                    </div>
                                  )}
                               </div>
                              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground dark:text-zinc-400">
                                <Clock className="h-3.5 w-3.5" />
                                {item.createdAt ? format(item.createdAt.toDate(), 'MMMM d, yyyy • HH:mm') : 'TIME_NULL'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-8 px-10 pb-10">
                        <div className="bg-muted/30 dark:bg-zinc-900/50 p-6 rounded-3xl border border-border dark:border-zinc-800 relative group-hover:bg-muted/50 dark:group-hover:bg-zinc-900 transition-colors duration-500">
                          <p className="text-foreground dark:text-zinc-100 font-bold leading-relaxed whitespace-pre-wrap italic text-lg">
                            "{item.message}"
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4 pt-8">
                          <div className="w-14 h-14 rounded-2xl bg-muted dark:bg-zinc-900 border border-border dark:border-zinc-800 flex items-center justify-center text-lg font-black uppercase tracking-widest text-blue-500 shadow-2xl">
                            {(item.name || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground dark:text-zinc-500 mb-1">Packet Origin</span>
                            <div className="flex items-center gap-2 text-base font-black text-gray-900 dark:text-zinc-100 uppercase italic tracking-tight">
                              {item.name ? (
                                <>
                                  <User className="h-4 w-4 text-blue-500" />
                                  {item.name}
                                </>
                              ) : (
                                <span className="text-muted-foreground italic tracking-[0.3em]">ANONYMOUS_NODE</span>
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
      </div>
    </div>
  );
};
