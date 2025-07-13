export declare const API_ROUTES: {
    readonly AUTH: "/api/auth";
    readonly USERS: "/api/users";
    readonly WORKSPACES: "/api/workspaces";
    readonly PROJECTS: "/api/projects";
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly INTERNAL_SERVER_ERROR: 500;
};
export declare const VALIDATION_MESSAGES: {
    readonly REQUIRED: "This field is required";
    readonly EMAIL_INVALID: "Please enter a valid email address";
    readonly PASSWORD_MIN_LENGTH: "Password must be at least 8 characters";
    readonly PASSWORD_MISMATCH: "Passwords do not match";
};
export declare const DEFAULT_LIMITS: {
    readonly PAGE_SIZE: 20;
    readonly MAX_PAGE_SIZE: 100;
    readonly MAX_FILE_SIZE: number;
};
//# sourceMappingURL=constants.d.ts.map