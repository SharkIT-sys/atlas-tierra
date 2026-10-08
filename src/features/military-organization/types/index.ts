export type VerificationStatus = "official" | "secondary" | "pending";
export type UnitStatus =
  "active" | "historical" | "disbanded" | "transformed" | "unknown";
export interface Source {
  id: string;
  publisher: string;
  title: string;
  url: string;
  publicationDate?: string;
  retrievedAt: string;
  sourceType: VerificationStatus;
  notes?: string;
}
export interface ImageAsset {
  id: string;
  type: "shield" | "emblem" | "photo";
  imageUrl?: string;
  localAsset?: string;
  thumbnail?: string;
  sourceUrl: string;
  author?: string;
  license: string;
  licenseUrl?: string;
  attribution: string;
}
export interface Contact {
  type: "phone" | "email";
  value: string;
  sourceId: string;
  label?: string;
}
export interface Evidence {
  sourceIds: string[];
  status: VerificationStatus;
  notes?: string;
}
export interface Unit {
  id: string;
  /** Structural bridges belong to the hierarchy, not to the unit catalogue. */
  nodeKind?: "unit" | "structure" | "organization";
  name: string;
  officialName?: string;
  shortName?: string;
  abbreviation?: string;
  branch: string;
  organizationId: string;
  type: string;
  level?: string;
  parentId: string | null;
  parentRelation?: "organic" | "grouping";
  garrisonId?: string | null;
  mission?: string;
  shortDescription?: string;
  fullDescription?: string;
  specialty?: string;
  shield?: ImageAsset;
  motto?: string;
  patron?: string;
  creationDate?: string;
  history?: string;
  equipment?: string[];
  website?: string;
  phone: string | null;
  contacts: Contact[];
  status: UnitStatus;
  verificationStatus: VerificationStatus;
  validFrom?: string;
  validUntil?: string;
  previousUnitId?: string;
  successorUnitId?: string;
  sources: string[];
  fieldSources: Record<string, Evidence>;
  lastVerified?: string;
  notes?: string;
}
export interface Garrison {
  id: string;
  name: string;
  officialName?: string;
  type?: string;
  address?: string;
  municipality?: string;
  province?: string;
  autonomousCommunity?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  phone: string | null;
  email?: string;
  website?: string;
  sources: string[];
  fieldSources: Record<string, Evidence>;
  lastVerified?: string;
  notes?: string;
}
export interface Relation {
  fromId: string;
  toId: string;
  type:
    | "predecessor"
    | "successor"
    | "sharesGarrisonWith"
    | "historicallyRelatedTo"
    | "supports";
  sources: string[];
}
export interface Dataset {
  units: Unit[];
  garrisons: Garrison[];
  sources: Source[];
  relations: Relation[];
}
export interface Filters {
  branch?: string;
  type?: string;
  specialty?: string;
  province?: string;
  municipality?: string;
  autonomousCommunity?: string;
  status?: string;
}
