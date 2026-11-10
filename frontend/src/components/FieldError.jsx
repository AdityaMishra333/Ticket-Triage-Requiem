function FieldError({ name, message }) {
  if (!message) return null;
  return <p id={`${name}-error`} className="field-error" role="alert">{message}</p>;
}

export default FieldError;
