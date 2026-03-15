# Google Drive 연동 — VPS 파일 전송

> 2026-03-13 작성. VPS 서비스 결과물을 Google Drive로 전송하는 기능.

## 개요

- **목적**: QuickDrop, StudyHub 등 VPS 서비스의 파일을 Google Drive로 내보내기
- **방식**: Google Drive API + 서비스 계정 (Python)
- **트리거**: 웹 UI 버튼 + 결과물 생성 시 자동 전송

---

## 대상 서비스 & 데이터

| 서비스 | 전송 대상 | 트리거 | Google Drive 경로 |
|--------|-----------|--------|-------------------|
| QuickDrop | `/opt/data/quickdrop/vault/` 영구 보관 파일 | 웹 UI "Drive로 내보내기" 버튼 | `VPS/QuickDrop/` |
| StudyHub | `/opt/data/study/output/` 크롤링 결과 | 크롤링 완료 시 자동 | `VPS/StudyHub/크롤링/` |
| StudyHub | `/opt/data/study/lesson-assist/output/` 수업 요약 | 변환 완료 시 자동 | `VPS/StudyHub/수업자료/` |

---

## 아키텍처

```
서비스 (QuickDrop / StudyHub)
    │
    │  upload_to_drive(file_path, drive_folder)
    ▼
┌──────────────────────┐
│  gdrive 공용 모듈     │  Google Drive API 래핑
│  (Python 패키지)      │  인증, 업로드, 폴더 관리
└──────────┬───────────┘
           │ Google Drive API v3
           ▼
┌──────────────────────┐
│  Google Drive        │  서비스 계정 전용 공유 폴더
│  VPS/                │
│  ├── QuickDrop/      │
│  └── StudyHub/       │
└──────────────────────┘
```

### 공용 모듈 위치 옵션

| 옵션 | 설명 | 적합 상황 |
|------|------|-----------|
| A. 각 프로젝트에 복사 | `quickdrop/utils/gdrive.py`, `school_sync/utils/gdrive.py` | 빠르게 시작, 프로젝트 독립성 |
| B. 공용 패키지 | `/opt/apps/shared/gdrive/` → pip install | 코드 중복 없음, 유지보수 편리 |
| C. SyOps API 경유 | SyOps에 `/api/gdrive/upload` → 각 서비스가 호출 | 인증 키 한 곳에서 관리 |

**권장: A** — 프로젝트가 2개뿐이고 모듈이 작으므로 각자 복사해서 사용. 나중에 서비스가 늘어나면 B나 C로 전환.

---

## GCP 사전 준비

### 1. Google Cloud 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 (예: `syworkspace-vps`)
3. **Google Drive API** 활성화: API 및 서비스 → 라이브러리 → "Google Drive API" 검색 → 사용

### 2. 서비스 계정 생성

1. API 및 서비스 → 사용자 인증 정보 → 사용자 인증 정보 만들기 → **서비스 계정**
2. 이름: `vps-drive-uploader`
3. 역할: 없음 (Drive API만 사용하므로 GCP 역할 불필요)
4. 키 만들기 → **JSON** → 다운로드
5. 키 파일을 VPS에 업로드:
   ```bash
   scp service-account.json dev@46.250.251.82:/opt/envs/gdrive-service-account.json
   chmod 600 /opt/envs/gdrive-service-account.json
   ```

### 3. Google Drive 공유 폴더 설정

1. Google Drive에서 `VPS` 폴더 생성
2. 하위에 `QuickDrop/`, `StudyHub/` 폴더 생성
3. `VPS` 폴더를 서비스 계정 이메일(`vps-drive-uploader@<project>.iam.gserviceaccount.com`)에 **편집자** 권한으로 공유
4. `VPS` 폴더의 ID 기록 (URL에서 `folders/` 뒤의 문자열)

---

## 구현

### 의존성

```
google-auth>=2.0
google-api-python-client>=2.0
```

각 프로젝트의 `requirements.txt` (또는 Docker의 의존성 파일)에 추가.

### 공용 모듈: `utils/gdrive.py`

