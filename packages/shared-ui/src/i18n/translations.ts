// Translation keys interface for type safety
export interface TranslationKeys {
    // Common/Shared translations
    common: {
        // Navigation
        home: string;
        dashboard: string;
        profile: string;
        settings: string;
        logout: string;
        login: string;
        signup: string;

        // Actions
        save: string;
        cancel: string;
        delete: string;
        edit: string;
        create: string;
        update: string;
        submit: string;
        back: string;
        next: string;
        previous: string;
        continue: string;

        // Status
        loading: string;
        error: string;
        success: string;
        warning: string;
        info: string;

        // Time
        today: string;
        yesterday: string;
        tomorrow: string;
        week: string;
        month: string;
        year: string;
    };

    // Authentication
    auth: {
        welcomeBack: string;
        signInAccount: string;
        signUpAccount: string;
        createAccount: string;
        email: string;
        password: string;
        confirmPassword: string;
        firstName: string;
        lastName: string;
        rememberMe: string;
        forgotPassword: string;
        resetPassword: string;
        signInWith: string;
        signUpWith: string;
        agreeTerms: string;
        termsOfService: string;
        privacyPolicy: string;
        alreadyHaveAccount: string;
        noAccount: string;
        invalidCredentials: string;
        passwordMismatch: string;
        emailRequired: string;
        passwordRequired: string;
        signInSuccess: string;
        signUpSuccess: string;
        logoutSuccess: string;
    };

    // Landing page
    landing: {
        hero: {
            welcome: string;
            subtitle: string;
            description: string;
            getStarted: string;
            learnMore: string;
        };
        features: {
            title: string;
            description: string;
            feature1: {
                title: string;
                description: string;
            };
            feature2: {
                title: string;
                description: string;
            };
            feature3: {
                title: string;
                description: string;
            };
        };
        cta: {
            title: string;
            description: string;
            button: string;
        };
    };

    // Layout
    layout: {
        header: {
            menu: string;
            search: string;
            notifications: string;
            userMenu: string;
        };
        footer: {
            allRightsReserved: string;
            aboutUs: string;
            contact: string;
            support: string;
            documentation: string;
        };
        sidebar: {
            navigation: string;
            collapse: string;
            expand: string;
        };
    };

    // App-specific sections (will be extended per app)
    app: {
        name: string;
        description: string;
        title: string;
        subtitle: string;
    };

    // Errors
    errors: {
        general: string;
        notFound: string;
        unauthorized: string;
        forbidden: string;
        serverError: string;
        networkError: string;
        validationError: string;
        requiredField: string;
        invalidEmail: string;
        invalidPassword: string;
        passwordTooShort: string;
        passwordsDoNotMatch: string;
    };

    // Validation
    validation: {
        required: string;
        minLength: string;
        maxLength: string;
        email: string;
        url: string;
        number: string;
        positive: string;
        integer: string;
    };
}

