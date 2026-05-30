import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, firestore } from '../lib/firebase'
import { db } from '../db/database'
import { initFirestoreListener } from './syncService'
import type { Usuario } from '../lib/types'

export async function login(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password)
}

export async function register(data: {
  nombre: string; email: string; telefono: string; password: string
}): Promise<void> {
  const cred = await createUserWithEmailAndPassword(auth, data.email, data.password)
  const uid = cred.user.uid
  const usuario: Usuario = {
    id: uid,
    nombre: data.nombre,
    email: data.email,
    telefono: data.telefono,
    password: '',
    rolId: 'admin',
    fotoURL: '',
  }
  await setDoc(doc(firestore, 'usuarios', uid), usuario)
  await db.usuarios.put(usuario)
}

export async function logout(): Promise<void> {
  await signOut(auth)
}

export async function loadUserFromFirestore(uid: string): Promise<Usuario | null> {
  const snap = await getDoc(doc(firestore, 'usuarios', uid))
  if (snap.exists()) {
    const user = snap.data() as Usuario
    await db.usuarios.put(user)
    return user
  }
  return null
}
