// Third-Party Modules
import express from "express";
const router = express.Router();

// Internal Modules
import { readSearchResults } from "../../controllers/search";

router.route("/:query").get(readSearchResults);

export default router;
