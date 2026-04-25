# Backend On Render + Keepalive Using cron-job.org

Follow these steps to host the backend on Render and keep it awake.

## 1) Deploy Backend Using Render Blueprint

1. Push the repository to GitHub.
2. In Render, create a new Blueprint service.
3. Select this repository.
4. Render detects `render.yaml` and provisions service `auth-backend-render`.
5. Wait for deploy to finish and copy the service URL.

Health URL:

- `https://<your-render-service>.onrender.com/health`

Expected sample response:

```json
{
  "ok": 1,
  "status": "up",
  "service": "auth-backend",
  "time": "2026-04-25T00:00:00+00:00"
}
```

## 2) Update Frontend Environment (Vercel)

Set this env var in Vercel and redeploy:

- `API_BASE_URL=https://<your-render-service>.onrender.com`

## 3) Create cron-job.org Keepalive Job

1. Login to `https://cron-job.org`.
2. Create a new cron job with:
   - URL: `https://<your-render-service>.onrender.com/health`
   - Method: `GET`
   - Interval: every `5` minutes
3. Save and enable the job.

## 4) Verify End-To-End

1. `GET /health` returns `ok: 1`.
2. Signup from frontend succeeds.
3. Login from frontend succeeds.
4. `POST /user/isloggedin` succeeds when `Token` cookie exists.