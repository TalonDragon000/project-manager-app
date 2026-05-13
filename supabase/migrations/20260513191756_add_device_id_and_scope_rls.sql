/*
  # Add device_id column and scope RLS to device ownership

  ## Changes

  ### projects table
  - Adds `device_id` (text, NOT NULL DEFAULT '') — identifies which device owns the row
  - Drops the wide-open "Anyone can ..." policies
  - Replaces them with policies that restrict all operations to rows where
    device_id matches the `x-device-id` request header value

  ### tasks table
  - Adds `device_id` (text, NOT NULL DEFAULT '') — same ownership marker
  - Drops the wide-open policies and replaces with device-scoped ones

  ## Security notes
  - The `x-device-id` header is read via `current_setting('request.headers', true)`
    which Supabase PostgREST populates from the incoming HTTP headers
  - A device can only read/write/delete its own rows
  - The seed data row gets device_id = '' which means it is inaccessible under the
    new policies (intentional — each real device starts fresh)
*/

-- 1. Add device_id columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS device_id text NOT NULL DEFAULT '';
ALTER TABLE tasks    ADD COLUMN IF NOT EXISTS device_id text NOT NULL DEFAULT '';

-- 2. Drop old open policies on projects
DROP POLICY IF EXISTS "Anyone can read projects"    ON projects;
DROP POLICY IF EXISTS "Anyone can insert projects"  ON projects;
DROP POLICY IF EXISTS "Anyone can update projects"  ON projects;
DROP POLICY IF EXISTS "Anyone can delete projects"  ON projects;

-- 3. Drop old open policies on tasks
DROP POLICY IF EXISTS "Anyone can read tasks"    ON tasks;
DROP POLICY IF EXISTS "Anyone can insert tasks"  ON tasks;
DROP POLICY IF EXISTS "Anyone can update tasks"  ON tasks;
DROP POLICY IF EXISTS "Anyone can delete tasks"  ON tasks;

-- 4. Helper: extract device id from request headers
-- current_setting('request.headers', true) returns a JSON string like
-- '{"x-device-id":"<uuid>", ...}'
-- We use a helper expression inline in each policy.

-- 5. Scoped policies on projects
CREATE POLICY "Device can read own projects"
  ON projects FOR SELECT
  TO anon, authenticated
  USING (
    device_id = (
      SELECT COALESCE(
        (current_setting('request.headers', true)::json)->>'x-device-id',
        ''
      )
    )
  );

CREATE POLICY "Device can insert own projects"
  ON projects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    device_id = (
      SELECT COALESCE(
        (current_setting('request.headers', true)::json)->>'x-device-id',
        ''
      )
    )
  );

CREATE POLICY "Device can update own projects"
  ON projects FOR UPDATE
  TO anon, authenticated
  USING (
    device_id = (
      SELECT COALESCE(
        (current_setting('request.headers', true)::json)->>'x-device-id',
        ''
      )
    )
  )
  WITH CHECK (
    device_id = (
      SELECT COALESCE(
        (current_setting('request.headers', true)::json)->>'x-device-id',
        ''
      )
    )
  );

CREATE POLICY "Device can delete own projects"
  ON projects FOR DELETE
  TO anon, authenticated
  USING (
    device_id = (
      SELECT COALESCE(
        (current_setting('request.headers', true)::json)->>'x-device-id',
        ''
      )
    )
  );

-- 6. Scoped policies on tasks
CREATE POLICY "Device can read own tasks"
  ON tasks FOR SELECT
  TO anon, authenticated
  USING (
    device_id = (
      SELECT COALESCE(
        (current_setting('request.headers', true)::json)->>'x-device-id',
        ''
      )
    )
  );

CREATE POLICY "Device can insert own tasks"
  ON tasks FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    device_id = (
      SELECT COALESCE(
        (current_setting('request.headers', true)::json)->>'x-device-id',
        ''
      )
    )
  );

CREATE POLICY "Device can update own tasks"
  ON tasks FOR UPDATE
  TO anon, authenticated
  USING (
    device_id = (
      SELECT COALESCE(
        (current_setting('request.headers', true)::json)->>'x-device-id',
        ''
      )
    )
  )
  WITH CHECK (
    device_id = (
      SELECT COALESCE(
        (current_setting('request.headers', true)::json)->>'x-device-id',
        ''
      )
    )
  );

CREATE POLICY "Device can delete own tasks"
  ON tasks FOR DELETE
  TO anon, authenticated
  USING (
    device_id = (
      SELECT COALESCE(
        (current_setting('request.headers', true)::json)->>'x-device-id',
        ''
      )
    )
  );
