# Gallery 서비스 — 웹개발 학습 가이드

> 2026-03-17 작성.
> SyOps의 React + FastAPI 스택을 **직접 익히기 위한** 단계별 학습 가이드.
> 기술 설계는 `GALLERY_SERVICE.md` 참조.

## 이 문서의 목적

SyOps는 AI가 만들어줬다. 코드가 돌아가긴 하는데, **왜 이렇게 짰는지** 모르면 수정도 확장도 못 한다.
Gallery 서비스를 **직접 손으로** 만들면서 아래를 익힌다:

- React 컴포넌트가 뭔지, 어떻게 조립하는지
- FastAPI로 API를 어떻게 만드는지
- 프론트엔드가 백엔드에 어떻게 데이터를 요청하는지
- Tailwind CSS로 반응형 레이아웃을 어떻게 잡는지

---

## 기술 스택 (왜 이걸 쓰는가)

| 기술 | 역할 | 왜 이걸? |
|------|------|----------|
| **React** (TypeScript) | 화면 그리기 | SyOps가 이미 이걸로 되어 있음. 배워두면 SyOps 전체를 건드릴 수 있음 |
| **FastAPI** (Python) | 서버 API | SyOps 백엔드가 이거. Python이라 진입장벽 낮음 |
| **Tailwind CSS** | 스타일링 | CSS를 클래스 이름으로 적용. SyOps에서 이미 사용 중 |
| **Vite** | 빌드 도구 | React 앱을 개발/빌드. SyOps 프론트엔드의 빌드 시스템 |

> **대안을 쓰지 않는 이유**: Next.js, Go, HTMX 등 다른 선택지도 있지만,
> SyOps와 스택을 통일하면 **하나만 배워서 둘 다 건드릴 수 있다**.
> 학습 목적이니까 효율이 최우선.

---

## 학습 순서 — 전체 그림

```
Step 0  환경 이해          → SyOps 코드를 읽고 구조를 파악한다
Step 1  백엔드 API 하나    → FastAPI로 파일 목록 API를 만든다
Step 2  프론트 페이지 하나  → React로 빈 페이지를 만들어 라우팅에 등록한다
Step 3  연결               → 프론트에서 백엔드 API를 호출해서 데이터를 화면에 뿌린다
Step 4  그리드 레이아웃     → Tailwind로 사진을 격자로 배치한다
Step 5  영상 재생           → <video> 태그로 MP4를 재생한다
Step 6  모바일 대응         → 화면 크기별로 레이아웃을 바꾼다
Step 7  배포               → VPS에 올려서 실제로 동작시킨다
```

각 Step에서 **개념 설명 → SyOps 코드 예시 → 직접 작성** 순서로 진행한다.

---

## Step 0 — 환경 이해 (코드 읽기)

코드를 쓰기 전에, SyOps가 어떻게 돌아가는지 먼저 읽는다.

### 프론트엔드 구조

```
frontend/src/
├── App.tsx          ← 모든 페이지의 "지도". URL별로 어떤 페이지를 보여줄지 결정
├── main.tsx         ← 앱의 시작점. App.tsx를 브라우저에 꽂는 역할
├── pages/           ← 페이지 단위 컴포넌트 (Landing, Services, ...)
├── components/      ← 재사용 가능한 조각 (Navbar, Footer, ServiceCard, ...)
├── contexts/        ← 여러 컴포넌트가 공유하는 상태 (로그인 정보 등)
├── data/            ← 정적 데이터 (서비스 목록, 프로젝트 목록)
├── hooks/           ← 커스텀 훅 (반복되는 로직을 함수로 뽑은 것)
└── types.ts         ← TypeScript 타입 정의
```

### 핵심 개념: 컴포넌트

React에서 화면의 **모든 것**은 컴포넌트다. 컴포넌트는 그냥 **함수**인데, HTML(JSX)을 반환한다.

SyOps 예시 — `Landing.tsx`에서 이 패턴을 확인:

```typescript
// 함수 하나가 페이지 하나다
export default function Landing() {
  return (
    <div>
      {/* 여기에 HTML처럼 생긴 코드(JSX)를 적는다 */}
      <h1>SyOps</h1>
    </div>
  );
}
```

### 핵심 개념: 라우팅

`App.tsx`를 보면 URL과 페이지를 매핑한다:

