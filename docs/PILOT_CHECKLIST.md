# Pre-Launch Pilot Checklist

## Technical

- [ ] `docker compose up --build` — all 3 services healthy
- [ ] `./scripts/smoke_test.py` passes (20 trials via API)
- [ ] Browser: Landing → Consent → Practice → Study → Debrief
- [ ] Timer counts down and expires correctly
- [ ] Microphone permission works (Biometric challenge)
- [ ] Completion code shown on debrief page
- [ ] `curl http://localhost:8000/api/admin/export` returns CSV with trials
- [ ] `./scripts/backup_db.sh` creates backup file

## Prolific

- [ ] `HCO_COMPLETION_CODE` set in `.env` / server env
- [ ] Study URL includes `PROLIFIC_PID` and `STUDY_ID` params
- [ ] Completion code matches Prolific study settings
- [ ] Estimated time: 15–20 min
- [ ] Device/compatibility notes added to study description

## Ethics / IRB

- [ ] Consent text reviewed and approved
- [ ] Data stored anonymously (participant_id is random hex)
- [ ] Withdrawal without penalty mentioned in consent

## Pilot (5–10 participants)

- [ ] Run pilot batch on Prolific
- [ ] Check for technical failures (latency_fail rate)
- [ ] Review 2–3 CSV exports manually
- [ ] Adjust `delta_resp` if needed (backend challenge files)

## Analysis ready

- [ ] `analysis/stats.py` runs on exported DB
- [ ] `analysis/figures.py` generates PDFs
- [ ] Gemini solver benchmark scheduled (`automated_solver_test.py`)
