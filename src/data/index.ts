import units from "./units.json";
import garrisons from "./garrisons.json";
import sources from "./sources.json";
import relations from "./relations.json";
import type { Dataset } from "../features/military-organization/types";
// JSON is checked by validate-data and regression tests before each release.
export const dataset = {
  units,
  garrisons,
  sources,
  relations,
} as unknown as Dataset;
