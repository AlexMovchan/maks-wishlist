-- =====================================================================
--  Wishlist — Supabase database schema
--
--  How to apply: Supabase → SQL Editor → New query → paste the whole file → Run.
--  Safe to re-run: tables and data are left intact,
--  functions and policies are updated.
--
--  Security model:
--   * Sign-up and sign-in use standard Supabase Auth. Guests only enter a name;
--     the site derives a synthetic email from it on the reserved `.invalid` TLD
--     (see src/lib/identity.ts), so "Confirm email" must stay OFF.
--   * Tables live in the `private` schema, which the public API does not expose.
--     They cannot be read or modified directly from the browser.
--   * Only `public.*` functions are exposed. Each one checks
--     who is calling (auth.uid()) and whether they are allowed to.
--   * The invite code is checked by a trigger on user creation,
--     so it cannot be bypassed by calling the API directly.
-- =====================================================================

create schema if not exists private;

-- ---------------------------------------------------------------------
--  Tables
-- ---------------------------------------------------------------------

create table if not exists private.profiles (
  id         uuid primary key references auth.users on delete cascade,
  nickname   text not null check (nickname ~ '^[[:alnum:]_. -]{2,24}$'),
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists profiles_nickname_lower_key on private.profiles (lower(nickname));

create table if not exists private.gifts (
  id         uuid primary key default gen_random_uuid(),
  title      text not null check (char_length(title) between 1 and 200),
  url        text check (url ~ '^https?://' and char_length(url) <= 2000),
  image_url  text check (image_url ~ '^https://' and char_length(image_url) <= 2000),
  price      numeric(12, 2) check (price >= 0),
  note       text check (char_length(note) <= 1000),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- gift_id is the primary key: a gift can never be reserved twice,
-- even if two people click the button at the same moment.
create table if not exists private.reservations (
  gift_id    uuid primary key references private.gifts on delete cascade,
  user_id    uuid not null references private.profiles on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists reservations_user_idx on private.reservations (user_id);

create table if not exists private.settings (
  id               int primary key default 1 check (id = 1),
  title            text not null default 'Вішліст',
  subtitle         text not null default '',
  invite_code      text not null,
  max_reservations int not null default 3 check (max_reservations between 1 and 100)
);
-- The initial invite code is random; change it in the admin panel.
insert into private.settings (id, invite_code)
values (1, encode(extensions.gen_random_bytes(5), 'hex'))
on conflict (id) do nothing;

alter table private.profiles     enable row level security;
alter table private.gifts        enable row level security;
alter table private.reservations enable row level security;
alter table private.settings     enable row level security;

-- ---------------------------------------------------------------------
--  Helpers
-- ---------------------------------------------------------------------

-- Public because Storage policies need it. Only reveals "am I an admin".
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select is_admin from private.profiles where id = auth.uid()), false)
$$;

create or replace function private.require_user()
returns uuid
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not exists (select 1 from private.profiles where id = auth.uid()) then
    raise exception 'not_authenticated';
  end if;
  return auth.uid();
end $$;

create or replace function private.require_admin()
returns uuid
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  return auth.uid();
end $$;

-- Returns an error code, or null if everything is fine.
create or replace function private.signup_error(p_invite text, p_nickname text)
returns text
language plpgsql stable security definer set search_path = ''
as $$
begin
  if lower(btrim(coalesce(p_invite, ''))) <> (select lower(invite_code) from private.settings where id = 1) then
    return 'invite_invalid';
  end if;
  if btrim(coalesce(p_nickname, '')) !~ '^[[:alnum:]_. -]{2,24}$' then
    return 'nickname_invalid';
  end if;
  if exists (select 1 from private.profiles where lower(nickname) = lower(btrim(p_nickname))) then
    return 'nickname_taken';
  end if;
  return null;
end $$;

-- ---------------------------------------------------------------------
--  Sign-up: triggers on auth.users
-- ---------------------------------------------------------------------

-- Before insert: validate the invite code and nickname, strip the code from metadata.
create or replace function private.before_user_created()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_error text := private.signup_error(
    new.raw_user_meta_data ->> 'invite_code',
    new.raw_user_meta_data ->> 'nickname'
  );
begin
  if v_error is not null then
    raise exception '%', v_error;
  end if;
  new.raw_user_meta_data := new.raw_user_meta_data - 'invite_code';
  return new;
end $$;

-- After insert: create the profile.
create or replace function private.after_user_created()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into private.profiles (id, nickname)
  values (new.id, btrim(new.raw_user_meta_data ->> 'nickname'));
  return new;
end $$;

drop trigger if exists wishlist_before_user_created on auth.users;
create trigger wishlist_before_user_created
  before insert on auth.users
  for each row execute function private.before_user_created();

drop trigger if exists wishlist_after_user_created on auth.users;
create trigger wishlist_after_user_created
  after insert on auth.users
  for each row execute function private.after_user_created();

-- The site calls this before signUp to show a friendly error message.
-- The real check still happens in the trigger above.
create or replace function public.check_signup(p_invite text, p_nickname text)
returns text
language sql stable security definer set search_path = ''
as $$
  select private.signup_error(p_invite, p_nickname)
$$;

-- ---------------------------------------------------------------------
--  Public functions: profile, gift list and reservations
-- ---------------------------------------------------------------------

create or replace function public.me()
returns json
language sql stable security definer set search_path = ''
as $$
  select json_build_object('nickname', nickname, 'is_admin', is_admin)
  from private.profiles where id = auth.uid()
$$;

create or replace function public.site_info()
returns json
language sql stable security definer set search_path = ''
as $$
  select json_build_object('title', title, 'subtitle', subtitle, 'max_reservations', max_reservations)
  from private.settings where id = 1
$$;

-- Guests only see "reserved / not" and "mine / not".
-- Who reserved it (reserved_by) is visible to the admin only.
create or replace function public.list_gifts()
returns json
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_uid   uuid    := auth.uid();
  v_admin boolean := public.is_admin();
begin
  return coalesce((
    select json_agg(json_build_object(
      'id',          g.id,
      'title',       g.title,
      'url',         g.url,
      'image_url',   g.image_url,
      'price',       g.price,
      'note',        g.note,
      'sort_order',  g.sort_order,
      'is_reserved', r.gift_id is not null,
      'is_mine',     coalesce(r.user_id = v_uid, false),
      'reserved_by', case when v_admin then p.nickname end
    ) order by g.sort_order, g.created_at)
    from private.gifts g
    left join private.reservations r on r.gift_id = g.id
    left join private.profiles p on p.id = r.user_id
  ), '[]'::json);
end $$;

create or replace function public.reserve(p_gift_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := private.require_user();
  v_max int;
begin
  if not exists (select 1 from private.gifts where id = p_gift_id) then
    raise exception 'gift_not_found';
  end if;

  -- lock the profile row so concurrent requests can't bypass the limit
  perform 1 from private.profiles where id = v_uid for update;
  select max_reservations into v_max from private.settings where id = 1;
  if not public.is_admin()
     and (select count(*) from private.reservations where user_id = v_uid) >= v_max then
    raise exception 'limit_reached';
  end if;

  begin
    insert into private.reservations (gift_id, user_id) values (p_gift_id, v_uid);
  exception when unique_violation then
    raise exception 'already_reserved';
  end;
end $$;

-- A guest can cancel their own reservation; the admin can cancel any.
create or replace function public.unreserve(p_gift_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := private.require_user();
begin
  delete from private.reservations
  where gift_id = p_gift_id
    and (user_id = v_uid or public.is_admin());
  if not found then
    raise exception 'not_your_reservation';
  end if;
end $$;

-- ---------------------------------------------------------------------
--  Public functions: admin
-- ---------------------------------------------------------------------

create or replace function public.admin_save_gift(
  p_id uuid,
  p_title text,
  p_url text,
  p_image_url text,
  p_price numeric,
  p_note text,
  p_sort_order int
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
begin
  perform private.require_admin();

  if p_id is null then
    insert into private.gifts (title, url, image_url, price, note, sort_order)
    values (btrim(p_title), nullif(btrim(p_url), ''), nullif(btrim(p_image_url), ''), p_price,
            nullif(btrim(p_note), ''), coalesce(p_sort_order, 0))
    returning id into v_id;
  else
    update private.gifts set
      title      = btrim(p_title),
      url        = nullif(btrim(p_url), ''),
      image_url  = nullif(btrim(p_image_url), ''),
      price      = p_price,
      note       = nullif(btrim(p_note), ''),
      sort_order = coalesce(p_sort_order, 0)
    where id = p_id
    returning id into v_id;
    if v_id is null then
      raise exception 'gift_not_found';
    end if;
  end if;

  return v_id;
end $$;

create or replace function public.admin_delete_gift(p_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.require_admin();
  delete from private.gifts where id = p_id;
end $$;

create or replace function public.admin_get_settings()
returns json
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.require_admin();
  return (
    select json_build_object(
      'title', title, 'subtitle', subtitle,
      'invite_code', invite_code, 'max_reservations', max_reservations
    )
    from private.settings where id = 1
  );
end $$;

create or replace function public.admin_update_settings(
  p_title text,
  p_subtitle text,
  p_invite_code text,
  p_max_reservations int
)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.require_admin();
  if char_length(btrim(coalesce(p_invite_code, ''))) < 6 then
    raise exception 'invite_too_short';
  end if;
  update private.settings set
    title            = coalesce(nullif(btrim(p_title), ''), 'Вішліст'),
    subtitle         = coalesce(btrim(p_subtitle), ''),
    invite_code      = btrim(p_invite_code),
    max_reservations = p_max_reservations
  where id = 1;
end $$;

create or replace function public.admin_list_guests()
returns json
language plpgsql stable security definer set search_path = ''
as $$
begin
  perform private.require_admin();
  return coalesce((
    select json_agg(json_build_object(
      'id',           p.id,
      'nickname',     p.nickname,
      'is_admin',     p.is_admin,
      'created_at',   p.created_at,
      'reservations', (select count(*) from private.reservations r where r.user_id = p.id)
    ) order by p.created_at)
    from private.profiles p
  ), '[]'::json);
end $$;

-- Deleting a guest removes both their account and their reservations.
create or replace function public.admin_delete_guest(p_user_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if private.require_admin() = p_user_id then
    raise exception 'cannot_delete_self';
  end if;
  delete from auth.users where id = p_user_id;
end $$;

-- ---------------------------------------------------------------------
--  Storage: gift images
--  Anyone can read (public bucket); only the admin can upload.
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gift-images', 'gift-images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "gift images: admin insert" on storage.objects;
create policy "gift images: admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'gift-images' and public.is_admin());

drop policy if exists "gift images: admin update" on storage.objects;
create policy "gift images: admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'gift-images' and public.is_admin());

drop policy if exists "gift images: admin delete" on storage.objects;
create policy "gift images: admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'gift-images' and public.is_admin());

-- ---------------------------------------------------------------------
--  Permissions
-- ---------------------------------------------------------------------

revoke all on schema private from public, anon, authenticated;
revoke all on all tables in schema private from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;

-- Available without signing in
revoke all on function
  public.check_signup(text, text),
  public.site_info(),
  public.list_gifts(),
  public.is_admin(),
  public.me()
from public;
grant execute on function
  public.check_signup(text, text),
  public.site_info(),
  public.list_gifts(),
  public.is_admin(),
  public.me()
to anon, authenticated;

-- Requires signing in
revoke all on function
  public.reserve(uuid),
  public.unreserve(uuid),
  public.admin_save_gift(uuid, text, text, text, numeric, text, int),
  public.admin_delete_gift(uuid),
  public.admin_get_settings(),
  public.admin_update_settings(text, text, text, int),
  public.admin_list_guests(),
  public.admin_delete_guest(uuid)
from public, anon;
grant execute on function
  public.reserve(uuid),
  public.unreserve(uuid),
  public.admin_save_gift(uuid, text, text, text, numeric, text, int),
  public.admin_delete_gift(uuid),
  public.admin_get_settings(),
  public.admin_update_settings(text, text, text, int),
  public.admin_list_guests(),
  public.admin_delete_guest(uuid)
to authenticated;
