import { FigureStill } from '../figure/Figure';

/** 카드 썸네일: 동작의 핵심 자세를 사람 형태로 표시 */
export function ExerciseArt({ art, className = '', halo }: { art?: string; className?: string; halo?: string }) {
  return <FigureStill art={art} className={className} halo={halo} />;
}
