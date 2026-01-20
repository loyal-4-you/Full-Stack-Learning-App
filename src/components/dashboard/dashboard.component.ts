
import { Component, ChangeDetectionStrategy, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Skill } from '../../models/skill.model';
import { SKILLS_DATA } from './skills.data';
import { LearningPath } from '../../models/learning-path.model';
import { LEARNING_PATHS_DATA } from '../../data/learning-paths.data';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class DashboardComponent {
  skillSelected = output<Skill>();
  pathSelected = output<LearningPath>();
  
  skills: Skill[] = SKILLS_DATA;
  learningPaths: LearningPath[] = LEARNING_PATHS_DATA;

  activeTab = signal<'paths' | 'skills'>('paths');

  selectSkill(skill: Skill): void {
    this.skillSelected.emit(skill);
  }

  selectPath(path: LearningPath): void {
    this.pathSelected.emit(path);
  }
}
