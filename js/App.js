import React, { useState, useEffect } from "react";
import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, collection, getDocs, addDoc } from "./firebase";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState([]);

  // Firestore'dan kullanıcıları çek
  useEffect(() => {
    async function fetchUsers() {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = [];
      querySnapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(userList);
    }
    fetchUsers();
  }, []);

  // Yeni kullanıcı ekle
  async function addUser() {
    try {
      await addDoc(collection(db, "users"), {
        email,
        password,
      });
      alert("Kullanıcı eklendi!");
    } catch (e) {
      alert("Hata: " + e.message);
    }
  }

  // Firebase Authentication ile giriş yap
  async function signIn() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Başarılı giriş!");
    } catch (e) {
      alert("Giriş hatası: " + e.message);
    }
  }

  // Yeni kullanıcı oluştur
  async function signUp() {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Kullanıcı kaydı başarılı!");
    } catch (e) {
      alert("Kayıt hatası: " + e.message);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Firebase React Örnek</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <br />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <br />
      <button onClick={signIn}>Giriş Yap</button>
      <button onClick={signUp}>Kayıt Ol</button>
      <button onClick={addUser}>Firestore'a Kaydet</button>

      <h3>Firestore'daki Kullanıcılar</h3>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.email} - {user.password}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
