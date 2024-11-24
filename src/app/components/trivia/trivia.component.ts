import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TriviaService } from '../../services/trivia.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-trivia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trivia.component.html',
  styleUrls: ['./trivia.component.css']
})
export class TriviaComponent implements OnInit, OnDestroy {
  tema: string | null = '';
  questions: any[] = [];
  answeredQuestions: Set<string> = new Set(); // IDs de preguntas ya contestadas correctamente
  currentQuestionIndex = 0;
  currentQuestion: any;
  feedbackMessage = '';
  feedbackClass = '';
  isAnswered = false;
  triviaName = '';
  objetivo = 0;
  answeredCorrectly = 0;
  userId = '';
  timeLeft = 10;
  timerInterval: any;
  selectedAnswer: string | null = null;
  showFeedback = false;
  name: string | null = '';

  constructor(
    private triviaService: TriviaService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.tema = this.route.snapshot.paramMap.get('tema');
    this.userId = this.authService.getUsername() || '';
    this.name = this.authService.getName();
    if (this.tema) {
      const completed = await this.triviaService.hasCompletedTrivia(this.userId, this.tema);
      if (completed) {
        this.router.navigate(['/felicitacion']);
        return;
      }
      await this.loadTriviaData();
    }
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  handleOptionClick(optionKey: string): void {
    if (this.isAnswered || this.showFeedback) return; // Evitar múltiples clics mientras se muestra el feedback
  
    this.selectedAnswer = optionKey;
    this.isAnswered = true; // Marcar la pregunta como respondida
    this.clearTimer(); // Detener el temporizador si está activo
  
    const correctAnswerKey = this.currentQuestion['respuesta'].toString();
  
    // Agregar un pequeño delay antes de mostrar el feedback
    setTimeout(() => {
      // Verificar si la respuesta es correcta o incorrecta
      if (optionKey === correctAnswerKey) {
        this.feedbackMessage = '¡Correcto!';
        this.feedbackClass = 'feedback-box show';
        this.answeredCorrectly++;
      } else {
        this.feedbackMessage = '¡Sigue intentando!';
        this.feedbackClass = 'feedback-box show';
      }
    
  
      // Mostrar el feedback y pasar a la siguiente pregunta después de 2 segundos
      setTimeout(() => {
        this.feedbackClass = 'feedback-box'; // Oculta el feedback después de 2 segundos
        this.resetForNextQuestion();
      }, 2000);
    }, 500); // Delay de medio segundo antes de mostrar el feedback
  }
  
  resetForNextQuestion(): void {
    this.showFeedback = false;
    this.feedbackMessage = '';
    this.feedbackClass = '';
    this.selectedAnswer = null;
    this.isAnswered = false;
  
    if (this.currentQuestionIndex < this.questions.length - 1) {
      // Avanzar a la siguiente pregunta
      this.currentQuestionIndex++;
      this.currentQuestion = this.questions[this.currentQuestionIndex];
      this.startTimer(); // Reiniciar el temporizador para la nueva pregunta
    } else {
      // Si no hay más preguntas, finaliza la trivia
      this.completeTrivia();
    }
  }
  
  startTimer(): void {
    const circle = document.querySelector(".progress-ring__circle") as SVGCircleElement;
    const radius = 35; // Radio del círculo
    const circumference = 2 * Math.PI * radius;
  
    if (circle) {
      circle.style.strokeDasharray = `${circumference} ${circumference}`;
      circle.style.strokeDashoffset = `${circumference}`;
    }
  
    this.timeLeft = 10; // Tiempo inicial en segundos
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
  
        // Actualizar el progreso del círculo
        const offset = circumference - (this.timeLeft / 10) * circumference;
        if (circle) {
          circle.style.strokeDashoffset = `${offset}`;
        }
      } else {
        clearInterval(this.timerInterval);
        this.handleTimeout(); // Lógica cuando el tiempo se agota
      }
    }, 1000); // Actualización cada segundo
  }
  
  handleTimeout(): void {
    this.clearTimer();
    this.showFeedback = true;
    this.feedbackMessage = 'Tiempo agotado';
    this.feedbackClass = 'feedback-overlay show incorrecto';
    this.isAnswered = true; // Marcar como respondida para prevenir clics
  
    setTimeout(() => {
      this.resetForNextQuestion();
    }, 2000);
  }
  
  clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private async loadTriviaData() {
    const triviaData = await this.triviaService.getTriviaData(this.tema!);
    if (triviaData) {
      this.triviaName = triviaData.nombre || '';
      this.objetivo = Number(triviaData.objetivo) || 0;
      await this.loadQuestions();
    }
  }

  private async loadQuestions() {
    this.questions = this.shuffleArray(
      (await this.triviaService.getQuestionsByTema(this.tema!)).filter(
        question => !this.answeredQuestions.has(question.id)
      )
    );
    this.currentQuestionIndex = 0;
    this.currentQuestion = this.questions[this.currentQuestionIndex];
    this.startTimer();
  }

  private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  getOptionKeys(question: any): string[] {
    return Object.keys(question).filter(key => !isNaN(Number(key))).sort();
  }

  public nextQuestion() {
    this.resetFeedback();
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.currentQuestion = this.questions[this.currentQuestionIndex];
      this.startTimer();
    } else {
      this.resetUnansweredQuestions();
    }
  }

  private resetUnansweredQuestions() {
    // Filtrar solo las preguntas que no se contestaron correctamente
    this.questions = this.shuffleArray(
      this.questions.filter(question => !this.answeredQuestions.has(question.id))
    );
    if (this.questions.length === 0) {
      console.log('No hay preguntas restantes. Reiniciando todas las preguntas.');
      this.loadQuestions(); // Cargar todas las preguntas excepto las contestadas correctamente
    } else {
      console.log('Reiniciando preguntas no contestadas.');
      this.currentQuestionIndex = 0;
      this.currentQuestion = this.questions[this.currentQuestionIndex];
      this.startTimer();
    }
  }

  private async completeTrivia() {
    await this.triviaService.markTriviaAsCompleted(this.userId, this.triviaName);
    this.router.navigate(['/bienvenida']);
  }

  private resetFeedback() {
    this.isAnswered = false;
    this.feedbackMessage = '';
    this.feedbackClass = '';
    this.selectedAnswer = '';
  }
}
