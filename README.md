# MAACKIA.LOG

기술과 일상을 서로 다른 두 개의 로그로 기록하는 개인 블로그입니다.

- **LIFE LOG**: 일상, 취미, 사진
- **TECH LOG**: 개발, Kubernetes, 배포와 관측

두 채널은 글 목록과 주소를 분리하지만 같은 디자인 시스템, 저장소와 배포 흐름을 사용합니다. Kubernetes, Prometheus, Grafana 같은 운영 환경은 별도 저장소인 [`container-platform-lab`](https://github.com/maackia/container-platform-lab)에서 관리합니다.

## 페이지 구조

| 경로 | 내용 |
| --- | --- |
| `/` | LIFE LOG와 TECH LOG를 선택하는 입구 |
| `/life` | 생활 기록 메인 |
| `/tech` | 기술 기록 메인 |
| `/<channel>/posts/<slug>` | 채널별 글 |
| `/<channel>/tags/<tag>` | 채널별 태그 목록 |
| `/about` | 블로그 소개 |

상단의 `LIFE LOG / TECH LOG` 스위치로 두 메인 페이지를 오갈 수 있습니다.

## 글 작성

글은 `content/posts/*.mdx`에 저장합니다. `channel`에는 `life` 또는 `tech`를 지정합니다.

```yaml
---
title: "글 제목"
description: "글 설명"
publishedAt: "2026-08-07"
channel: "life"
coverImage: "/images/posts/my-day/cover.jpg"
tags:
  - daily
  - photo
featured: false
draft: false
---
```

사진은 `public/images/posts/<글-slug>/` 아래에 두고 Markdown 이미지 또는 `coverImage`로 참조합니다.

```md
![사진 설명](/images/posts/my-day/photo-01.jpg)
```

`draft: true`인 글은 목록과 정적 경로에서 제외됩니다.

## 로컬 실행

Node.js 24 이상이 필요합니다.

```bash
npm install
npm run dev
```

기본 주소는 `http://localhost:3000`입니다.

## 기술 구성

- Next.js 16 App Router / React 19
- TypeScript 6
- Tailwind CSS 4
- MDX 콘텐츠
- Vitest / ESLint
- Node.js 24 standalone 컨테이너
- GitHub Actions / GitHub Container Registry

## 검증

```bash
npm run lint
npm test
npm run build
docker build -t blog:local .
```

## 운영 연결

| 경로 | 용도 |
| --- | --- |
| `/health/live` | Kubernetes liveness probe |
| `/health/ready` | Kubernetes readiness probe |
| `/metrics` | Prometheus 지표 |

`main` 브랜치와 `v*.*.*` 태그는 `ghcr.io/maackia/blog` 이미지를 게시합니다. 실제 Deployment, Service, Ingress, ServiceMonitor와 Grafana 설정은 `container-platform-lab`에서 관리합니다.
