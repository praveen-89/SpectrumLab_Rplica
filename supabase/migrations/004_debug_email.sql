-- Superseded: the debug helpers served their purpose (found that an
-- earlier UPDATE hadn't actually persisted) and are dropped here so
-- they don't linger as unused functions in the schema.
drop function if exists debug_jwt_email();
drop function if exists debug_admin_rows();
