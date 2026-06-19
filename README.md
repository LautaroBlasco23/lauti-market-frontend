# Lauti Market Frontend

> **⚠️ Project status:** This is a learning project built to practice Next.js, TypeScript, and modern frontend patterns. It is not maintained, will not receive new features, and is not intended for production use. The code is here for reference and learning purposes.

Frontend for my marketplace personal project, built with Next.js 16 + TypeScript + shadcn/ui.

## Run

```bash
cp .env.local.example .env.local  # set NEXT_PUBLIC_API_URL
npm install
make dev          # or: npm run dev
```

Server starts on `:3000`.

## Build

```bash
npm run build     # Production build
npm run lint      # Run ESLint
```

## CI/CD

The GitHub Actions pipeline type-checks, builds, and pushes a Docker image to Docker Hub on every push to `main`.

Required repository secrets (`Settings → Secrets and variables → Actions`):

| Secret               | Description                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username                                                    |
| `DOCKERHUB_TOKEN`    | Docker Hub access token — generate at hub.docker.com → Account Settings → Security |
