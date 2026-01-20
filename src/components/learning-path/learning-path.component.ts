
import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearningPath } from '../../models/learning-path.model';
import { Skill } from '../../models/skill.model';
import { SKILLS_DATA } from '../dashboard/skills.data';

@Component({
  selector: 'app-learning-path',
  templateUrl: './learning-path.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class LearningPathComponent {
  path = input.required<LearningPath>();
  back = output<void>();
  skillSelected = output<Skill>();

  skills = computed<Skill[]>(() => {
    const pathSkills = this.path().skillNames;
    // Look up full skill objects and sort them according to the path's defined order
    return SKILLS_DATA
      .filter(skill => pathSkills.includes(skill.name))
      .sort((a, b) => pathSkills.indexOf(a.name) - pathSkills.indexOf(b.name));
  });

  onSelectSkill(skill: Skill): void {
    this.skillSelected.emit(skill);
  }
}
