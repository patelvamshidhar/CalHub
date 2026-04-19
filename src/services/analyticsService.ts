import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const STATS_DOC_PATH = 'stats/visitors';

export const trackVisitor = async () => {
  try {
    // 1. Generate / Get Unique User ID
    let userId = localStorage.getItem('calhub_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('calhub_user_id', userId);
    }

    // 2. Check Last Visit Date to avoid duplicate counting per day
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastVisitDate = localStorage.getItem('calhub_last_visit');

    if (lastVisitDate === today) {
      console.log('Already counted today');
      return;
    }

    // 3. Update Database
    const statsRef = doc(db, STATS_DOC_PATH);
    const dailyRef = doc(db, `stats/daily_${today}`); // Simple doc per day

    // Use a try-catch for the first visit ever (doc might not exist)
    const statsDoc = await getDoc(statsRef);
    
    // Update Total Count
    if (!statsDoc.exists()) {
      await setDoc(statsRef, {
        totalCount: 1,
        lastUpdated: serverTimestamp()
      });
    } else {
      await updateDoc(statsRef, {
        totalCount: increment(1),
        lastUpdated: serverTimestamp()
      });
    }

    // Update Daily Count
    const dailyDoc = await getDoc(dailyRef);
    if (!dailyDoc.exists()) {
      await setDoc(dailyRef, {
        dailyCount: 1,
        date: today,
        lastUpdated: serverTimestamp()
      });
    } else {
      await updateDoc(dailyRef, {
        dailyCount: increment(1),
        lastUpdated: serverTimestamp()
      });
    }

    // 4. Update Local Storage ONLY AFTER SUCCESSFUL DB UPDATE
    localStorage.setItem('calhub_last_visit', today);
    console.log('Visitor tracked successfully');
    return true;
  } catch (error) {
    console.error('Error tracking visitor:', error);
    return false;
  }
};

export const getVisitorStats = async () => {
  try {
    const statsRef = doc(db, STATS_DOC_PATH);
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      return statsDoc.data();
    }
    return { totalCount: 0 };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { totalCount: 0 };
  }
};
