-- Run in Supabase SQL Editor. Admins must be manually approved by project owner.
create extension if not exists pgcrypto;
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade,created_at timestamptz not null default now());
create table if not exists public.responses (id uuid primary key default gen_random_uuid(),submission_key uuid not null unique,full_name text not null check(char_length(full_name) between 3 and 100),school text not null,class_name text not null,answers jsonb not null,created_at timestamptz not null default now());
create index if not exists responses_created_idx on public.responses(created_at desc);
create index if not exists responses_school_class_idx on public.responses(school,class_name);
alter table public.admins enable row level security;
alter table public.responses enable row level security;
revoke all on public.admins from anon,authenticated;
revoke all on public.responses from anon,authenticated;
grant select on public.admins to authenticated;
grant select on public.responses to authenticated;
create policy "admins can check own membership" on public.admins for select to authenticated using (user_id=auth.uid());
create policy "approved admins can read responses" on public.responses for select to authenticated using (exists(select 1 from public.admins where user_id=auth.uid()));
-- Public inserts occur ONLY through this constrained RPC. Prevent unrestricted table inserts.
create or replace function public.submit_survey(p_submission_key uuid,p_full_name text,p_school text,p_class_name text,p_answers jsonb,p_other jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid; v_i int; v_values jsonb; v_value text; v_options jsonb := jsonb_build_array(
 jsonb_build_array('1 soatdan kam','1–3 soat','3–5 soat','5 soatdan ko‘p'),
 jsonb_build_array('Dars va ta’lim olish','Ijtimoiy tarmoqlar','Video va filmlar','O‘yinlar','Boshqa'),
 jsonb_build_array('Hech qanday','1 ta','2–3 ta','4 ta yoki undan ko‘p'),
 jsonb_build_array('Telefon','Kitob','Sport yoki sayr','Do‘stlar bilan vaqt o‘tkazish','Boshqa'),
 jsonb_build_array('Har hafta','Oyiga bir yoki ikki marta','Juda kam','Umuman bormayman','Boshqa'),
 jsonb_build_array('Qiziqarli hikoyalar','Do‘stlar yoki tavsiyalar','Maktabdagi kitobxonlik tadbirlari','Kitobxonlik tanlovlari va sovrinlar','Hozircha kitob o‘qishga qiziqmayman','Boshqa')
);
begin
 if length(trim(p_full_name)) not between 3 and 100 or length(trim(p_school)) not between 2 and 120 or p_class_name !~ '^[0-9]{1,2}[- ][A-Za-zА-Яа-яЁё]{1,3}$' or length(p_class_name)>12 then raise exception 'Invalid student data';end if;
 if pg_column_size(p_answers)>12000 or pg_column_size(p_other)>3000 or jsonb_typeof(p_answers)<>'object' or jsonb_typeof(p_other)<>'object' then raise exception 'Invalid answers';end if;
 for v_i in 1..6 loop
  v_values:=p_answers->v_i::text;
  if v_values is null then raise exception 'Missing answer';end if;
  if v_i=6 then
   if jsonb_typeof(v_values)<>'array' or jsonb_array_length(v_values)<1 or jsonb_array_length(v_values)>6 then raise exception 'Invalid multiple choice';end if;
   for v_value in select jsonb_array_elements_text(v_values) loop
    if not ((v_options->(v_i-1)) ? v_value) then raise exception 'Invalid choice';end if;
   end loop;
  else
   if jsonb_typeof(v_values)<>'string' or not ((v_options->(v_i-1)) ? (v_values#>>'{}')) then raise exception 'Invalid choice';end if;
  end if;
  if (v_i in (2,4,5) and v_values#>>'{}'='Boshqa') or (v_i=6 and v_values @> '["Boshqa"]'::jsonb) then
   if length(trim(coalesce(p_other->>v_i::text,'')))<1 or length(p_other->>v_i::text)>300 then raise exception 'Other text required';end if;
  end if;
 end loop;
 for v_i in 7..8 loop
  if jsonb_typeof(p_answers->v_i::text)<>'string' or length(trim(p_answers->>v_i::text)) not between 5 and 1500 then raise exception 'Invalid text answer';end if;
 end loop;
 if p_answers ? 'extra' and length(p_answers->>'extra')>1500 then raise exception 'Invalid extra';end if;
 insert into public.responses(submission_key,full_name,school,class_name,answers)
 values(p_submission_key,trim(p_full_name),trim(p_school),upper(replace(trim(p_class_name),' ','-')),p_answers || jsonb_build_object('_other',p_other))
 on conflict(submission_key) do nothing returning id into v_id;
 if v_id is null then select id into v_id from public.responses where submission_key=p_submission_key;end if;
 return v_id;
end;$$;
revoke all on function public.submit_survey(uuid,text,text,text,jsonb,jsonb) from public;
grant execute on function public.submit_survey(uuid,text,text,text,jsonb,jsonb) to anon,authenticated;
-- After creating a Supabase Auth user, approve them manually:
-- insert into public.admins(user_id) values ('AUTH_USER_UUID_HERE');