```typescript
<Routes>
  <Route path="/" element={<Landing />} />        // syworkspace.cloud/ → Landing 페이지
  <Route path="/services" element={<Services />} /> // syworkspace.cloud/services → Services 페이지
</Routes>
```

`/gallery` 경로를 추가하면 Gallery 페이지가 만들어지는 것.

### 백엔드 구조

```
backend/
├── main.py          ← FastAPI 앱의 시작점. 라우터를 등록
├── routers/         ← API 엔드포인트 정의 (URL → 함수 매핑)
├── services/        ← 비즈니스 로직 (실제 일을 하는 코드)
├── core/            ← 공통 설정 (DB, 인증, 환경변수)
└── models/          ← DB 테이블 정의
```

### 핵심 개념: API 엔드포인트

`health.py`를 보면 패턴이 보인다:

```python
router = APIRouter(prefix="/api/health")  # 이 라우터의 모든 URL은 /api/health로 시작

@router.get("")              # GET /api/health → health_all 함수 실행
async def health_all():
    return await check_all() # 결과를 JSON으로 반환
```

Gallery도 같은 패턴으로 만들면 된다: `GET /api/gallery` → 파일 목록 반환.

### 읽어볼 파일 (순서대로)

1. `frontend/src/App.tsx` — 전체 라우팅 구조
2. `frontend/src/pages/Landing.tsx` — 가장 단순한 페이지 예시
3. `frontend/src/components/ServiceCard.tsx` — 컴포넌트 분리 예시
4. `backend/main.py` — 백엔드 시작점
5. `backend/routers/health.py` — 가장 단순한 API 예시

---

## Step 1 — 백엔드: 파일 목록 API 만들기

### 배울 개념

- FastAPI 라우터 만들기
- 파일시스템에서 파일 목록 읽기
- JSON 응답 반환

### 만들 것

`GET /api/gallery` → 갤러리 폴더의 파일 목록을 JSON으로 반환

### 알아야 할 것

```python
# FastAPI 라우터의 기본 뼈대
from fastapi import APIRouter
from pathlib import Path

router = APIRouter(prefix="/api/gallery", tags=["gallery"])

MEDIA_DIR = Path("/opt/data/gallery")  # 사진/영상이 저장된 폴더

@router.get("")
async def list_files():
    """폴더 안의 파일 이름들을 반환한다"""
    files = []
    for f in MEDIA_DIR.iterdir():
        if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".mp4"):
            files.append({
                "name": f.name,
                "type": "image" if f.suffix.lower() in (".jpg", ".jpeg", ".png") else "video",
                "size": f.stat().st_size,
            })
    return files
```

### SyOps에서 비교할 코드

- `backend/routers/health.py` — 같은 패턴 (라우터 생성 → 엔드포인트 함수)
- `backend/main.py` — 여기에 `app.include_router(gallery.router)` 한 줄 추가

### 확인 방법

브라우저에서 `http://localhost:8000/api/gallery` 접속 → JSON 나오면 성공.

---

## Step 2 — 프론트: 빈 페이지 만들고 라우팅 등록

### 배울 개념

- React 컴포넌트 만들기
- react-router-dom으로 페이지 등록

### 만들 것

`/gallery` URL로 접속하면 "Gallery" 제목이 뜨는 빈 페이지

### 알아야 할 것

```typescript
// frontend/src/pages/Gallery.tsx
export default function Gallery() {
  return (
    <div className="min-h-dvh bg-surface-bg p-8">
      <h1 className="text-2xl font-bold text-white">Gallery</h1>
      <p className="text-slate-400">여기에 사진이 들어갈 예정</p>
    </div>
  );
}
```

그리고 `App.tsx`에 라우트 한 줄 추가:

```typescript
import Gallery from "./pages/Gallery";

// <Routes> 안에 추가:
<Route path="/gallery" element={<Gallery />} />
```

### SyOps에서 비교할 코드

- `frontend/src/pages/Landing.tsx` — 페이지 컴포넌트의 구조
- `frontend/src/App.tsx` — 라우트 등록 방법

### 확인 방법

`http://localhost:5173/gallery` 접속 → "Gallery" 제목 보이면 성공.

---

## Step 3 — 프론트 ↔ 백엔드 연결

### 배울 개념

