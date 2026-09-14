CREATE INDEX medicines_user_id_idx ON public.medicines (user_id);
CREATE INDEX medicine_logs_user_id_idx ON public.medicine_logs (user_id);
CREATE INDEX medicine_logs_medicine_id_idx ON public.medicine_logs (medicine_id);

DROP POLICY "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id);

DROP POLICY "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY "Users manage own medicines" ON public.medicines;
CREATE POLICY "Users manage own medicines" ON public.medicines
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY "Users manage own logs" ON public.medicine_logs;
CREATE POLICY "Users manage own logs" ON public.medicine_logs
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