// English translations
export const enTranslations: TranslationKeys = {
    common: {
        home: 'Home',
        dashboard: 'Dashboard',
        profile: 'Profile',
        settings: 'Settings',
        logout: 'Logout',
        login: 'Login',
        signup: 'Sign Up',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        update: 'Update',
        submit: 'Submit',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        continue: 'Continue',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
        today: 'Today',
        yesterday: 'Yesterday',
        tomorrow: 'Tomorrow',
        week: 'Week',
        month: 'Month',
        year: 'Year',
    },
    auth: {
        welcomeBack: 'Welcome back',
        signInAccount: 'Sign in to your account',
        signUpAccount: 'Sign up for an account',
        createAccount: 'Create Account',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        firstName: 'First Name',
        lastName: 'Last Name',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot password?',
        resetPassword: 'Reset Password',
        signInWith: 'Or sign in with',
        signUpWith: 'Or sign up with',
        agreeTerms: 'I agree to the',
        termsOfService: 'Terms of Service',
        privacyPolicy: 'Privacy Policy',
        alreadyHaveAccount: 'Already have an account?',
        noAccount: "Don't have an account?",
        invalidCredentials: 'Invalid email or password',
        passwordMismatch: 'Passwords do not match',
        emailRequired: 'Email is required',
        passwordRequired: 'Password is required',
        signInSuccess: 'Successfully signed in',
        signUpSuccess: 'Account created successfully',
        logoutSuccess: 'Successfully logged out',
    },
    landing: {
        hero: {
            welcome: 'Welcome to {{appName}}',
            subtitle: 'The Future of {{industry}}',
            description: 'Discover powerful AI-driven solutions that transform the way you work and create.',
            getStarted: 'Get Started',
            learnMore: 'Learn More',
        },
        features: {
            title: 'Powerful Features',
            description: 'Everything you need to succeed with {{appName}}',
            feature1: {
                title: 'AI-Powered',
                description: 'Leverage cutting-edge artificial intelligence to enhance your productivity.',
            },
            feature2: {
                title: 'User-Friendly',
                description: 'Intuitive interface designed for both beginners and professionals.',
            },
            feature3: {
                title: 'Secure & Reliable',
                description: 'Your data is protected with enterprise-grade security measures.',
            },
        },
        cta: {
            title: 'Ready to get started?',
            description: 'Join thousands of users who trust {{appName}} for their {{industry}} needs.',
            button: 'Start Free Trial',
        },
    },
    layout: {
        header: {
            menu: 'Menu',
            search: 'Search',
            notifications: 'Notifications',
            userMenu: 'User Menu',
        },
        footer: {
            allRightsReserved: 'All rights reserved',
            aboutUs: 'About Us',
            contact: 'Contact',
            support: 'Support',
            documentation: 'Documentation',
        },
        sidebar: {
            navigation: 'Navigation',
            collapse: 'Collapse',
            expand: 'Expand',
        },
    },
    app: {
        name: '{{appName}}',
        description: 'AI-powered {{industry}} solution',
        title: '{{appName}} Dashboard',
        subtitle: 'Manage your {{industry}} workflow',
    },
    errors: {
        general: 'Something went wrong. Please try again.',
        notFound: 'Page not found',
        unauthorized: 'Unauthorized access',
        forbidden: 'Access forbidden',
        serverError: 'Internal server error',
        networkError: 'Network connection error',
        validationError: 'Validation error',
        requiredField: 'This field is required',
        invalidEmail: 'Invalid email format',
        invalidPassword: 'Invalid password',
        passwordTooShort: 'Password must be at least 8 characters',
        passwordsDoNotMatch: 'Passwords do not match',
    },
    validation: {
        required: 'This field is required',
        minLength: 'Minimum {{min}} characters required',
        maxLength: 'Maximum {{max}} characters allowed',
        email: 'Invalid email format',
        url: 'Invalid URL format',
        number: 'Must be a valid number',
        positive: 'Must be a positive number',
        integer: 'Must be a whole number',
    },
};