- `fetch()` — 브라우저에서 서버에 데이터를 요청하는 함수
- `useState` — React에서 변하는 데이터를 저장하는 훅
- `useEffect` — 컴포넌트가 화면에 나타날 때 실행할 코드를 지정하는 훅

### 왜 이게 필요한가

Step 1에서 만든 API는 서버에 있고, Step 2에서 만든 페이지는 브라우저에 있다.
브라우저가 서버에 "파일 목록 줘"라고 **요청**해야 한다. 이걸 하는 게 `fetch()`.

### 알아야 할 것

```typescript
import { useState, useEffect } from "react";

// 타입 정의: 서버가 보내줄 데이터의 모양
interface MediaFile {
  name: string;
  type: "image" | "video";
  size: number;
}

export default function Gallery() {
  // useState: "files"라는 변수를 만들고, 초기값은 빈 배열
  const [files, setFiles] = useState<MediaFile[]>([]);

  // useEffect: 페이지가 처음 열릴 때 한 번 실행
  useEffect(() => {
    fetch("/api/gallery")                // 서버에 요청
      .then((res) => res.json())         // 응답을 JSON으로 변환
      .then((data) => setFiles(data));   // 변환된 데이터를 files에 저장
  }, []);  // [] = 처음 한 번만 실행

  return (
    <div className="min-h-dvh bg-surface-bg p-8">
      <h1 className="text-2xl font-bold text-white">Gallery</h1>
      <p className="text-slate-400">{files.length}개 파일 발견</p>

      {/* files 배열을 순회하면서 각 파일 이름을 출력 */}
      <ul>
        {files.map((f) => (
          <li key={f.name} className="text-white">{f.name} ({f.type})</li>
        ))}
      </ul>
    </div>
  );
}
```

### 흐름 정리

```
1. 브라우저가 /gallery 페이지를 연다
2. Gallery 컴포넌트가 화면에 나타난다
3. useEffect가 실행 → fetch("/api/gallery") → 서버에 요청
4. 서버가 파일 목록 JSON을 돌려준다
5. setFiles(data) → files 변수가 업데이트된다
6. React가 화면을 다시 그린다 → 파일 목록이 보인다
```

### SyOps에서 비교할 코드

- `frontend/src/hooks/useServiceHealth.ts` — fetch + useState + useEffect 패턴

### 확인 방법

페이지에서 파일 이름 목록이 텍스트로 나오면 성공.

---

## Step 4 — 그리드 레이아웃 (사진 격자 배치)

### 배울 개념

- CSS Grid — 요소를 격자로 배치하는 레이아웃
- Tailwind의 그리드 클래스

### 핵심 원리

```
grid grid-cols-3 gap-4
│     │           │
│     │           └─ 요소 사이 간격 4 (1rem)
│     └─ 3열 격자
└─ CSS Grid 활성화
```

### 알아야 할 것

```typescript
{/* Step 3의 <ul> 대신 이걸 넣는다 */}
<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
  {files.filter((f) => f.type === "image").map((f) => (
    <div key={f.name} className="overflow-hidden rounded-xl">
      <img
        src={`/api/gallery/files/${f.name}`}
        alt={f.name}
        loading="lazy"
        className="aspect-square w-full object-cover"
      />
    </div>
  ))}
</div>
```

### Tailwind 클래스 해석

| 클래스 | 의미 |
|--------|------|
| `grid` | CSS Grid 활성화 |
| `grid-cols-2` | 기본 2열 (모바일) |
| `md:grid-cols-3` | 768px 이상이면 3열 |
| `lg:grid-cols-4` | 1024px 이상이면 4열 |
| `gap-4` | 격자 사이 간격 |
| `aspect-square` | 정사각형 비율 유지 |
| `object-cover` | 이미지가 영역을 꽉 채우되 비율 유지 (넘치는 부분 잘림) |
| `loading="lazy"` | 화면 밖 이미지는 스크롤할 때 로드 |

### 백엔드: 파일 서빙 API 추가

Step 1의 라우터에 추가:

```python
from fastapi.responses import FileResponse

@router.get("/files/{filename}")
async def get_file(filename: str):
    """파일 하나를 직접 내려준다"""
    path = MEDIA_DIR / filename
    if not path.exists() or not path.is_file():
        raise HTTPException(404, "File not found")
    return FileResponse(path)
```

