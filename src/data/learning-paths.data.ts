
import { LearningPath } from '../models/learning-path.model';

export const LEARNING_PATHS_DATA: LearningPath[] = [
  {
    name: 'Frontend Developer Roadmap',
    description: 'Master the full spectrum of modern web frontends, from core languages and version control to advanced frameworks, testing, and design.',
    skillNames: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'Git', 'Tailwind CSS', 'Angular', 'React', 'Vue.js', 'Jest', 'Vite', 'Figma'],
    color: 'from-teal-500 to-sky-500',
  },
  {
    name: 'Backend Developer Roadmap (Node.js)',
    description: 'Build robust and scalable server-side applications using the JavaScript runtime Node.js.',
    skillNames: ['Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'Docker'],
    color: 'from-sky-500 to-indigo-500',
  },
  {
    name: 'Full-Stack Developer Path',
    description: 'Become a versatile developer capable of building entire web applications from server to client.',
    skillNames: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Git'],
    color: 'from-purple-500 to-pink-500',
  }
];
