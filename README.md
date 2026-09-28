# MAACKIA.LOG

LIFE LOG와 TECH LOG를 분리한 개인 블로그. Next.js 16, React 19, SQLite, 제한된 MDX로 실행됩니다.

## 주소

| 경로 | 기능 |
| --- | --- |
| `/` | LIFE / TECH 채널 입구 |
| `/life`, `/tech` | 채널별 글 목록 |
| `/<channel>/posts/<slug>` | 발행된 글 |
| `/<channel>/tags/<tag>` | 태그별 글 |
| `/admin` | 관리자 글쓰기·미리보기·발행·삭제 |
| `/health/live`, `/health/ready` | 상태 점검 |

## 관리자 글쓰기

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
관리자 페이지의 Host 검사만으로는 네트워크가 제한되지 않습니다. **포트 80의 `/admin` 접근은
Tailscale 외의 인터페이스에서 방화벽으로 차단**해야 합니다. 현재 운영 주소와 비밀번호 정보는 서버 설정을 참고하세요.

SQLite DB는 WAL 모드입니다. 백업은 실행 중 파일을 그냥 복사하지 말고 SQLite의 `.backup` API로 만들거나
서비스를 중지한 후 DB/WAL 파일을 함께 복사하세요. 업로드 이미지가 추가되면 이미지 디렉터리도 별도 백업해야 합니다.

## 검증

```bash
npm run lint
npm test
npm run build
npm audit --omit=dev
```

`main`과 `v*.*.*`는 GitHub Actions에서 GHCR 이미지를 발행합니다. 이미지에 SQLite DB는 포함하지 않습니다.
컨테이너로 운영한다면 `/data`를 영속 볼륨으로 연결하고 관리자 비밀값을 별도로 주입하세요.
