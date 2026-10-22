export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidName = (name) => {
        return typeof name === "string"
        && /^\p{L}[\p{L}\s.'-]*$/u.test(name.trim());
};

export const isValidPassword = (password) => {
    return password.length >= 6;
};

export const validateLogin = (email, password) => {
    const errors = {};

    if (!email.trim()) {
        errors.email = "Email is required.";
    } else if (!isValidEmail(email.trim())) {
        errors.email = "Enter a valid email address.";
    }

    if (!password) {
        errors.password = "Password is required.";
    } else if (!isValidPassword(password)) {
        errors.password = "Password must be at least 6 characters.";
    }

    return errors;
};
