# Prolific Setup Guide

## 1. Deploy the study (required before going live)

Participants need a public HTTPS URL. Options:

| Option | Command / link |
|--------|----------------|
| **VPS + Docker** | `docker compose up -d --build` on your server |
| **Render** | Use `render.yaml` in repo root |
| **Local pilot only** | `http://localhost:8080` (not for real participants) |

Set environment variables on the server:

```env
HCO_COMPLETION_CODE=YOUR-PROLIFIC-CODE-HERE
FRONTEND_URL=https://your-study-domain.com
```

## 2. Create Prolific study

1. Go to [Prolific](https://www.prolific.com) → Create study
2. **Study link:**

```
https://YOUR-DOMAIN/?PROLIFIC_PID={{%PROLIFIC_PID%}}&STUDY_ID={{%STUDY_ID%}}
```

3. **Completion option:** Code  
   Use the same value as `HCO_COMPLETION_CODE`

4. **Estimated completion time:** 15–20 minutes

5. **Peripheral requirements:**
   - Microphone required (biometric challenge)
   - Desktop/laptop recommended (canvas tasks)
   - Quiet environment

## 3. Pilot run (5–10 participants)

Before main collection:

- [ ] Complete one full session yourself
- [ ] Check CSV export has 20 rows per participant
- [ ] Verify completion code appears on debrief
- [ ] Confirm median completion time matches estimate

```bash
curl https://YOUR-API-DOMAIN/api/admin/export -o pilot_trials.csv
```

## 4. Main collection

- Target N from power analysis
- Monitor `/api/admin/export` periodically
- Backup database daily:

```bash
./scripts/backup_db.sh
```

## 5. After collection

```bash
cd analysis
python stats.py path/to/hco_study.db
python figures.py path/to/hco_study.db
python automated_solver_test.py   # requires GOOGLE_API_KEY
```
