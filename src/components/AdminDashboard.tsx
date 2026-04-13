import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Star, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Search,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  ArrowUpDown,
  LogOut
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { db, auth, googleProvider, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface FeedbackItem {
  id: string;
  name?: string;
  rating?: number;
  type?: string;
  category?: string;
  section?: string;
  message: string;
  timestamp: Timestamp;
  status: 'New' | 'Reviewed' | 'Resolved';
  isSuggestion?: boolean;
}

export const AdminDashboard = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [suggestions, setSuggestions] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Secret route + simple password check
    const authStatus = localStorage.getItem('admin_auth');
    if (authStatus === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthorized) return;

    const qFeedback = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'));
    const qSuggestions = query(collection(db, 'suggestions'), orderBy('timestamp', 'desc'));

    const unsubFeedback = onSnapshot(qFeedback, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedbackItem));
      setFeedback(data);
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'feedback'));

    const unsubSuggestions = onSnapshot(qSuggestions, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), isSuggestion: true } as FeedbackItem));
      setSuggestions(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'suggestions'));

    return () => {
      unsubFeedback();
      unsubSuggestions();
    };
  }, [isAuthorized]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Patel@9488') {
      setIsAuthorized(true);
      localStorage.setItem('admin_auth', 'true');
    } else {
      alert('Invalid password');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      if (user.email === 'reddyvamshi607@gmail.com') {
        setIsAuthorized(true);
        localStorage.setItem('admin_auth', 'true');
      } else {
        alert('Unauthorized access. Only the admin can log in via Google.');
        await auth.signOut();
      }
    } catch (err) {
      console.error('Google Login Error:', err);
      alert('Failed to login with Google');
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    localStorage.removeItem('admin_auth');
    navigate('/');
  };

  const updateStatus = async (id: string, newStatus: string, isSuggestion: boolean) => {
    try {
      const ref = doc(db, isSuggestion ? 'suggestions' : 'feedback', id);
      await updateDoc(ref, { status: newStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, id);
    }
  };

  const deleteItem = async (id: string, isSuggestion: boolean) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      const ref = doc(db, isSuggestion ? 'suggestions' : 'feedback', id);
      await deleteDoc(ref);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, id);
    }
  };

  const exportData = () => {
    const allData = [...feedback, ...suggestions].sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Type,Name/Category,Rating/Section,Message,Status\n"
      + allData.map(item => {
          const date = item.timestamp.toDate().toLocaleString();
          const type = item.isSuggestion ? 'Suggestion' : item.type;
          const name = item.isSuggestion ? item.category : item.name;
          const rating = item.isSuggestion ? item.section : item.rating;
          return `"${date}","${type}","${name}","${rating}","${item.message.replace(/"/g, '""')}","${item.status}"`;
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `easycalc_feedback_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allItems = [...feedback, ...suggestions]
    .filter(item => {
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      if (filterType !== 'all') {
        if (filterType === 'Feedback' && item.isSuggestion) return false;
        if (filterType === 'Suggestion' && !item.isSuggestion) return false;
      }
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          item.message.toLowerCase().includes(search) ||
          (item.name?.toLowerCase().includes(search)) ||
          (item.category?.toLowerCase().includes(search))
        );
      }
      return true;
    })
    .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md border-2 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-black">Admin Access</CardTitle>
            <CardDescription>Enter password to view feedback dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  className="h-12 border-2"
                />
              </div>
              <Button type="submit" className="w-full h-12 font-black uppercase tracking-widest">
                Login to Dashboard
              </Button>
              
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGoogleLogin}
                className="w-full h-12 font-black uppercase tracking-widest border-2 gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Forgot Password? Login with Google
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              Owner Dashboard
            </h1>
            <p className="text-muted-foreground font-medium">Manage user feedback and suggestions</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={exportData} className="flex-1 sm:flex-none font-bold border-2 gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="flex-1 sm:flex-none font-bold gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="border-2 shadow-lg bg-blue-500/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Feedback</p>
                <p className="text-3xl font-black">{feedback.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 shadow-lg bg-amber-500/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                <Star className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total Suggestions</p>
                <p className="text-3xl font-black">{suggestions.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 shadow-lg bg-green-500/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Resolved Items</p>
                <p className="text-3xl font-black">
                  {[...feedback, ...suggestions].filter(i => i.status === 'Resolved').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-2 shadow-lg">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search messages or names..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 border-2"
              />
            </div>
            <div className="flex gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] h-10 border-2">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Reviewed">Reviewed</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px] h-10 border-2">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Feedback">Feedback</SelectItem>
                  <SelectItem value="Suggestion">Suggestion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-2 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b-2">
                <tr>
                  <th className="p-4 font-black uppercase tracking-widest text-[10px]">Date</th>
                  <th className="p-4 font-black uppercase tracking-widest text-[10px]">Source</th>
                  <th className="p-4 font-black uppercase tracking-widest text-[10px]">Details</th>
                  <th className="p-4 font-black uppercase tracking-widest text-[10px]">Message</th>
                  <th className="p-4 font-black uppercase tracking-widest text-[10px]">Status</th>
                  <th className="p-4 font-black uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <AnimatePresence mode="popLayout">
                  {allItems.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold">{item.timestamp?.toDate().toLocaleDateString()}</span>
                          <span className="text-[10px] text-muted-foreground">{item.timestamp?.toDate().toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={item.isSuggestion ? "outline" : "default"} className="font-black uppercase text-[9px]">
                          {item.isSuggestion ? "Suggestion" : item.type}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-black text-xs">
                            {item.isSuggestion ? item.category : item.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {item.isSuggestion ? (
                              <>Section: {item.section}</>
                            ) : (
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-2 w-2 ${i < (item.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/20'}`} />
                                ))}
                              </div>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="line-clamp-2 text-xs font-medium">{item.message}</p>
                      </td>
                      <td className="p-4">
                        <Select 
                          value={item.status} 
                          onValueChange={(v) => updateStatus(item.id, v, !!item.isSuggestion)}
                        >
                          <SelectTrigger className={`h-8 w-28 text-[10px] font-black uppercase border-2 ${
                            item.status === 'New' ? 'border-blue-200 bg-blue-50 text-blue-600' :
                            item.status === 'Reviewed' ? 'border-amber-200 bg-amber-50 text-amber-600' :
                            'border-green-200 bg-green-50 text-green-600'
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Reviewed">Reviewed</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteItem(item.id, !!item.isSuggestion)}
                          className="text-destructive hover:bg-destructive/10 rounded-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {allItems.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                <p className="font-bold">No items found matching your filters.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
