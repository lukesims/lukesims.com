# lukesims.com

## Requirements

- Node 24
- PNPM 10
- An SMTP server

## Setup

Start an SMTP server if you haven't already, e.g. with Mailpit:

```sh
docker run -d \
  --name=mailpit \
  --restart unless-stopped \
  -p 8025:8025 \
  -p 1025:1025 \
  axllent/mailpit
```

Copy the example file and configure your environment variables:

```sh
cp .env.example .env
```

Then you can install deps and run the dev server:

```sh
pnpm i
pnpm dev
```
