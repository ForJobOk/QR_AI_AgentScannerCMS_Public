import { auth } from "./firebaseConfig";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  UserCredential,
  User
} from "firebase/auth";

// ユーザーログイン処理
export const login = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

// ユーザー新規登録処理
export const register = async (email: string, password: string): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// ユーザーログアウト処理
export const logout = async (): Promise<void> => {
  return signOut(auth);
};

// ユーザーの認証状態を監視する関数
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
