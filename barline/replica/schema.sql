-- Barline schema (Postgres / Supabase). Weights in kg. Times in UTC.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  units text not null default 'kg' check (units in ('kg','lb')),
  default_rest_s int not null default 90 check (default_rest_s between 0 and 900),
  rpe_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade, -- null = built-in
  name text not null check (length(name) between 1 and 80),
  equipment text not null check (equipment in ('barbell','dumbbell','machine','cable','bodyweight','kettlebell','band','other')),
  muscle text not null,
  kind text not null default 'weight_reps' check (kind in ('weight_reps','bodyweight_reps','duration')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on exercises (user_id);
create unique index exercises_name_per_user on exercises (coalesce(user_id, '00000000-0000-0000-0000-000000000000'), lower(name));

create table routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  folder text,
  title text not null check (length(title) between 1 and 80),
  notes text not null default '',
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on routines (user_id, position);

create table routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references routines(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete restrict,
  position int not null,
  rest_s int not null default 90,
  superset_group int,
  notes text not null default '',
  sets jsonb not null default '[]' -- [{type, weight_kg, reps}]
);
create index on routine_exercises (routine_id, position);
create index on routine_exercises (exercise_id);

create table workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  routine_id uuid references routines(id) on delete set null,
  title text not null check (length(title) between 1 and 80),
  description text not null default '',
  started_at timestamptz not null,
  ended_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ends_after_start check (ended_at >= started_at)
);
create index on workouts (user_id, started_at desc);
create index on workouts (routine_id);

create table workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete restrict,
  position int not null,
  superset_group int,
  notes text not null default ''
);
create index on workout_exercises (workout_id, position);
create index on workout_exercises (exercise_id);

create table workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references workout_exercises(id) on delete cascade,
  position int not null,
  type text not null default 'normal' check (type in ('normal','warmup','drop','failure')),
  weight_kg numeric(6,2) check (weight_kg >= 0),
  reps int check (reps >= 0),
  duration_s int check (duration_s >= 0),
  rpe numeric(3,1) check (rpe between 6 and 10)
);
create index on workout_sets (workout_exercise_id, position);

create table measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  measured_on date not null,
  body_weight_kg numeric(5,2) check (body_weight_kg > 0),
  created_at timestamptz not null default now(),
  unique (user_id, measured_on)
);

-- Row level security: every user-owned table is visible only to its owner.
alter table profiles enable row level security;
alter table exercises enable row level security;
alter table routines enable row level security;
alter table routine_exercises enable row level security;
alter table workouts enable row level security;
alter table workout_exercises enable row level security;
alter table workout_sets enable row level security;
alter table measurements enable row level security;

create policy own_profile on profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy read_exercises on exercises for select using (user_id is null or user_id = auth.uid());
create policy write_exercises on exercises for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_routines on routines for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_routine_ex on routine_exercises for all
  using (exists (select 1 from routines r where r.id = routine_id and r.user_id = auth.uid()))
  with check (exists (select 1 from routines r where r.id = routine_id and r.user_id = auth.uid()));
create policy own_workouts on workouts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_workout_ex on workout_exercises for all
  using (exists (select 1 from workouts w where w.id = workout_id and w.user_id = auth.uid()))
  with check (exists (select 1 from workouts w where w.id = workout_id and w.user_id = auth.uid()));
create policy own_sets on workout_sets for all
  using (exists (select 1 from workout_exercises we join workouts w on w.id = we.workout_id
                 where we.id = workout_exercise_id and w.user_id = auth.uid()))
  with check (exists (select 1 from workout_exercises we join workouts w on w.id = we.workout_id
                 where we.id = workout_exercise_id and w.user_id = auth.uid()));
create policy own_measurements on measurements for all using (user_id = auth.uid()) with check (user_id = auth.uid());
