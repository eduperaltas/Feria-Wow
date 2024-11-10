import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, collection, getDocs } from '@angular/fire/firestore';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class TriviaService {
  constructor(private firestore: Firestore, private cacheService: CacheService) {}

  // Obtiene los datos generales de la trivia (nombre, objetivo, etc.), usando caché y localStorage
  async getTriviaData(tema: string): Promise<any> {
    const cachedData = this.cacheService.get(`trivia_${tema}`);
    if (cachedData) {
      console.log("Datos de trivia obtenidos del caché.");
      return cachedData;
    }

    // Verificar en localStorage si los datos ya están allí
    const localStorageData = localStorage.getItem(`trivia_${tema}`);
    if (localStorageData) {
      const parsedData = JSON.parse(localStorageData);
      this.cacheService.set(`trivia_${tema}`, parsedData);
      console.log("Datos de trivia obtenidos de localStorage.");
      return parsedData;
    }

    // Obtener datos de Firestore si no están en caché ni en localStorage
    const triviaDoc = await getDoc(doc(this.firestore, `trivia/${tema}`));
    const triviaData = triviaDoc.exists() ? triviaDoc.data() : null;

    if (triviaData) {
      // Guardar en caché y en localStorage
      this.cacheService.set(`trivia_${tema}`, triviaData);
      localStorage.setItem(`trivia_${tema}`, JSON.stringify(triviaData));
    }

    return triviaData;
  }

  // Obtiene las preguntas de una trivia específica como un array, usando caché
  async getQuestionsByTema(tema: string): Promise<any[]> {
    const cachedQuestions = this.cacheService.get(`questions_${tema}`);
    if (cachedQuestions) {
      console.log("Preguntas obtenidas del caché.");
      return cachedQuestions;
    }

    const questionsRef = collection(this.firestore, `trivia/${tema}/preguntas`);
    const snapshot = await getDocs(questionsRef);
    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Guardar en caché para futuras consultas
    this.cacheService.set(`questions_${tema}`, questions);
    return questions;
  }

  // Verifica si el usuario ha completado la trivia, utilizando caché
  async hasCompletedTrivia(userId: string, triviaName: string): Promise<boolean> {
    const cacheKey = `completed_${userId}_${triviaName}`;
    const cachedStatus = this.cacheService.get(cacheKey);
    if (cachedStatus !== undefined) {
      console.log("Estado de trivia completada obtenido del caché.");
      return cachedStatus;
    }

    const userDocRef = doc(this.firestore, `users/${userId}/trivias/${triviaName}`);
    const userDoc = await getDoc(userDocRef);
    const completed = userDoc.exists() && userDoc.data()?.['completed'] === true;

    // Guardar en caché para futuras consultas
    this.cacheService.set(cacheKey, completed);
    return completed;
  }

  // Marca la trivia como completada para el usuario
  async markTriviaAsCompleted(userId: string, triviaName: string): Promise<void> {
    const triviaCompletionRef = doc(this.firestore, `users/${userId}/trivias/${triviaName}`);
    await setDoc(triviaCompletionRef, { completed: true }, { merge: true });

    // Actualizar el caché una vez marcada como completada
    this.cacheService.set(`completed_${userId}_${triviaName}`, true);
  }
}
