import { MilitaryOrganization } from "../features/military-organization";
import { dataset } from "../data";
export function App() {
  return <MilitaryOrganization dataset={dataset} />;
}
