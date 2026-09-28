# MAACKIA.LOG

LIFE LOG와 TECH LOG를 분리한 개인 블로그. Next.js 16, React 19, SQLite, 제한된 MDX로 실행됩니다.

## 주소

| 경로 | 기능 |
| --- | --- |
| `/` | LIFE / TECH 채널 입구 |
| `/life`, `/tech` | 채널별 글 목록 |
| `/<channel>/posts/<slug>` | 발행된 글 |
| `/<channel>/tags/<tag>` | 태그별 글 |
| `/admin` | 대시보드·글 관리·편집·휴지통·설정 |
| `/health/live`, `/health/ready` | 상태 점검 |

## 관리자 작업 공간

- **대시보드**: 실제 글 수(전체·발행·임시저장·휴지통), 최근 수정한 글.
- **글 관리**: 제목·slug·태그 검색, 채널·상태 필터, 수정일·발행일·제목 정렬, 발행 취소.
- **편집**: 본문과 미리보기 분할, 저장 상태, 저장하지 않고 이동할 때 경고. 자동저장은 아닙니다.
- **휴지통**: 삭제한 글을 보관하며 공개 페이지에서는 즉시 숨깁니다. 복원 시 항상 임시저장이며, 휴지통에서만 영구 삭제할 수 있습니다.
- **설정**: 현재 비밀번호를 확인한 후 새 비밀번호(12~128자)로 변경. 모든 기존 세션은 즉시 만료됩니다.

관리자 화면은 공개 블로그 헤더·푸터와 분리되어 있으며 모바일에서는 상단 메뉴 버튼으로 이동합니다.
미디어 업로드, 방문자 분석, 사이트 제목·소개 편집은 이번 버전에 포함되지 않습니다.

`/admin`은 서버의 Tailscale IP에서만 이용합니다. 관리자는 비밀번호로 로그인합니다.
글은 SQLite에 저장되고, 임시저장 상태의 글은 공개 목록·태그·사이트맵에서 보이지 않습니다.
`/admin`에서 글 목록을 골라 편집하거나 `+ 새 글`을 누른 뒤 제목·slug·채널·본문·태그·상태를 설정하세요.
`미리보기`는 실제 게시 페이지와 동일한 렌더러를 사용합니다.

본문은 Markdown(GFM 표·코드 블록 지원)과 **단순 텍스트** `<Callout title="팁">내용</Callout>`만 허용합니다.
`import`, `export`, JavaScript 표현식, 기타 JSX·HTML은 허용하지 않으며 실행하지 않습니다.
이미지는 `public/images/posts/<slug>/`에 수동으로 놓고 `![설명](/images/posts/<slug>/사진.jpg)`처럼 참조합니다.
관리자 화면에서 이미지 업로드는 아직 제공하지 않습니다.

## 로컬 개발

Node.js 24 이상이 필요합니다.

```bash
npm ci
# 테스트용 DB 파일. 운영 DB 파일은 Git에서 제외됩니다.
BLOG_DB_PATH="$PWD/data/blog.sqlite" npx tsx scripts/import-mdx.ts
npm run dev
```

기존 `content/posts/*.mdx` 네 개의 이관 명령은 같은 slug를 건너뛰므로 재실행해도 중복되지 않습니다.
이관 후 글을 DB에서 수정한 경우 원본 파일은 갱신되지 않으므로 **이관 명령을 재실행해도 DB 수정 내용은 덮어쓰지 않습니다.**

관리자 설정 예시는 `.env.example`을 참고하세요. 비밀번호 해시는 `npx tsx scripts/generate-admin-password.ts`로 생성하며,
`BLOG_SESSION_SECRET`은 `openssl rand -hex 32`처럼 생성합니다. 해시와 비밀값은 절대 Git에 올리지 않습니다.

## 라즈베리파이 운영

운영 DB는 소스/빌드 산출물과 분리된 `/home/maackia/blog-data/blog.sqlite`에 두고
`BLOG_DB_PATH`, `BLOG_TAILSCALE_IP`, `BLOG_SESSION_SECRET`, `BLOG_ADMIN_PASSWORD_HASH`를
systemd의 비공개 EnvironmentFile에 설정합니다. 서비스는 Next.js standalone으로 실행합니다.
관리자 페이지의 Host 검사만으로는 네트워크가 제한되지 않습니다. 현재 라즈베리파이에서는
서비스가 **Tailscale IP `100.117.215.92`에만 바인딩**되어 LAN에서 접근할 수 없습니다.
서비스를 `0.0.0.0`에 다시 바인딩하거나 인터넷에 노출하려면 관리자 페이지를 별도 네트워크/프록시에서 제한해야 합니다.
현재 운영 주소와 비밀번호 정보는 서버 설정을 참고하세요.
비밀번호를 처음 변경하기 전에는 `BLOG_ADMIN_PASSWORD_HASH`를 사용하고, 변경 후에는 DB의 해시가 우선합니다.
변경 후 최초 비밀번호 파일은 유효하지 않습니다. DB 백업에는 비밀번호 해시도 포함되므로 비공개로 보관하세요.

운영 프로세스는 `/home/maackia/blog-releases/<release>`의 독립된 standalone 복사본에서 실행합니다.
`/home/maackia/apps/blog/.next`에서 직접 실행하지 마세요. 새 빌드는 이 디렉터리를 재생성하기 때문에
운영 서버의 JS/CSS를 깨뜨릴 수 있습니다. 빌드·테스트 후 standalone, `.next/static`, `public`을 새 release로 복사하고
systemd `WorkingDirectory`를 전환합니다. DB는 release 외부의 같은 경로를 사용합니다.

SQLite DB는 WAL 모드입니다. 백업은 실행 중 파일을 그냥 복사하지 말고 SQLite의 `.backup` API로 만들거나
서비스를 중지한 후 DB/WAL 파일을 함께 복사하세요. 업로드 이미지가 추가되면 이미지 디렉터리도 별도 백업해야 합니다.

## 검증

```bash
npm run lint
npm test
npm run build
npm audit --omit=dev
# 로컬 Chromium이 설치되어 있어야 합니다. 기본 /usr/bin/chromium 또는 CHROMIUM_PATH 지정.
node scripts/test-admin-dashboard.mjs
```

브라우저 검증은 임시 DB·별도 release·127.0.0.1:3182를 사용하며 운영 DB를 변경하지 않습니다.
로그인, 편집, 미리보기, 발행/취소, 검색/필터, 휴지통/복원/영구 삭제, CSRF,
비밀번호 변경·세션 만료, 로그아웃, 모바일 화면, 공개 레이아웃을 검사합니다.
DB 마이그레이션은 기존 행을 보존하는 `deleted_at` 열과 인증 테이블 추가입니다.

`main`과 `v*.*.*`는 GitHub Actions에서 GHCR 이미지를 발행합니다. 이미지에 SQLite DB는 포함하지 않습니다.
컨테이너로 운영한다면 `/data`를 영속 볼륨으로 연결하고 관리자 비밀값을 별도로 주입하세요.
