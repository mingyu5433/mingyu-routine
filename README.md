# 민규 루틴 (MINGYU ROUTINE)

개인 전용 홈트레이닝 PWA (React + TypeScript + Vite + Tailwind CSS + Lucide)

## 로컬 실행
```bash
npm install
npm run dev
```

## GitHub Pages 배포
1. GitHub에 새 저장소(권장 이름: `mingyu-routine`)를 만들고 이 폴더 전체를 `main` 브랜치에 올립니다.
2. 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 바꿉니다.
3. `main`에 푸시하면 `.github/workflows/deploy.yml`이 자동으로 빌드·배포합니다.
   (저장소 이름이 경로로 자동 반영됩니다: `https://<아이디>.github.io/<저장소명>/`)
4. 아이폰 Safari로 주소를 열고 공유 → 홈 화면에 추가.

## 구조
- `src/data/exercises.ts` 운동별 상세 데이터(방법·주의사항·호흡·팁)
- `src/data/schedule.ts` 기본 주간 일정
- `src/screens/` 홈(Today) · 운동(Workout: 주간 일정/운동 목록) · 기록(Records: 달력/통계·성장) · 설정
- `src/lib/store.tsx` 상태·localStorage 저장(`mingyu-routine:v1`)
- `src/lib/stats.ts` 완료율·연속 기록·주간 지속률·추이 계산
- `src/components/RestTimer.tsx` 종료 예정 시각 기반 휴식 타이머
- `scripts/make-icons.mjs` 앱 아이콘 PNG 생성(빌드 전 자동 실행, 의존성 없음)
- `src/components/ExerciseArt.tsx` 동작 픽토그램(사진으로 교체 가능)
