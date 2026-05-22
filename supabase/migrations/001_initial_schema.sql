-- BrewLoop initial schema migration

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Shops table
create table shops (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text not null default '#6B3F1A',
  stamps_required int not null default 9,
  reward_description text not null default 'Free coffee of your choice',
  make_webhook_url text,
  staff_pin text not null default '1234',
  created_at timestamp with time zone default now()
);

-- Customers table
create table customers (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  pass_serial text unique,
  created_at timestamp with time zone default now(),
  unique(shop_id, email)
);

-- Stamps table
create table stamps (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id) on delete cascade,
  shop_id uuid not null references shops(id) on delete cascade,
  stamped_at timestamp with time zone default now(),
  stamped_by text not null default 'staff'
);

-- Rewards table
create table rewards (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references customers(id) on delete cascade,
  shop_id uuid not null references shops(id) on delete cascade,
  redeemed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Admin users table (links Supabase auth users to shops)
create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  shop_id uuid references shops(id) on delete cascade,
  role text not null check (role in ('owner', 'staff', 'superadmin'))
);

-- Row Level Security
alter table shops enable row level security;
alter table customers enable row level security;
alter table stamps enable row level security;
alter table rewards enable row level security;
alter table admin_users enable row level security;

-- Shops: admins can read their own shop; superadmins can read all
create policy "Admins can view their shop" on shops
  for select using (
    id in (
      select shop_id from admin_users where id = auth.uid()
    )
    or
    exists (select 1 from admin_users where id = auth.uid() and role = 'superadmin')
  );

create policy "Superadmin can insert shops" on shops
  for insert with check (
    exists (select 1 from admin_users where id = auth.uid() and role = 'superadmin')
  );

create policy "Admins can update their shop" on shops
  for update using (
    id in (select shop_id from admin_users where id = auth.uid() and role in ('owner', 'superadmin'))
    or
    exists (select 1 from admin_users where id = auth.uid() and role = 'superadmin')
  );

-- Customers: admins can manage their shop's customers
create policy "Admins can view their customers" on customers
  for select using (
    shop_id in (select shop_id from admin_users where id = auth.uid())
    or
    exists (select 1 from admin_users where id = auth.uid() and role = 'superadmin')
  );

create policy "Service role can manage customers" on customers
  for all using (true);

-- Stamps: same pattern
create policy "Admins can view stamps" on stamps
  for select using (
    shop_id in (select shop_id from admin_users where id = auth.uid())
    or
    exists (select 1 from admin_users where id = auth.uid() and role = 'superadmin')
  );

-- Rewards: same pattern
create policy "Admins can view rewards" on rewards
  for select using (
    shop_id in (select shop_id from admin_users where id = auth.uid())
    or
    exists (select 1 from admin_users where id = auth.uid() and role = 'superadmin')
  );

-- Indexes for performance
create index idx_customers_shop_id on customers(shop_id);
create index idx_stamps_customer_id on stamps(customer_id);
create index idx_stamps_shop_id on stamps(shop_id);
create index idx_rewards_customer_id on rewards(customer_id);
create index idx_stamps_stamped_at on stamps(stamped_at);

-- Seed a demo shop for development
insert into shops (name, slug, primary_color, stamps_required, reward_description, staff_pin)
values ('The Daily Grind', 'daily-grind', '#6B3F1A', 9, 'Free coffee of your choice', '1234');
