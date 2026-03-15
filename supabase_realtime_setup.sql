-- Supabase Realtime setup for Bug Auction Arena
-- IMPORTANT:
-- - You do NOT need to create public tables in Supabase for this project.
-- - MongoDB remains your source of truth.
-- - Supabase is used only as a realtime event bus (broadcast channels).
-- - Your channel/topic format is: room-<ROOM_CODE> (example: room-ARENA-1234).

do $$
begin
	if to_regclass('realtime.messages') is null then
		raise notice 'realtime.messages not found. Enable Realtime in Supabase project settings, then run this script again.';
		return;
	end if;

	-- Ensure RLS is enabled on realtime messages.
	execute 'alter table realtime.messages enable row level security';

	-- Cleanup so script is idempotent.
	execute 'drop policy if exists "Allow receive room broadcasts" on realtime.messages';
	execute 'drop policy if exists "Allow send room broadcasts" on realtime.messages';

	-- Allow clients to receive broadcasts for all room-* channels.
	execute '
		create policy "Allow receive room broadcasts"
		on realtime.messages
		for select
		to anon, authenticated
		using (realtime.topic() like ''room-%'')
	';

	-- Allow clients to send broadcasts for all room-* channels.
	execute '
		create policy "Allow send room broadcasts"
		on realtime.messages
		for insert
		to anon, authenticated
		with check (realtime.topic() like ''room-%'')
	';

	raise notice 'Realtime broadcast policies created for topic pattern room-%%.';
end $$;

-- Supports all required events on the same room topic:
-- bugShown, bugAllotted, roomStatusChanged, rebidStarted, rebidPoolUpdated,
-- solutionSubmitted, submissionScored, powerCardShown, powerCardAllotted.

-- Optional hardening:
-- Replace "to anon, authenticated" with "to authenticated" to block anonymous clients.
