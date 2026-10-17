export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidUsername = (username) => {
    return /^[A-Za-z][A-Za-z0-9_]{2,19}$/.test(username);
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