### 확인 방법

사진이 격자로 배치되어 보이면 성공. 브라우저 창 크기를 줄이면 열 수가 줄어야 한다.

---

## Step 5 — 영상 재생

### 배울 개념

- HTML `<video>` 태그
- 모바일 영상 재생 제한사항

### 알아야 할 것

```typescript
{files.filter((f) => f.type === "video").map((f) => (
  <div key={f.name} className="overflow-hidden rounded-xl">
    <video
      src={`/api/gallery/files/${f.name}`}
      controls          // 재생/정지/볼륨 컨트롤 표시
      playsInline        // iOS에서 전체화면 강제 방지
      preload="metadata" // 영상 전체를 미리 다운로드하지 않음
      className="aspect-video w-full"
    />
  </div>
))}
```

### 모바일 주의사항

| 속성 | 왜 필요한가 |
|------|-------------|
| `playsInline` | iOS Safari는 이게 없으면 영상을 전체화면으로 강제 |
| `preload="metadata"` | 모바일 데이터 절약. 길이/해상도 정보만 먼저 가져옴 |
| `controls` | 자체 플레이어 UI 안 만들어도 브라우저 기본 컨트롤 사용 |

### 큰 영상 스트리밍 (나중에)

파일이 크면 Range 요청을 지원해야 영상 탐색(seek)이 작동한다.
지금은 `FileResponse`만으로 시작하고, 영상 탐색이 안 되는 문제가 생기면 그때 StreamingResponse로 교체.

---

## Step 6 — 모바일 대응

### 배울 개념

- 반응형 디자인 (Responsive Design)
- Tailwind 브레이크포인트
- 터치 인터랙션

### Tailwind 브레이크포인트 체계

```
기본 (접두사 없음) = 모바일 (0px~)
sm:              = 640px 이상
md:              = 768px 이상
lg:              = 1024px 이상
xl:              = 1280px 이상
```

**모바일 퍼스트**: 접두사 없는 게 모바일 기본이고, `md:`를 붙이면 태블릿/데스크탑 전용.

### 점검 체크리스트

- [ ] 사진 격자가 모바일에서 2열, PC에서 4열로 바뀌는가
- [ ] 영상이 화면 폭에 맞게 축소되는가
- [ ] 버튼/터치 영역이 44x44px 이상인가
- [ ] 가로 스크롤이 생기지 않는가

---

## Step 7 — VPS 배포

SyOps에 이미 통합되어 있으니, SyOps 배포 파이프라인(GitHub Actions CI/CD)을 그대로 탄다.

1. 프론트: `npm run build` → 정적 파일 생성 → nginx가 서빙
2. 백엔드: `gallery.py` 라우터가 SyOps API 서버에 포함되어 자동 배포
3. VPS에 `/opt/data/gallery/` 디렉토리 생성 후 파일 업로드

---

## 이후 확장 (급하지 않음)

이건 기본이 다 되고 나서 하나씩 추가하면 된다:

| 기능 | 배울 개념 | 시기 |
|------|-----------|------|
| 업로드 | `<input type="file">`, FormData, POST API | 기본 완성 후 |
| 썸네일 | Pillow, ffmpeg, 이미지 리사이즈 | 파일 많아질 때 |
| 라이트박스 | 모달, 상태 관리, 키보드 이벤트 | UX 개선 시 |
| 스와이프 | 터치 이벤트, swiper 라이브러리 | 모바일 UX 개선 시 |
| 폴더/앨범 | 중첩 라우팅, 디렉토리 탐색 | 파일 정리 필요 시 |
| Range 스트리밍 | HTTP Range, StreamingResponse | 큰 영상 문제 시 |

---

## 학습 팁

1. **한 Step씩만 하기**: Step 3을 안 끝냈으면 Step 4를 시작하지 않는다
2. **SyOps 코드 먼저 읽기**: 각 Step에서 "비교할 코드"를 먼저 읽고 패턴을 파악한다
3. **동작부터 확인**: 완벽한 코드 X → 일단 돌아가는 코드 → 다듬기
4. **모르는 건 물어보기**: 각 Step에서 막히면 AI한테 해당 코드를 보여주며 질문
5. **직접 타이핑하기**: 복붙 금지. 타이핑하면서 클래스 이름, 함수 구조가 손에 익는다
