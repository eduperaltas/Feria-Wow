import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({"projectId":"feria-wow","appId":"1:649771887294:web:171704f2e4a7ff4d35ccef","storageBucket":"feria-wow.firebasestorage.app","apiKey":"AIzaSyCHJiHlDv1Fk2JS7_v6UwlzutaM9cmU-bE","authDomain":"feria-wow.firebaseapp.com","messagingSenderId":"649771887294","measurementId":"G-WM7LLK7RJ4"})), provideFirestore(() => getFirestore()), provideStorage(() => getStorage())]
};