// Romanian translations
export const roTranslations: TranslationKeys = {
    common: {
        home: 'Acasă',
        dashboard: 'Panou de Control',
        profile: 'Profil',
        settings: 'Setări',
        logout: 'Deconectare',
        login: 'Conectare',
        signup: 'Înregistrare',
        save: 'Salvează',
        cancel: 'Anulează',
        delete: 'Șterge',
        edit: 'Editează',
        create: 'Creează',
        update: 'Actualizează',
        submit: 'Trimite',
        back: 'Înapoi',
        next: 'Următorul',
        previous: 'Anterior',
        continue: 'Continuă',
        loading: 'Se încarcă...',
        error: 'Eroare',
        success: 'Succes',
        warning: 'Avertisment',
        info: 'Informație',
        today: 'Astăzi',
        yesterday: 'Ieri',
        tomorrow: 'Mâine',
        week: 'Săptămână',
        month: 'Lună',
        year: 'An',
    },
    auth: {
        welcomeBack: 'Bine ai revenit',
        signInAccount: 'Conectează-te în contul tău',
        signUpAccount: 'Înregistrează-te pentru un cont',
        createAccount: 'Creează Cont',
        email: 'Email',
        password: 'Parolă',
        confirmPassword: 'Confirmă Parola',
        firstName: 'Prenume',
        lastName: 'Nume',
        rememberMe: 'Ține-mă minte',
        forgotPassword: 'Ai uitat parola?',
        resetPassword: 'Resetează Parola',
        signInWith: 'Sau conectează-te cu',
        signUpWith: 'Sau înregistrează-te cu',
        agreeTerms: 'Sunt de acord cu',
        termsOfService: 'Termenii și Condițiile',
        privacyPolicy: 'Politica de Confidențialitate',
        alreadyHaveAccount: 'Ai deja un cont?',
        noAccount: 'Nu ai un cont?',
        invalidCredentials: 'Email sau parolă invalidă',
        passwordMismatch: 'Parolele nu se potrivesc',
        emailRequired: 'Email-ul este obligatoriu',
        passwordRequired: 'Parola este obligatorie',
        signInSuccess: 'Conectare reușită',
        signUpSuccess: 'Cont creat cu succes',
        logoutSuccess: 'Deconectare reușită',
    },
    landing: {
        hero: {
            welcome: 'Bine ai venit la {{appName}}',
            subtitle: 'Viitorul {{industry}}',
            description: 'Descoperă soluții puternice bazate pe AI care transformă modul în care lucrezi și creezi.',
            getStarted: 'Începe Acum',
            learnMore: 'Află Mai Multe',
        },
        features: {
            title: 'Funcționalități Puternice',
            description: 'Tot ce ai nevoie pentru a reuși cu {{appName}}',
            feature1: {
                title: 'Alimentat de AI',
                description: 'Folosește inteligența artificială de vârf pentru a-ți îmbunătăți productivitatea.',
            },
            feature2: {
                title: 'Ușor de Folosit',
                description: 'Interfață intuitivă proiectată atât pentru începători, cât și pentru profesioniști.',
            },
            feature3: {
                title: 'Sigur și Fiabil',
                description: 'Datele tale sunt protejate cu măsuri de securitate de nivel enterprise.',
            },
        },
        cta: {
            title: 'Gata să începi?',
            description: 'Alătură-te miilor de utilizatori care au încredere în {{appName}} pentru nevoile lor de {{industry}}.',
            button: 'Începe Perioada Gratuită',
        },
    },
    layout: {
        header: {
            menu: 'Meniu',
            search: 'Căutare',
            notifications: 'Notificări',
            userMenu: 'Meniu Utilizator',
        },
        footer: {
            allRightsReserved: 'Toate drepturile rezervate',
            aboutUs: 'Despre Noi',
            contact: 'Contact',
            support: 'Suport',
            documentation: 'Documentație',
        },
        sidebar: {
            navigation: 'Navigare',
            collapse: 'Restrânge',
            expand: 'Extinde',
        },
    },
    app: {
        name: '{{appName}}',
        description: 'Soluție {{industry}} alimentată de AI',
        title: 'Panou {{appName}}',
        subtitle: 'Gestionează fluxul de lucru {{industry}}',
    },
    errors: {
        general: 'Ceva nu a mers bine. Te rugăm să încerci din nou.',
        notFound: 'Pagina nu a fost găsită',
        unauthorized: 'Acces neautorizat',
        forbidden: 'Acces interzis',
        serverError: 'Eroare internă de server',
        networkError: 'Eroare de conexiune la rețea',
        validationError: 'Eroare de validare',
        requiredField: 'Acest câmp este obligatoriu',
        invalidEmail: 'Format email invalid',
        invalidPassword: 'Parolă invalidă',
        passwordTooShort: 'Parola trebuie să aibă cel puțin 8 caractere',
        passwordsDoNotMatch: 'Parolele nu se potrivesc',
    },
    validation: {
        required: 'Acest câmp este obligatoriu',
        minLength: 'Minimum {{min}} caractere necesare',
        maxLength: 'Maximum {{max}} caractere permise',
        email: 'Format email invalid',
        url: 'Format URL invalid',
        number: 'Trebuie să fie un număr valid',
        positive: 'Trebuie să fie un număr pozitiv',
        integer: 'Trebuie să fie un număr întreg',
    },
};

// Combined translations object for i18next
export const translations = {
    en: {
        translation: enTranslations,
    },
    ro: {
        translation: roTranslations,
    },
};
