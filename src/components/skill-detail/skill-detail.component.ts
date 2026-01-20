
import { Component, ChangeDetectionStrategy, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Skill } from '../../models/skill.model';
import { GeminiService, Quiz, TopicDetails, ResourceCategory } from '../../services/gemini.service';
import { MarkdownModule } from './markdown.component';
import { CodeEditorComponent } from '../code-editor/code-editor.component';

type GenerationType = 'explanation' | 'code' | 'quiz' | 'topics' | 'topicDetail' | 'practice' | 'feedback' | null;
type SkillDetailTab = 'overview' | 'practice' | 'resources';

@Component({
  selector: 'app-skill-detail',
  templateUrl: './skill-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MarkdownModule, CodeEditorComponent],
})
export class SkillDetailComponent {
  skill = input.required<Skill>();
  back = output<void>();

  private geminiService = inject(GeminiService);

  activeTab = signal<SkillDetailTab>('overview');
  explanation = signal<string>('');
  codeExample = signal<string>('');
  quiz = signal<Quiz | null>(null);
  showAnswer = signal<boolean>(false);
  selectedOption = signal<string | null>(null);
  practiceProblem = signal<string>('');
  userCode = signal<string>('');
  codeFeedback = signal<string>('');

  resourceTopics = signal<ResourceCategory[]>([]);
  selectedTopic = signal<string | null>(null);
  topicDetails = signal<TopicDetails | null>(null);
  topicQuizShowAnswer = signal<boolean>(false);
  topicQuizSelectedOption = signal<string | null>(null);

  codeValidation = signal<string>('');

  loadingType = signal<GenerationType>(null);
  error = signal<string>('');

  async getExplanation(): Promise<void> {
    this.loadingType.set('explanation');
    this.error.set('');
    this.explanation.set('');
    const result = await this.geminiService.generateExplanation(this.skill().name);
    this.explanation.set(result);
    this.loadingType.set(null);
  }

  async getCodeExample(): Promise<void> {
    this.loadingType.set('code');
    this.error.set('');
    this.codeExample.set('');
    const result = await this.geminiService.generateCodeExample(this.skill().name);
    this.codeExample.set(result);
    this.loadingType.set(null);
  }

  async getQuiz(): Promise<void> {
    this.loadingType.set('quiz');
    this.error.set('');
    this.quiz.set(null);
    this.showAnswer.set(false);
    this.selectedOption.set(null);
    const result = await this.geminiService.generateQuiz(this.skill().name);
    if (result) {
      this.quiz.set(result);
    } else {
      this.error.set(`Could not generate a quiz for ${this.skill().name}.`);
    }
    this.loadingType.set(null);
  }

  async getResourceTopics(): Promise<void> {
    this.loadingType.set('topics');
    this.error.set('');
    this.resourceTopics.set([]);
    const result = await this.geminiService.generateResourceTopics(this.skill().name);
    this.resourceTopics.set(result);
    this.loadingType.set(null);
  }

  async selectTopic(topic: string): Promise<void> {
    if (this.selectedTopic() === topic) {
      this.selectedTopic.set(null);
      this.topicDetails.set(null);
      return;
    }

    this.selectedTopic.set(topic);
    this.topicDetails.set(null);
    this.topicQuizShowAnswer.set(false);
    this.topicQuizSelectedOption.set(null);
    this.loadingType.set('topicDetail');

    const result = await this.geminiService.generateTopicDetail(this.skill().name, topic);

    // Only update if the topic is still the selected one
    if (this.selectedTopic() === topic) {
      this.topicDetails.set(result);
    }
    this.loadingType.set(null);
  }

  async getPracticeProblem(): Promise<void> {
    this.loadingType.set('practice');
    this.error.set('');
    this.practiceProblem.set('');
    this.codeFeedback.set('');
    const result = await this.geminiService.generatePracticeProblem(this.skill().name);
    this.practiceProblem.set(result);
    this.loadingType.set(null);
  }

  async getCodeFeedback(): Promise<void> {
    if (!this.userCode()) return;
    this.loadingType.set('feedback');
    this.error.set('');
    this.codeFeedback.set('');
    const result = await this.geminiService.generateCodeFeedback(this.skill().name, this.practiceProblem(), this.userCode());
    this.codeFeedback.set(result);
    this.loadingType.set(null);
  }

  async validateCode(): Promise<void> {
    if (!this.userCode()) return;
    this.loadingType.set('feedback');
    this.error.set('');
    this.codeValidation.set('');

    // Create a prompt specifically for quick validation
    const validationPrompt = `As a code reviewer, quickly validate this ${this.skill().name} code for syntax errors, common mistakes, and best practices. Provide a brief, actionable response focusing on:\n1. Syntax errors (if any)\n2. Logic issues (if any)\n3. A quick "✅ Looks good!" if no issues\n\nKeep it concise and helpful.\n\nCode:\n\`\`\`\n${this.userCode()}\n\`\`\``;

    try {
      const result = await this.geminiService.generateQuickValidation(validationPrompt);
      this.codeValidation.set(result);
    } catch (error) {
      this.codeValidation.set('Unable to validate code. Please try again.');
    }

    this.loadingType.set(null);
  }

  selectOption(option: string): void {
    if (this.showAnswer()) return;
    this.selectedOption.set(option);
  }

  getOptionClass(option: string): string {
    if (!this.showAnswer()) {
      return this.selectedOption() === option
        ? 'bg-sky-600/70 border-sky-500 ring-2 ring-offset-slate-800 ring-sky-500'
        : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-teal-500';
    }

    const isCorrect = option === this.quiz()?.answer;
    const isSelected = option === this.selectedOption();

    if (isCorrect) {
      return 'bg-green-500/30 border-green-500 text-white';
    }
    if (isSelected && !isCorrect) {
      return 'bg-red-500/30 border-red-500 text-white';
    }
    return 'bg-slate-800/60 border-slate-700 opacity-60';
  }

  selectTopicQuizOption(option: string): void {
    if (this.topicQuizShowAnswer()) return;
    this.topicQuizSelectedOption.set(option);
  }

  getTopicQuizOptionClass(option: string): string {
    if (!this.topicQuizShowAnswer()) {
      return this.topicQuizSelectedOption() === option
        ? 'bg-sky-600/70 border-sky-500 ring-1 ring-offset-slate-800/60 ring-sky-500'
        : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 hover:border-teal-500';
    }

    const quiz = this.topicDetails()?.quiz;
    if (!quiz) return 'bg-slate-700 border-slate-600';

    const isCorrect = option === quiz.answer;
    const isSelected = option === this.topicQuizSelectedOption();

    if (isCorrect) {
      return 'bg-green-500/30 border-green-500 text-white';
    }
    if (isSelected && !isCorrect) {
      return 'bg-red-500/30 border-red-500 text-white';
    }
    return 'bg-slate-700/50 border-slate-600 opacity-60';
  }
}
