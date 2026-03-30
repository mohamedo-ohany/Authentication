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
3. Route forwards sanitized payload to `${API_BASE_URL}/user/{operation}`.
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
API_BASE_URL=http://localhost:8000/api
AUTH_SECRET=replace_with_strong_random_value
# Optional, defaults to Token when missing
AUTH_COOKIE_NAME=Token
```

Notes:

- `API_BASE_URL` is required for auth route forwarding and proxy checks.
- Do not commit real secrets.

## Local Development

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
	api/auth/
		[operation]/route.ts      # login/signup proxy route
		logout/route.ts           # logout + cookie cleanup
	lib/
		definitions.ts            # zod schemas + form types
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
