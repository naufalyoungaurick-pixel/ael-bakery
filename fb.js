// Konfigurasi Firebase + fungsi bersama (dipakai index.html dan admin.html)
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {initializeFirestore,collection,doc,getDocs,setDoc,addDoc,updateDoc,deleteDoc,query,where,orderBy,onSnapshot,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAYxpUnJM5vXrHEmf6p_d4jLi9UWEZac1s",
  authDomain: "bekeri.firebaseapp.com",
  projectId: "bekeri",
  storageBucket: "bekeri.firebasestorage.app",
  messagingSenderId: "933077796176",
  appId: "1:933077796176:web:5aeb866ab4bc0d7ee8d855",
  measurementId: "G-7D1JPDTVDX"
};

export const ADMIN_EMAIL = "naufalyoungaurick@gmail.com";
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app), db = initializeFirestore(app, {experimentalAutoDetectLongPolling: true});
export const isAdmin = u => !!u && (u.email || "").toLowerCase() === ADMIN_EMAIL;
export const masuk = () => signInWithPopup(auth, new GoogleAuthProvider());
export const keluar = () => signOut(auth);
export {onAuthStateChanged,collection,doc,getDocs,setDoc,addDoc,updateDoc,deleteDoc,query,where,orderBy,onSnapshot,serverTimestamp};

// Batasi waktu tunggu supaya halaman tidak menggantung kalau Firestore tidak bisa dihubungi
export const batas = (p, ms = 8000) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(Object.assign(new Error("timeout"), {code:"timeout"})), ms))]);

// Gabungkan menu bawaan (menu.js) dengan perubahan admin di Firestore.
export async function ambilMenu(){
  const m = structuredClone(MENU); const ed = {}, baru = [];
  try{
    const [a,b] = await batas(Promise.all([getDocs(collection(db,"menu_edit")), getDocs(collection(db,"menu_baru"))]), 6000);
    a.forEach(d => ed[d.id] = d.data()); b.forEach(d => baru.push({id:d.id, ...d.data()}));
  }catch(e){ console.warn("Perubahan menu belum bisa dimuat:", e); m.gagal = true; return m; }
  m.forEach(c => {
    c.items.forEach(it => { const e = ed[it.id]; if(!e) return;
      if(e.n) it.n = e.n;
      if(Array.isArray(e.vp)) e.vp.forEach((p,i) => { if(it.v[i] && p > 0) it.v[i][1] = p; });
      it.habis = !!e.habis; it.hapus = !!e.hapus; it.diedit = true; });
    baru.filter(x => x.kat === c.id).forEach(x => c.items.push({id:"baru-"+x.id, did:x.id, n:x.n, img:x.img||null, note:x.note||"", v:[["",x.p]], habis:!!x.habis, baru:1}));
  });
  return m;
}
