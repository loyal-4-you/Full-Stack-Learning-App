
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Skill } from './models/skill.model';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SkillDetailComponent } from './components/skill-detail/skill-detail.component';
import { LearningPath } from './models/learning-path.model';
import { LearningPathComponent } from './components/learning-path/learning-path.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DashboardComponent,
    SkillDetailComponent,
    LearningPathComponent,
  ],
})
export class AppComponent {
  title = 'Full-Stack Learning Hub';
  selectedSkill = signal<Skill | null>(null);
  selectedLearningPath = signal<LearningPath | null>(null);

  onPathSelected(path: LearningPath): void {
    this.selectedLearningPath.set(path);
    this.selectedSkill.set(null);
  }

  onSkillSelectedFromDashboard(skill: Skill): void {
    this.selectedLearningPath.set(null);
    this.selectedSkill.set(skill);
  }

  onSkillSelectedFromPath(skill: Skill): void {
    this.selectedSkill.set(skill);
  }

  onGoBack(): void {
    if (this.selectedSkill()) {
      this.selectedSkill.set(null);
    } else if (this.selectedLearningPath()) {
      this.selectedLearningPath.set(null);
    }
  }

  navigateHome(): void {
    this.selectedSkill.set(null);
    this.selectedLearningPath.set(null);
  }

  scrollToSection(sectionId: string): void {
    // First navigate home if not already there
    if (this.selectedSkill() || this.selectedLearningPath()) {
      this.navigateHome();
      // Wait for DOM to update before scrolling
      setTimeout(() => this.performScroll(sectionId), 100);
    } else {
      this.performScroll(sectionId);
    }
  }

  private performScroll(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 64; // Height of fixed nav (h-16 = 64px)
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight - 20; // Extra 20px padding

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}
