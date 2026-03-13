# Auth Project (Next.js + PHP API)

Frontend authentication demo built with Next.js (App Router) and TypeScript.
The app currently implements a sign-up flow that proxies requests to a PHP backend and forwards backend cookies to the browser.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- react-hook-form + zod validation
- shadcn/ui components + next-themes
- next-intl (messages are currently loaded statically from English locale)

## Current Features

- Home page with links to auth routes and theme toggle
- Sign-up UI with client-side validation
- API route proxy for sign-up (`/api/auth/signup`)
- Backend validation error mapping to field-level form errors
- Cookie forwarding from PHP backend (`Set-Cookie` is passed through by the Next.js route)

## Auth Flow (Current)

1. User submits form at `/sign-up`.
2. Frontend sends `POST /api/auth/signup` to the Next.js route handler.
3. Route validates payload with zod.
4. Route forwards request to `${API_BASE_URL}/user/signup`.
5. If backend returns errors, route maps and returns structured `fieldErrors`.
6. If backend succeeds, route forwards `Set-Cookie` from backend response.
7. Frontend redirects to `/profile` on success.

## API Contract Expected From PHP

The sign-up route currently expects JSON similar to:

```json
{
	"ok": 1,
	"message": "optional",
	"errors": {
		"email": ["Email already exists"]
	}
}
```

Notes:

- Success is detected via `ok === 1`.
- Validation/business errors can be either:
	- array of strings
	- object keyed by field (`email`, `username`, `password`, etc.)
- Backend should return `Set-Cookie` when auth/session cookie is needed.

## Environment Variables

Create/update `.env` in project root:

```env
API_BASE_URL=http://localhost:8000/api
AUTH_SECRET=replace_with_strong_random_value
```

Notes:

- `API_BASE_URL` is required for the API proxy route.
- `AUTH_SECRET` exists in current env file but is not actively used by the current route handlers.
- Do not commit real secrets.

## Local Development

Install dependencies:

```bash
pnpm install
```

Run dev server:

```bash
pnpm dev
```

Open:

- `http://localhost:3000`

## Scripts

- `pnpm dev` - start development server
- `pnpm build` - production build
- `pnpm start` - start production server
- `pnpm lint` - run ESLint

## Project Structure

```text
app/
	api/auth/signup/route.ts    # Next.js API route proxy for sign-up
	lib/definitions.ts          # zod schemas and form types
	sign-up/page.tsx            # sign-up page and form logic
	layout.tsx                  # root layout, theme and intl providers
	page.tsx                    # landing page

components/
	ui/*                        # shadcn/ui components
	ModeToggle.tsx              # light/dark/system theme switch
	theme-provider.tsx          # next-themes wrapper

messages/
	en.json
	ar.json

src/i18n/
	request.ts                  # next-intl request config
```

## i18n Status

- `next-intl` is configured.
- Locale is currently hardcoded to `en` in `src/i18n/request.ts`.
- Arabic messages file exists but is not selected dynamically yet.

## Known Gaps

- Home page links to `/log-in`, but this route/page is currently missing.
- Redirect target `/profile` is referenced after successful sign-up, but profile route is not present in current tree.
- `proxy.ts` exists but is empty.

## Recommended Next Steps

1. Add `/log-in` page and `/api/auth/login` route.
2. Add protected `/profile` page and server-side auth check.
3. Move locale from static to dynamic selection (cookie/header/path).
4. Add integration tests for auth flow and backend error mapping.

## Troubleshooting

- `API is not configured`:
	- Ensure `.env` contains `API_BASE_URL`.
	- Restart dev server after changing env vars.
- `Network error, please try again`:
	- Verify PHP backend is running and reachable.
	- Confirm backend URL path includes `/user/signup` under `API_BASE_URL`.
