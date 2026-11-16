CREATE OR REPLACE FUNCTION audit_log_immutable_trigger()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog records are strictly immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_log_immutable_update ON "AuditLog";
CREATE TRIGGER trg_audit_log_immutable_update
BEFORE UPDATE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION audit_log_immutable_trigger();

DROP TRIGGER IF EXISTS trg_audit_log_immutable_delete ON "AuditLog";
CREATE TRIGGER trg_audit_log_immutable_delete
BEFORE DELETE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION audit_log_immutable_trigger();
