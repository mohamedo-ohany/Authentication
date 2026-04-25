# Authentication Frontend (Next.js)

A Next.js 16 authentication frontend with animated forms, cookie-based session flow, dark/light mode, and bilingual UI (English/Arabic).

## Tech Stack

- Next.js 16 (App Router + Cache Components)
- React 19 + TypeScript
- Tailwind CSS 4
- react-hook-form + zod
- motion
- next-intl
- shadcn/ui + Radix UI + next-themes

## Current Features

- Landing page with animated entry, auth navigation, theme toggle, and language toggle.
- Login page at `/log-in` with validation, animated field states, and password visibility toggle.
- Sign-up page at `/sign-up` with validation, animated field states, and password confirmation.
- Profile page at `/profile` with logout action.
- Unified auth API route at `/api/auth/[operation]` handling `login` and `signup`.
- Logout API route at `/api/auth/logout` clearing supported auth cookie names.
- Route protection through `proxy.ts` for `/profile/:path*`.
- i18n support for exactly two locales: `en` and `ar`.

## Auth API Flow

1. Client form submits to `/api/auth/login` or `/api/auth/signup`.
2. Route validates input with zod.
3. Route forwards sanitized payload to Render backend `/user/{operation}`.
4. On failure, route returns normalized `fieldErrors` and fallback `error` message.
5. On success, route forwards `Set-Cookie` headers and returns `{ success: true }`.

Expected success signal from auth API response is `ok === 1`.

## Internationalization

- Messages are loaded from:
	- `messages/en.json`
	- `messages/ar.json`
- Locale resolution priority:
	1. `locale` cookie
	2. `requestLocale`
	3. default `en`
- The language dropdown updates locale in client state, persists it to cookie, then refreshes the app.

## Environment Variables

Create a `.env` file in project root:

```env
# Local dev backend (optional in development)
API_BASE_URL=http://localhost:8000

# Production backend base URL used by /api/auth and proxy
RENDER_API_BASE_URL=https://authentication-waad.onrender.com

# Optional shared secret between Vercel and Render backend
# When set, backend accepts requests only with this header key.
INTERNAL_API_KEY=replace-with-strong-secret

# Optional, defaults to Token
AUTH_COOKIE_NAME=Token

# Optional token TTL
JWT_TTL_SECONDS=3600

# Optional JWT secret for backend token signing
JWT_SECRET=replace-with-strong-secret
```

Notes:

- In production, backend requests default to `RENDER_API_BASE_URL`.
- In local development, backend requests default to `API_BASE_URL`.
- Keep `INTERNAL_API_KEY` the same in both Vercel and Render to prevent direct abuse of backend routes.
- In Vercel production, remove old `API_BASE_URL` values pointing to Railway to avoid accidental misrouting.

Install dependencies:

```bash
pnpm install
```

Start dev server:

```bash
pnpm dev
```

Open http://localhost:3000

## Scripts

- `pnpm dev` - start development server
- `pnpm build` - production build
- `pnpm start` - start production server
- `pnpm lint` - run ESLint

## Project Structure

```text
app/
	health/route.ts               # backend health endpoint for Render + cron
	user/[operation]/route.ts     # backend login/signup/isloggedin endpoints
	api/auth/
		[operation]/route.ts      # login/signup proxy route
		logout/route.ts           # logout + cookie cleanup
	lib/
		definitions.ts            # zod schemas + form types
		renderAuthBackend.ts      # backend helpers (tokens, storage, validation)
		useAuthFormSubmit.ts      # shared auth submit hook
		zodFormResolver.ts        # resolver adapter for zod v4
	log-in/page.tsx             # login form
	sign-up/page.tsx            # signup form
	profile/page.tsx            # authenticated profile page
	page.tsx                    # landing page
	layout.tsx                  # providers and app shell

components/
	auth/
		AuthFormLayout.tsx        # shared auth form shell
		AnimatedFieldWrapper.tsx  # animated field wrapper
		AuthFormActions.tsx       # shared cancel/submit actions
	LocaleToggle.tsx            # locale switcher (en/ar)
	ModeToggle.tsx              # theme switcher
	ui/                         # reusable UI primitives

messages/
	en.json
	ar.json

src/
	i18n/request.ts             # locale + messages loader
	types/animation.types.ts    # motion presets

proxy.ts                      # route protection middleware
```

## Validation And Error Handling

- Field validation is defined in zod schemas.
- Server-side validation errors are mapped to field-level UI errors.
- Network failures return safe fallback messages.

## Build Status

- `pnpm lint` passes.
- `pnpm build` passes.
