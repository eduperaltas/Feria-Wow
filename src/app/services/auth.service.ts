import { Injectable } from "@angular/core";
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  enableIndexedDbPersistence,
  collection,
  getDocs,
} from "@angular/fire/firestore";
import { CacheService } from "./cache.service";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(
    private firestore: Firestore,
    private cacheService: CacheService // Añadimos CacheService para almacenar datos en caché
  ) {
    // Activar persistencia local en Firestore para AuthService
    enableIndexedDbPersistence(this.firestore).catch((err) => {
      if (err.code == "failed-precondition") {
        console.warn(
          "Persistencia fallida: múltiples pestañas abiertas en AuthService."
        );
      } else if (err.code == "unimplemented") {
        console.warn("Persistencia no soportada en este navegador.");
      }
    });
  }

  // Verificar si el usuario existe, usando caché si es posible
  async userExists(username: string): Promise<boolean> {
    try {
      // Verificar si los datos ya están en el caché
      const cachedUser = this.cacheService.get(`user_${username}`);
      if (cachedUser) {
        console.log(
          "Usuario encontrado en caché, evitando consulta en Firestore."
        );
        return true;
      }
  
      // Consultar en Firestore solo si no está en caché
      const userRef = doc(this.firestore, `users/${username}`);
      const docSnap = await getDoc(userRef);
  
      if (docSnap.exists()) {
        console.log("Usuario encontrado en Firestore.");
        // Guardar en caché el resultado si el usuario existe
        this.cacheService.set(`user_${username}`, docSnap.data());
        return true;
      } else {
        console.warn("Usuario no encontrado en Firestore.");
        return false;
      }
    } catch (error) {
      console.error("Error al verificar si el usuario existe:", error);
      return false; // Devuelve false en caso de error
    }
  }

  // Configurar la sesión del usuario y almacenar los datos en caché y en localStorage
  async setUserSession(username: string): Promise<void> {
    // Verificar si los datos ya están en el caché de localStorage
    const cachedUser = this.cacheService.get(`user_${username}`);
    if (cachedUser) {
      console.log("Datos de usuario obtenidos del caché.");
      this.storeUserDataInLocalStorage(username, cachedUser);
      return;
    }

    const userRef = doc(this.firestore, `users/${username}`);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      this.storeUserDataInLocalStorage(username, userData);

      // Guardamos en caché los datos del usuario
      this.cacheService.set(`user_${username}`, userData);
    } else {
      console.error("El usuario no existe en la base de datos.");
    }
  }

  // Método privado para almacenar datos en localStorage
  private storeUserDataInLocalStorage(username: string, userData: any): void {
    const name = userData?.["nombre"] || "";
    const email = userData?.["correo"] || "";
    const phone = userData?.["telefono"] || "";

    localStorage.setItem("username", username);
    localStorage.setItem("name", name);
    localStorage.setItem("email", email);
    localStorage.setItem("phone", phone);
  }

  // Verificar si el usuario ha visto la pantalla de bienvenida
  async hasSeenWelcome(username: string): Promise<boolean> {
    const welcomeSeen = localStorage.getItem("welcomeSeen");
    if (welcomeSeen === "true") {
      return true;
    }

    const userRef = doc(this.firestore, `users/${username}`);
    const docSnap = await getDoc(userRef);
    const seen = docSnap.exists() && docSnap.data()?.["welcomeSeen"] === true;

    // Guardamos en localStorage para evitar futuras consultas
    if (seen) {
      localStorage.setItem("welcomeSeen", "true");
    }

    return seen;
  }
  // Verificar si el usuario es seguridad
  async IsSecurityAccess(username: string): Promise<boolean> {
    const userRef = doc(this.firestore, `users/${username}`);
    const docSnap = await getDoc(userRef);
    const access = docSnap.exists() && docSnap.data()?.["security"] === true;
    
    return access;
  }

  async registerAttendance(username: string): Promise<string> {
    try {
      // Verificar si el usuario existe
      const exists = await this.userExists(username);
      if (!exists) {
        console.warn(`El usuario ${username} no existe.`);
        return "El usuario no existe. Acceso denegado.";
      }
  
      const userRef = doc(this.firestore, `users/${username}`);
      const docSnap = await getDoc(userRef);
  
      // Verificar si el usuario ya tiene asistencia registrada
      if (docSnap.exists() && docSnap.data()?.["asistencia"] === true) {
        console.warn(`El usuario ${username} ya registró su asistencia.`);
        return `El usuario ${docSnap.data()?.["nombre"] || username} ya registró su asistencia. Acceso denegado.`;
      }
  
      // Registrar asistencia
      await setDoc(userRef, { asistencia: true }, { merge: true });
      const userName = docSnap.data()?.["nombre"] || username; // Obtener el nombre o usar el username si no existe
      console.log(`Asistencia registrada para el usuario ${userName}.`);
      return `Asistencia registrada exitosamente para ${userName}. Acceso permitido.`;
    } catch (error) {
      console.error("Error al registrar la asistencia:", error);
      return "Ocurrió un error al registrar la asistencia. Inténtalo nuevamente.";
    }
  }

  // Marcar la pantalla de bienvenida como vista
  async markWelcomeAsSeen(username: string): Promise<void> {
    const userRef = doc(this.firestore, `users/${username}`);
    await setDoc(userRef, { welcomeSeen: true }, { merge: true });
    localStorage.setItem("welcomeSeen", "true"); // Guardar en localStorage para futuras verificaciones
  }

  // Métodos para manejar el estado de sesión en localStorage
  isUserLoggedIn(): boolean {
    return localStorage.getItem("username") !== null;
  }

  getUsername(): string | null {
    return localStorage.getItem("username");
  }

  getName(): string | null {
    return localStorage.getItem("name");
  }

  setTema(tema: string): void {
    localStorage.setItem("tema", tema);
  }

  getTema(): string | null {
    return localStorage.getItem("tema");
  }

  async getUserSellos(userId: string, forceUpdate: boolean = false): Promise<Record<string, boolean>> {
    const cacheKey = `user_sellos_${userId}`;
  
    // Si no se fuerza la actualización, primero intenta obtener del caché
    if (!forceUpdate) {
      const cachedSellos = this.cacheService.get(cacheKey);
      if (cachedSellos) {
        console.log("Sellos del usuario obtenidos del caché.");
        return cachedSellos;
      }
    }
  
    // Acceso a la colección de sellos del usuario en Firestore
    const sellosRef = collection(this.firestore, `users/${userId}/sellos`);
    const snapshot = await getDocs(sellosRef);
  
    // Construir el objeto de sellos: { selloName: true/false }
    const sellos: Record<string, boolean> = {};
    snapshot.forEach((doc) => {
      const selloName = doc.id;
      const data = doc.data();
      sellos[selloName] = data["completed"] === true;
    });
  
    // Guardar en caché para futuras consultas
    this.cacheService.set(cacheKey, sellos);
  
    return sellos;
  }
}
