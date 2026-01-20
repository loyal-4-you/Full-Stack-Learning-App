
export interface Skill {
  name: string;
  logo: string; // SVG path data
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'Tooling';
  color: string; // Tailwind color class e.g., 'text-green-400'
}
