import { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '../firebase/config';
import { emailToKey, ensureUserNode, createUserNode } from '../firebase/utils';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Get user name from Firebase DB
        const emailKey = emailToKey(currentUser.email);
        try {
          const userRef = ref(db, "users/" + emailKey + "/profile");
          const snap = await get(userRef);
          if (snap.exists()) {
            const profile = snap.val();
            setUserName(profile.name || currentUser.displayName || currentUser.email.split('@')[0]);
          } else {
            setUserName(currentUser.displayName || currentUser.email.split('@')[0]);
          }
        } catch (err) {
          setUserName(currentUser.displayName || currentUser.email.split('@')[0]);
        }
      } else {
        setUserName('');
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    // Step 1: Sign in with email/password
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    // Step 2: Ensure user node exists in RTDB (creates if missing, updates lastLogin if exists)
    await ensureUserNode(user);

    console.log('✅ Login complete - User node ensured in RTDB');
    return user;
  };

  const signup = async (email, password, name) => {
    // Step 1: Create auth user
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    // Step 2: Update displayName
    await updateProfile(user, { displayName: name });

    // Step 3: Create RTDB node (EXACT same as HTML)
    await createUserNode(user, name);

    console.log('✅ Signup complete - User and database node created');
    return user;
  };

  const googleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const cred = await signInWithPopup(auth, provider);
    const mode = await ensureUserNode(cred.user);
    return { user: cred.user, mode };
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    userName,
    loading,
    login,
    signup,
    googleLogin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
