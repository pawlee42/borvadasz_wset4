-- Prevent evaluations from being inserted or updated after results are revealed
CREATE OR REPLACE FUNCTION check_wine_not_revealed()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM wines WHERE id = NEW.wine_id AND results_revealed = true
  ) THEN
    RAISE EXCEPTION 'Az eredmények már felfedésre kerültek, értékelés nem küldhető be.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_block_eval_after_reveal
  BEFORE INSERT OR UPDATE ON evaluations
  FOR EACH ROW
  EXECUTE FUNCTION check_wine_not_revealed();
