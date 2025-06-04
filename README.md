# Flex Job Reports
Application targeted for HVAC companies to streamline the job reporting process and improve efficiency via client, address, system, and job report creation with Gen AI integration for seamless job reporting.

## Run project locally (Expo Go)

Make sure you're using `node: v20`

1. If you want to fetch from supabse stage, jump the following 2 steps. Just use the env.stage, and add the supabse url and anon key in the EXPO_PUBLIC_... format.
2. Run supabase locally `supabase start` (Not required if you are using the stage environment config)
3. Pull environment variables from EAS server with:

```bash
$ eas env:pull --environment development
```

**Note:** change for preview, or production, to pull correct environment variables.

# Update Supabase Databases

Note: Requires a healthy supabase container running locally so that Supabase can: 

- Safely analyze and diff schemas using a known Postgres version.
- Avoid messing up your remote database.
- Run deterministic migration comparisons in a safe containerized environment.

## Option 1: Pull any differences made in supabase project
After you've made any change in supabase, run below commands to create migration.



```bash
$ supabase link --project-ref $STAGE_PROJECT_ID

# Pull differences made in slef managed schemas (public, private)
# Note: Don't pull schemas auth or storage, if you make any changes to these schemas, add these changes manually to the migrations
$ supabase db pull
```

Then, push the changes to dev branch

```bash
$ git add .
$ git commit -m "some change"
$ git push

# The CI will push the new changes into the supabase project
```

## Option 2: Manually add and push migration

```bash
$ supabase migration new any_useful_name

# Then, push the changes to dev branch
$ git add .
$ git commit -m "any useful name"
$ git push
```

# Deployment

If you've done any changes in native code or app.json file, run:

```bash
$ npx expo prebuild -p ios
```

To make sure that native code is re-generated.

## 1. Create production build 

```bash
$ eas build --platform ios --profile production
``` 

In Expo Build, a new build should have been triggered.

## 2. Submit to Testflight

### Option 1: Upload via EAS Workflow

```bash
$ npx eas-cli@latest workflow:run .eas/workflows/submit-to-testflight.yml
``` 

### Option2: Upload via Transporter App

Download and install Transporter app in your system. Then, manually drag and drop your build to it.