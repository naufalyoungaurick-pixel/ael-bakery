// Konfigurasi Firebase + fungsi bersama (dipakai index.html dan admin.html)
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,sendEmailVerification,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getDatabase,ref,get,set,update,remove,push,onValue,query,orderByChild,equalTo,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjxp0m-OzIs4UV26OpJ0jRB8ZfYxxaAno",
  authDomain: "aelbakry-c3aed.firebaseapp.com",
  projectId: "aelbakry-c3aed",
  storageBucket: "aelbakry-c3aed.firebasestorage.app",
  messagingSenderId: "715041532745",
  appId: "1:715041532745:web:6d96b520598ce17b5dc898",
  measurementId: "G-7B79Q02JB6"
};

// Ganti dengan URL persis dari Firebase Console > Realtime Database bila berbeda.
const DATABASE_URL = "https://aelbakry-c3aed-default-rtdb.asia-southeast1.firebasedatabase.app";

export const ADMIN_EMAIL = "naufalyoungaurick@gmail.com";
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app), db = getDatabase(app, DATABASE_URL || undefined);
export const isAdmin = u => !!u && (u.email || "").toLowerCase() === ADMIN_EMAIL;
export const masuk = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const daftar = async (email, password) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(credential.user);
  return credential;
};
export const kirimVerifikasi = user => sendEmailVerification(user);
export const keluar = () => signOut(auth);
export {onAuthStateChanged,ref,get,set,update,remove,push,onValue,query,orderByChild,equalTo,serverTimestamp};

// Batasi waktu tunggu supaya halaman tidak menggantung kalau database tidak bisa dihubungi
export const batas = (p, ms = 8000) => Promise.race([Promise.resolve(p), new Promise((_, r) => setTimeout(() => r(Object.assign(new Error("timeout"), {code:"timeout"})), ms))]);

// Gabungkan menu bawaan (menu.js) dengan perubahan admin di database.
export async function ambilMenu(){
  const m = structuredClone(MENU); const ed = {}, baru = [];
  try{
    const [a,b] = await batas(Promise.all([get(ref(db,"menu_edit")), get(ref(db,"menu_baru"))]), 6000);
    a.forEach(d => { ed[d.key] = d.val(); });
    b.forEach(d => { baru.push({id:d.key, ...d.val()}); });
  }catch(e){ console.warn("Perubahan menu belum bisa dimuat:", e); m.gagal = true; return m; }
  m.forEach(c => {
    c.items.forEach(it => { const e = ed[it.id]; if(!e) return;
      if(e.n) it.n = e.n;
      const vp = e.vp ? Object.values(e.vp) : [];
      vp.forEach((p,i) => { if(it.v[i] && p > 0) it.v[i][1] = p; });
      it.habis = !!e.habis; it.hapus = !!e.hapus; it.diedit = true; });
    baru.filter(x => x.kat === c.id).forEach(x => c.items.push({id:"baru-"+x.id, did:x.id, n:x.n, img:x.img||null, note:x.note||"", v:[["",x.p]], habis:!!x.habis, baru:1}));
  });
  return m;
}
