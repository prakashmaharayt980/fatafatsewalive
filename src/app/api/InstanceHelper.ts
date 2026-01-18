// src/services/api.ts (same file)

type ContentType =
    | "application/json"
    | "multipart/form-data"
    | "application/x-www-form-urlencoded"
    | string;

export const withContentType = (contentType?: ContentType) => {
    if (!contentType) return {};

    return {
        headers: {
            "Content-Type": contentType,
        },
    };
};
