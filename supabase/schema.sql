create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free',
  daily_task_limit integer not null default 25,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('openai', 'gemini', 'claude')),
  encrypted_key text not null,
  key_hint text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  role text not null,
  description text not null default '',
  base_prompt text not null,
  favorite_provider text not null default 'openai',
  model text not null default '',
  active_skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_skill_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id text not null,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, skill_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  mode text not null check (mode in ('single', 'parallel', 'debate', 'router')),
  input text not null,
  selected_provider text,
  status text not null default 'running' check (status in ('running', 'completed', 'failed')),
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.task_outputs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  model text not null,
  content text,
  error text,
  latency_ms integer,
  created_at timestamptz not null default now()
);

create table if not exists public.task_logs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  level text not null default 'info',
  message text not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists api_keys_updated_at on public.api_keys;
create trigger api_keys_updated_at before update on public.api_keys
for each row execute function public.set_updated_at();

drop trigger if exists agents_updated_at on public.agents;
create trigger agents_updated_at before update on public.agents
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.api_keys enable row level security;
alter table public.agents enable row level security;
alter table public.user_skill_settings enable row level security;
alter table public.tasks enable row level security;
alter table public.task_outputs enable row level security;
alter table public.task_logs enable row level security;

create policy "Users can read own profile" on public.profiles
for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users own api keys" on public.api_keys
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users own agents" on public.agents
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users own skill settings" on public.user_skill_settings
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users own tasks" on public.tasks
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users own outputs" on public.task_outputs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users own logs" on public.task_logs
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
