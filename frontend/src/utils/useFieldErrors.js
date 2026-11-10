import { useState } from "react";

export function useFieldErrors(validators) {
  const [errors, setErrors] = useState({});

  const checkField = (name, values) => {
    setErrors((previous) => ({ ...previous, [name]: validators[name](values[name], values) }));
  };

  const recheckField = (name, values) => {
    if (errors[name]) checkField(name, values);
  };

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

  const fieldProps = (name, values) => ({
    onBlur: () => {
      if (values[name] || errors[name]) checkField(name, values);
    },
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined
  });

  return { errors, recheckField, checkAll, clearErrors, fieldProps };
}
