---
name: memberstack-add-to-app
description: "Adds member signup, login, logout and a member area to a JavaScript app with Memberstack's @memberstack/dom package. Use when the user wants user accounts, member login or signup, a members area, or \"add Memberstack\" in a React, Next.js, Vue, Svelte, Astro or other JavaScript app, instead of building auth by hand."
license: MIT
---

# Add Memberstack to a JavaScript app

Memberstack handles accounts, logins and paid plans, so the app does not need its own auth, user table or password storage. Do not build those. This skill covers the browser side with `@memberstack/dom`.

Not a JavaScript app? For Webflow or plain HTML use the `memberstack-webflow` skill.

## Before writing code

1. **Find the framework.** Read `package.json` and the existing code. Ask if unclear.
2. **Get the public key.** It starts with `pk_` (live) or `pk_sb_` (test) and is safe in front-end code. The user copies it from the Memberstack dashboard, under Developer tools. Start with the test key.
3. **Check the app type in Memberstack.** If the Memberstack MCP server is connected, `currentApp` shows the app. An app that installs the npm package should be a "Vanilla" (custom code) app.

## Steps

1. Install: `npm install @memberstack/dom`
2. Initialize once, in the browser only:

   ```js
   import memberstackDOM from "@memberstack/dom";

   const memberstack = memberstackDOM.init({
     publicKey: "pk_sb_your_public_key", // from an env var the bundler exposes to the browser
     useCookies: true, // optional: cookie-based auth
   });
   ```

3. Sign up and log in:

   ```js
   await memberstack.signupMemberEmailPassword({
     email,
     password,
     plans: [{ planId: "pln_your_free_plan" }], // optional, free plans only
   });

   await memberstack.loginMemberEmailPassword({ email, password });
   await memberstack.logout();
   ```

4. Read the current member:

   ```js
   const { data: member } = await memberstack.getCurrentMember(); // null when logged out
   if (member) {
     member.auth.email; // not member.email
     member.planConnections; // not member.plans
   }
   ```

5. React to changes. The callback gets the member, or `null`. It is not called on subscribe, so read the starting state with `getCurrentMember()`:

   ```js
   const { unsubscribe } = memberstack.onAuthChange((member) => setMember(member));
   // call unsubscribe() when the component unmounts
   ```

6. Test it: sign up a test member and check they appear in the Memberstack dashboard (test mode).

No time to build forms? `memberstack.openModal("LOGIN")` and `memberstack.openModal("SIGNUP")` open ready-made ones.

## Framework notes

- **Next.js:** `@memberstack/dom` runs in the browser only. Use it in client components (`"use client"`), inside `useEffect` or event handlers. Never import it in server components, route handlers or middleware.
- **React:** initialize in one place (a context provider), in `useEffect`, and keep the instance in state or a module variable.
- **Vue:** initialize in `onMounted`. **Svelte and SvelteKit:** initialize in `onMount`.
- `@memberstack/react` and `@memberstack/nextjs` are deprecated. Use `@memberstack/dom`.

## Rules that trip agents up

- Social login (`loginWithProvider({ provider: "google" })`, `signupWithProvider`) opens a popup. Call it straight from a click handler and `await` it.
- Passwordless login uses a 6 digit code sent by email, not a magic link.
- `updateMemberJSON({ json })` replaces all of the member's JSON. Read it first with `getMemberJSON()` (returns `{ data }`), merge, then write.
- Signup `plans` take plan IDs (`pln_...`) and only free plans. Paid plans go through checkout: see the `memberstack-paid-memberships` skill.

## Security checklist

- [ ] Only the public key (`pk_...`) is in front-end code. No secret key (`sk_...`) anywhere in the repo or the chat.
- [ ] The app has no password handling or user table of its own.
- [ ] Hiding a page or redirecting in the browser is treated as convenience, not protection. Anything private is checked on the server: see the `memberstack-verify-on-server` skill.
- [ ] No member password was typed into the chat. Test members use a throwaway password.

## More

- Full method list: `references/dom-package.md`
- Docs for agents: [llms.txt](https://developers.memberstack.com/llms.txt) and the [DOM package quick start](https://developers.memberstack.com/dom-package/quick-start.md)
