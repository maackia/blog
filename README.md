# MAACKIA.LOG

React 애플리케이션을 만들고 컨테이너로 패키징해 Kubernetes에 배포하는 과정을 기록하는 개인 기술 블로그입니다.

## 기술 스택

- Next.js 16 App Router / React 19
- TypeScript 6
- Tailwind CSS 4
- MDX 콘텐츠
- Vitest / ESLint
- Prometheus `prom-client`
- Node.js 24 기반 standalone 컨테이너
- GitHub Actions / GitHub Container Registry

## 로컬 실행

```bash
npm install
npm run dev
```

기본 주소는 `http://localhost:3000`입니다.

## 콘텐츠 작성

글은 `content/posts/*.mdx`에 저장합니다. 각 파일은 다음 frontmatter를 사용합니다.

```yaml
---
title: "글 제목"
description: "글 설명"
publishedAt: "2026-08-07"
tags:
  - kubernetes
featured: false
draft: false
---
```

`draft: true`인 글은 목록과 정적 경로에서 제외됩니다.

## 운영 엔드포인트

| 경로 | 용도 |
| --- | --- |
| `/health/live` | Kubernetes liveness probe |
| `/health/ready` | Kubernetes readiness probe 및 콘텐츠 검사 |
| `/metrics` | Prometheus 형식의 Node.js 및 블로그 지표 |

## 검증

```bash
npm run lint
npm test
npm run build
docker build -t blog:local .
```

## 컨테이너 이미지

`main` 브랜치와 `v*.*.*` 태그는 다음 형식으로 GHCR 이미지를 게시합니다.

```text
ghcr.io/maackia/blog:latest
ghcr.io/maackia/blog:sha-<commit>
ghcr.io/maackia/blog:<semver>
```

Kubernetes Deployment에는 변경되지 않는 `sha-*` 또는 SemVer 태그 사용을 권장합니다.

## 플랫폼 연결

애플리케이션 소스와 이미지는 이 저장소가 담당합니다. Deployment, Service, Ingress, ServiceMonitor, Grafana 대시보드와 경고 규칙은 [`container-platform-lab`](https://github.com/maackia/container-platform-lab)에서 관리합니다.
