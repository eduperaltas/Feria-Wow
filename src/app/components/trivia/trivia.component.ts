import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { TriviaService } from "../../services/trivia.service";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-trivia",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./trivia.component.html",
  styleUrls: ["./trivia.component.css"],
})
export class TriviaComponent implements OnInit, OnDestroy {
  trivia: string | null = "";
  questions: any[] = [];
  answeredQuestions: Set<string> = new Set(); // IDs de preguntas ya contestadas correctamente
  currentQuestionIndex = 0;
  currentQuestion: any;
  feedbackMessage = "";
  feedbackClass = "";
  isAnswered = false;
  sello: string | null = "";
  objetivo = 0;
  answeredCorrectly = 0;
  userId = "";
  timeLeft = 10;
  timerInterval: any;
  selectedAnswer: string | null = null;
  showFeedback = false;
  name: string | null = "";

  constructor(
    private triviaService: TriviaService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.trivia = this.route.snapshot.paramMap.get("tema");
    this.sello = this.route.snapshot.paramMap.get("sello");
    this.userId = this.authService.getUsername() || "";
    this.name = this.authService.getName();
  
    // Recuperar preguntas contestadas correctamente desde el caché o localStorage
    const cachedAnsweredQuestions = localStorage.getItem(
      `answeredQuestions_${this.trivia}`
    );
    if (cachedAnsweredQuestions) {
      this.answeredQuestions = new Set(JSON.parse(cachedAnsweredQuestions));
    }
  
    if (this.sello) {
      const completed = await this.triviaService.hasSello(
        this.userId,
        this.sello
      );
      if (completed) {
        this.router.navigate(["/pasaporte"]);
        return;
      }
      await this.loadTriviaData();
    }
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  handleOptionClick(optionKey: string): void {
    if (this.isAnswered || this.showFeedback) return;
  
    this.selectedAnswer = optionKey;
    this.isAnswered = true;
    this.clearTimer();
  
    const correctAnswerKey = this.currentQuestion["respuesta"].toString();
  
    setTimeout(() => {
      if (optionKey === correctAnswerKey) {
        this.feedbackMessage = "¡Correcto!";
        this.feedbackClass = "feedback-box show";
  
        // Guardar la pregunta correctamente contestada
        this.answeredQuestions.add(this.currentQuestion.id);
  
        // Actualizar localStorage con las preguntas contestadas correctamente
        localStorage.setItem(
          `answeredQuestions_${this.trivia}`,
          JSON.stringify([...this.answeredQuestions])
        );
  
        this.answeredCorrectly++;
        if (this.answeredCorrectly >= this.objetivo) {
          console.log("¡Objetivo cumplido! Completando trivia...");
          this.completeTrivia();
          return;
        }
      } else {
        this.feedbackMessage = "¡Sigue intentando!";
        this.feedbackClass = "feedback-box show";
      }
  
      setTimeout(() => {
        this.feedbackClass = "feedback-box";
        this.resetForNextQuestion();
      }, 2000);
    }, 500);
  }

  resetForNextQuestion(): void {
    this.showFeedback = false;
    this.feedbackMessage = "";
    this.feedbackClass = "";
    this.selectedAnswer = null;
    this.isAnswered = false;

    // Si ya no hay preguntas restantes, reiniciar las preguntas no contestadas
    if (this.currentQuestionIndex >= this.questions.length - 1) {
      console.log(
        "No hay más preguntas. Reiniciando preguntas no contestadas."
      );
      this.resetUnansweredQuestions();
      return;
    }

    // Avanzar a la siguiente pregunta
    this.currentQuestionIndex++;
    this.currentQuestion = this.questions[this.currentQuestionIndex];
    this.startTimer();
  }

  public nextQuestion(): void {
    this.resetFeedback();

    if (this.currentQuestionIndex < this.questions.length - 1) {
      // Avanzar a la siguiente pregunta
      this.currentQuestionIndex++;
      this.currentQuestion = this.questions[this.currentQuestionIndex];
      this.startTimer();
    } else {
      // Cuando se acaban las preguntas, reiniciar las no contestadas
      this.resetUnansweredQuestions();
    }
  }

  private resetUnansweredQuestions(): void {
    // Filtrar solo las preguntas que no se contestaron correctamente
    const unansweredQuestions = this.questions.filter(
      (question) => !this.answeredQuestions.has(question.id)
    );

    if (unansweredQuestions.length === 0) {
      console.log(
        "Todas las preguntas han sido contestadas. Reiniciando todas las preguntas."
      );
      this.questions = this.shuffleArray(this.questions); // Reutiliza todas las preguntas disponibles
    } else {
      console.log("Reiniciando preguntas no contestadas.");
      this.questions = this.shuffleArray(unansweredQuestions);
    }

    // Reiniciar al comienzo de las preguntas
    this.currentQuestionIndex = 0;
    this.currentQuestion = this.questions[this.currentQuestionIndex];
    this.startTimer();
  }

  startTimer(): void {
    const circle = document.querySelector(
      ".progress-ring__circle"
    ) as SVGCircleElement;
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
    this.feedbackMessage = "Tiempo agotado";
    this.feedbackClass = "feedback-overlay show incorrecto";
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
    const triviaData = await this.triviaService.getTriviaData(this.trivia!);
    if (triviaData) {
      this.objetivo = Number(triviaData.objetivo) || 0;
      await this.loadQuestions();
    }
  }

  private async loadQuestions() {
    this.questions = this.shuffleArray(
      (await this.triviaService.getQuestionsByTema(this.trivia!)).filter(
        (question) => !this.answeredQuestions.has(question.id)
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
    return Object.keys(question)
      .filter((key) => !isNaN(Number(key)))
      .sort();
  }

  private async completeTrivia() {
    if (!this.sello) {
      console.error(
        "No se puede completar la trivia: Sello es null o indefinido."
      );
      return;
    }

    await this.triviaService.markTriviaAsCompleted(this.userId, this.sello);
    this.router.navigate(["/felicitacion"], {
      queryParams: { sello: this.sello },
    });
  }

  private resetFeedback() {
    this.isAnswered = false;
    this.feedbackMessage = "";
    this.feedbackClass = "";
    this.selectedAnswer = "";
  }
}
