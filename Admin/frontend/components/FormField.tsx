/** Label + input/select/textarea (passed as children) + optional helper text + error message, styled consistently. */
export default function FormField({
  label,
  htmlFor,
  help,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  help?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-field">
      <label htmlFor={htmlFor}>
        {label}
        {required ? " *" : ""}
      </label>
      {children}
      {help && <span className="admin-field-help">{help}</span>}
      {error && <span className="admin-field-error">{error}</span>}
    </div>
  );
}
