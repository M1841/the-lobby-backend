// Third-Party Modules
import { CorsOptions } from "cors";

// Internal Modules
import allowedOrigins from "../config/allowedOrigins";

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        // allow or deny requests based on their origin
        if (allowedOrigins.indexOf(origin as string) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error("Origin not allowed"));
        }
    },
    optionsSuccessStatus: 200,
};

export default corsOptions;
