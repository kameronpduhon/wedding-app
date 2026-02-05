-- Wedding Vendor Coordinator - Initial Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- WEDDINGS
-- ============================================
create table public.weddings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  partner1_name text not null,
  partner2_name text,
  wedding_date date,
  venue_name text,
  venue_address text,
  budget numeric(10,2),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.weddings enable row level security;

-- Wedding policies
create policy "Users can view own weddings" 
  on public.weddings for select 
  using (auth.uid() = user_id);

create policy "Users can create weddings" 
  on public.weddings for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own weddings" 
  on public.weddings for update 
  using (auth.uid() = user_id);

create policy "Users can delete own weddings" 
  on public.weddings for delete 
  using (auth.uid() = user_id);

-- ============================================
-- VENDORS
-- ============================================
create type vendor_category as enum (
  'photographer',
  'videographer', 
  'caterer',
  'florist',
  'dj',
  'band',
  'cake',
  'venue',
  'planner',
  'officiant',
  'hair_makeup',
  'dress',
  'suit',
  'transportation',
  'rentals',
  'invitations',
  'other'
);

create table public.vendors (
  id uuid default uuid_generate_v4() primary key,
  wedding_id uuid references public.weddings(id) on delete cascade not null,
  name text not null,
  category vendor_category not null default 'other',
  contact_name text,
  email text,
  phone text,
  notes text,
  total_cost numeric(10,2),
  amount_paid numeric(10,2) default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.vendors enable row level security;

-- Vendor policies (user can access vendors for their weddings)
create policy "Users can view own vendors" 
  on public.vendors for select 
  using (
    wedding_id in (
      select id from public.weddings where user_id = auth.uid()
    )
  );

create policy "Users can create vendors" 
  on public.vendors for insert 
  with check (
    wedding_id in (
      select id from public.weddings where user_id = auth.uid()
    )
  );

create policy "Users can update own vendors" 
  on public.vendors for update 
  using (
    wedding_id in (
      select id from public.weddings where user_id = auth.uid()
    )
  );

create policy "Users can delete own vendors" 
  on public.vendors for delete 
  using (
    wedding_id in (
      select id from public.weddings where user_id = auth.uid()
    )
  );

-- ============================================
-- REQUESTS (sent to vendors)
-- ============================================
create table public.requests (
  id uuid default uuid_generate_v4() primary key,
  vendor_id uuid references public.vendors(id) on delete cascade not null,
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  request_invoice boolean default false,
  request_contract boolean default false,
  request_availability boolean default false,
  request_package_details boolean default false,
  request_contact_update boolean default false,
  personal_note text,
  status text default 'pending' check (status in ('pending', 'viewed', 'completed')),
  sent_at timestamptz,
  viewed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.requests enable row level security;

-- Request policies
create policy "Users can view own requests" 
  on public.requests for select 
  using (
    vendor_id in (
      select v.id from public.vendors v
      join public.weddings w on v.wedding_id = w.id
      where w.user_id = auth.uid()
    )
  );

create policy "Users can create requests" 
  on public.requests for insert 
  with check (
    vendor_id in (
      select v.id from public.vendors v
      join public.weddings w on v.wedding_id = w.id
      where w.user_id = auth.uid()
    )
  );

create policy "Users can update own requests" 
  on public.requests for update 
  using (
    vendor_id in (
      select v.id from public.vendors v
      join public.weddings w on v.wedding_id = w.id
      where w.user_id = auth.uid()
    )
  );

-- Public access for vendors responding via token
create policy "Anyone can view request by token" 
  on public.requests for select 
  using (true);

create policy "Anyone can update request by token" 
  on public.requests for update 
  using (true);

-- ============================================
-- RESPONSES (from vendors)
-- ============================================
create table public.responses (
  id uuid default uuid_generate_v4() primary key,
  request_id uuid references public.requests(id) on delete cascade not null,
  vendor_note text,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.responses enable row level security;

-- Response policies
create policy "Users can view responses to their requests" 
  on public.responses for select 
  using (
    request_id in (
      select r.id from public.requests r
      join public.vendors v on r.vendor_id = v.id
      join public.weddings w on v.wedding_id = w.id
      where w.user_id = auth.uid()
    )
  );

-- Anyone can create a response (vendors responding)
create policy "Anyone can create response" 
  on public.responses for insert 
  with check (true);

-- ============================================
-- FILES (uploaded by vendors)
-- ============================================
create type file_type as enum ('invoice', 'contract', 'other');

create table public.files (
  id uuid default uuid_generate_v4() primary key,
  response_id uuid references public.responses(id) on delete cascade not null,
  file_type file_type not null default 'other',
  file_name text not null,
  file_path text not null,
  file_size integer,
  mime_type text,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.files enable row level security;

-- File policies
create policy "Users can view files from their responses" 
  on public.files for select 
  using (
    response_id in (
      select resp.id from public.responses resp
      join public.requests req on resp.request_id = req.id
      join public.vendors v on req.vendor_id = v.id
      join public.weddings w on v.wedding_id = w.id
      where w.user_id = auth.uid()
    )
  );

-- Anyone can upload files (vendors responding)
create policy "Anyone can create file" 
  on public.files for insert 
  with check (true);

-- ============================================
-- STORAGE BUCKET
-- ============================================
-- Run this separately in Supabase Dashboard > Storage:
-- Create a bucket called "vendor-files" with public access disabled

-- ============================================
-- INDEXES for performance
-- ============================================
create index idx_weddings_user_id on public.weddings(user_id);
create index idx_vendors_wedding_id on public.vendors(wedding_id);
create index idx_requests_vendor_id on public.requests(vendor_id);
create index idx_requests_token on public.requests(token);
create index idx_responses_request_id on public.responses(request_id);
create index idx_files_response_id on public.files(response_id);