```python
from pathlib import Path

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ["https://www.googleapis.com/auth/drive.file"]


class GDriveUploader:
    def __init__(self, service_account_path: str):
        creds = Credentials.from_service_account_file(
            service_account_path, scopes=SCOPES
        )
        self.service = build("drive", "v3", credentials=creds)

    def upload_file(
        self,
        local_path: str,
        folder_id: str,
        filename: str | None = None,
    ) -> dict:
        """파일을 Google Drive 폴더에 업로드하고 파일 정보를 반환."""
        path = Path(local_path)
        file_metadata = {
            "name": filename or path.name,
            "parents": [folder_id],
        }
        media = MediaFileUpload(str(path), resumable=True)
        result = self.service.files().create(
            body=file_metadata,
            media_body=media,
            fields="id, name, webViewLink",
        ).execute()
        return result

    def find_or_create_folder(
        self, name: str, parent_id: str
    ) -> str:
        """하위 폴더를 찾거나 없으면 생성. 폴더 ID 반환."""
        query = (
            f"name='{name}' and '{parent_id}' in parents "
            f"and mimeType='application/vnd.google-apps.folder' "
            f"and trashed=false"
        )
        results = self.service.files().list(
            q=query, fields="files(id)"
        ).execute()
        files = results.get("files", [])
        if files:
            return files[0]["id"]

        metadata = {
            "name": name,
            "mimeType": "application/vnd.google-apps.folder",
            "parents": [parent_id],
        }
        folder = self.service.files().create(
            body=metadata, fields="id"
        ).execute()
        return folder["id"]

    def list_files(self, folder_id: str) -> list[dict]:
        """폴더 내 파일 목록 조회."""
        query = f"'{folder_id}' in parents and trashed=false"
        results = self.service.files().list(
            q=query,
            fields="files(id, name, size, createdTime, webViewLink)",
            orderBy="createdTime desc",
        ).execute()
        return results.get("files", [])
```

### QuickDrop 연동 예시

```python
# API 엔드포인트: POST /api/gdrive/upload
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api/gdrive", tags=["gdrive"])

class UploadRequest(BaseModel):
    file_id: str  # QuickDrop 내부 파일 ID

@router.post("/upload")
async def upload_to_drive(req: UploadRequest):
    uploader = GDriveUploader(settings.GDRIVE_SERVICE_ACCOUNT_PATH)
    file_path = get_vault_file_path(req.file_id)  # 기존 로직으로 경로 확인
    if not file_path:
        raise HTTPException(404, "파일을 찾을 수 없습니다")

    result = uploader.upload_file(
        local_path=str(file_path),
        folder_id=settings.GDRIVE_QUICKDROP_FOLDER_ID,
    )
    return {
        "drive_link": result.get("webViewLink"),
        "drive_file_id": result.get("id"),
    }
```

### StudyHub 자동 전송 예시

```python
# 크롤링 완료 후 콜백에서 호출
def on_crawl_complete(output_dir: str):
    uploader = GDriveUploader(settings.GDRIVE_SERVICE_ACCOUNT_PATH)
    folder_id = uploader.find_or_create_folder(
        name=datetime.now().strftime("%Y-%m-%d"),
        parent_id=settings.GDRIVE_STUDYHUB_FOLDER_ID,
    )
    for file in Path(output_dir).iterdir():
        if file.is_file():
            uploader.upload_file(str(file), folder_id)
```

### 환경변수

각 서비스의 `.env`에 추가:

```env
GDRIVE_SERVICE_ACCOUNT_PATH=/opt/envs/gdrive-service-account.json
GDRIVE_QUICKDROP_FOLDER_ID=<QuickDrop 폴더 ID>
GDRIVE_STUDYHUB_FOLDER_ID=<StudyHub 폴더 ID>
```

Docker 컨테이너에서 서비스 계정 파일에 접근하려면 볼륨 마운트 추가:

```yaml
volumes:
  - /opt/envs/gdrive-service-account.json:/secrets/gdrive.json:ro
```

이 경우 환경변수는 `/secrets/gdrive.json`으로 설정.

---

## 작업 순서

1. [x] GCP 프로젝트 생성 + Drive API 활성화
2. [x] 서비스 계정 생성 + JSON 키 다운로드 (`syworkspace-vps-4f365217552f.json`)
3. [x] Google Drive에 공유 폴더 생성 + 서비스 계정에 공유 (root: `1ykXM_uO1yG6ggq8XwbRKzvUIhwvbGJqI`)
4. [x] QuickDrop: `backend/gdrive.py` 모듈 + `POST /api/vault/gdrive` 엔드포인트 + UI 버튼
5. [x] StudyHub: `web/gdrive.py` 모듈 + `web/routes/gdrive.py` 라우터 + 프론트 UI
6. [x] StudyHub: 패키징 완료 후 자동 Drive 업로드 (pack 요청 시 `upload_to_drive: true`)
7. [x] Docker 볼륨 마운트 + 환경변수 설정 (양쪽 `docker-compose.yml` 수정)
8. [ ] VPS에 서비스 계정 키 업로드 + `.env`에 `GDRIVE_ROOT_FOLDER_ID` 추가
9. [ ] 배포 + 동작 확인

---

## 비용 & 제한

- Google Drive API: **무료** (일 쿼터 충분)
- 서비스 계정 Drive 용량: 공유 폴더 소유자의 용량 사용 (개인 계정 15GB)
- 파일 업로드 제한: 5TB/파일, 일 750GB 업로드
- VPS 용도로는 쿼터 걱정 없음
