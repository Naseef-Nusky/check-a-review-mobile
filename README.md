# Check A Review — Mobile

Expo (React Native) app for customers and businesses. Uses the same backend API as the web apps.

## How the app works

```
Open app
   ↓
Logged in?
   ├── No  → Login / Register (choose Customer or Business)
   └── Yes → route by role
              ├── customer → Search → Business detail → Write review
              │              My reviews / Profile
              └── business → Dashboard / Reviews (reply) / Profile
```

## Run

1. Start backend on port **5001**
2. Update `.env` with your Mac LAN IP (for a real phone):

```
EXPO_PUBLIC_API_URL=http://YOUR_IP:5001/api
```

3. Start the app:

```bash
cd "check A review-mobile"
npm start
```

Then press `i` (iOS), `a` (Android), or scan the QR code with **Expo Go**.

## Demo / test accounts

Use the **Business** tab only with a business-role login that owns (or is an active member of) a company.

- Business owner (Green Leaf Café): `naseefnusky09@gmail.com` (your password)
- Customer / reviewer: `naseefnuzky1999@gmail.com` or `naseefnusky@outlook.com` (Customer tab)

Note: `naseefnusky@outlook.com` is a **customer** account only — business login with that email will fail.
`naseefnuzky1999@gmail.com` also has a business-role user, but its Green Leaf membership is currently **disabled**, which shows “Business not found” on the dashboard.
