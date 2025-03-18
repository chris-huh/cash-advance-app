CREATE OR REPLACE FUNCTION public.lock_row(user_id UUID) 
RETURNS VOID AS $$
BEGIN
  -- Attempt to obtain a lock on the user row
  PERFORM 1 FROM users 
  WHERE id = user_id 
  FOR UPDATE NOWAIT;
END;
$$ LANGUAGE plpgsql;