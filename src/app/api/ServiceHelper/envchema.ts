import * as yup from 'yup';


const envSchema = yup.object({
    NEXT_PUBLIC_API_URL: yup.string().url().required("NEXT_PUBLIC_API_URL is missing or invalid"),
    NEXT_PUBLIC_API_KEY: yup.string().required("NEXT_PUBLIC_API_KEY is required"),
    NEXT_PUBLIC_API_N8N_URL: yup.string().url().required("NEXT_PUBLIC_API_N8N_URL is missing or invalid"),
});

const getEnv = () => {
    try {
        return envSchema.validateSync({
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
            NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
            NEXT_PUBLIC_API_N8N_URL: process.env.NEXT_PUBLIC_API_N8N_URL,
        });
    } catch (err: any) {
        return {
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
            NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY || '',
            NEXT_PUBLIC_API_N8N_URL: process.env.NEXT_PUBLIC_API_N8N_URL || '',
        };
    }
};

export default getEnv;

