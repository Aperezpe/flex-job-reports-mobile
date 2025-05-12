# Flex Job Reports
Application targeted for HVAC companies trying to streamline the job reporting process and improve efficiency.

## Run project locally (Expo Go)

Make sure you're using `node: v20`

1. If you want to fetch from supabse stage, jump the following 2 steps. Just use the env.stage, and add the supabse url and anon key in the EXPO_PUBLIC_... format.
2. Run supabase locally `supabase start` (Optional if you want to use supabase stage environment)
3. Create .env.development (or .env.stage for stage) and add supabase local data: 
```js
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```
4. `yarn` to install all dependencies
5. `yarn start:local` or `yarn start:stage` if you want to pull the config from `.env.stage`

# Run development build

1. `eas build -p ios --profile preview` (or development, or production) \
Note: you can use the flags preview, development, or production. Preview for emulator preview, development for device build.

# Pull any differences made in supabase project

After you've made any change in supabase, run below commands to create migration.

```bash
$ supabase link --project-ref $STAGE_PROJECT_ID

# Pull differences made in slef managed schemas (public, private)
# Note: Don't pull schemas auth or storage, if you make any changes to these schemas, add these changes manually to the migrations
$ supabase db pull

# Then, push the changes to dev branch
$ git add .
$ git commit -m "some change"
$ git push

# The CI will push the new changes into the supabase project
```

# Manually add and push migration

```bash
$ supabase migration new any_useful_name

# Then, push the changes to dev branch
$ git add .
$ git commit -m "any useful name"
$ git push
```