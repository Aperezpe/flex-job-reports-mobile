# Flex Job Reports
Application targeted for HVAC companies trying to streamline the job reporting process and improve efficiency.

## Run project locally

Make sure you're using `node: v20`

1. Run supabase locally `supabase start` (Optional if you want to use supabase stage environment)
2. Create .env.development and add supabase local data: 
```js
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```
3. `npm install`
4. `npm run start:local` or `npm run start:stage` if you want to pull the config from `.env.stage`
