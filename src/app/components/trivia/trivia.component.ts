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
  selectedAnswer = '';

  constructor(
    private triviaService: TriviaService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.tema = this.route.snapshot.paramMap.get('tema');
    this.userId = this.authService.getUsername() || '';

    if (this.tema) {
      const completed = await this.triviaService.hasCompletedTrivia(this.userId, this.tema);
      if (completed) {
        this.router.navigate(['/bienvenida']);
        return;
      }
      await this.loadTriviaData();
    }
  }

  ngOnDestroy() {
    this.clearTimer();
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

  selectAnswer(optionKey: string) {
    if (this.isAnswered) return;

    this.selectedAnswer = optionKey;
    this.isAnswered = true;
    this.clearTimer();
    const correctAnswerKey = this.currentQuestion['respuesta'].toString();

    if (optionKey === correctAnswerKey) {
      this.processCorrectAnswer();
    } else {
      this.processIncorrectAnswer();
    }

    setTimeout(() => this.nextQuestion(), 2000);
  }

  private processCorrectAnswer() {
    this.feedbackMessage = '¡Correcto!';
    this.feedbackClass = 'feedback-overlay show correcto';
    this.answeredCorrectly++;
    this.answeredQuestions.add(this.currentQuestion.id); // Agregar pregunta a la lista de contestadas correctamente

    if (this.answeredCorrectly >= this.objetivo) {
      this.completeTrivia();
    }
  }

  private processIncorrectAnswer() {
    this.feedbackMessage = 'Incorrecto';
    this.feedbackClass = 'feedback-overlay show incorrecto';
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

  private startTimer() {
    this.timeLeft = 10;
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.processTimeOut();
      }
    }, 1000);
  }

  private processTimeOut() {
    this.clearTimer();
    this.feedbackMessage = 'Tiempo agotado';
    this.feedbackClass = 'feedback-overlay show incorrecto';
    this.isAnswered = true;
    setTimeout(() => this.nextQuestion(), 2000);
  }

  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private resetFeedback() {
    this.isAnswered = false;
    this.feedbackMessage = '';
    this.feedbackClass = '';
    this.selectedAnswer = '';
  }
}
