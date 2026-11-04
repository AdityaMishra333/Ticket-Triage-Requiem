import { useState } from "react";

// Per-field error state for a form, driven by a { fieldName: validator } map from validation.js.
export function useFieldErrors(validators) {
  const [errors, setErrors] = useState({});

  const checkField = (name, values) => {
    setErrors((previous) => ({ ...previous, [name]: validators[name](values[name], values) }));
  };

  // While typing: only re-check a field already showing an error, so it clears as soon as it is fixed
  const recheckField = (name, values) => {
    if (errors[name]) checkField(name, values);
  };

  // On submit: show every error, focus the first invalid field, and return whether the form is valid
  const checkAll = (values) => {
    const next = Object.fromEntries(
      Object.keys(validators).map((name) => [name, validators[name](values[name], values)])
    );
    setErrors(next);
    const firstInvalid = Object.keys(next).find((name) => next[name]);
    if (firstInvalid) document.getElementsByName(firstInvalid)[0]?.focus();
    return !firstInvalid;
  };

  const clearErrors = () => setErrors({});

  // Props for an input. Empty fields are skipped on blur (they are reported on submit), so tabbing
  // through or clicking a link does not raise errors on a form the user has not filled in yet.
  const fieldProps = (name, values) => ({
    onBlur: () => {
      if (values[name] || errors[name]) checkField(name, values);
    },
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined
  });

  return { errors, recheckField, checkAll, clearErrors, fieldProps };
}
