// src/types/threat.ts

export interface GreyNoiseData {
  classification: "benign" | "malicious" | "unknown";
  noise: boolean;
  riot: boolean;
  name: string;
  link: string;
  last_seen?: string;
  first_seen?: string;
  message?: string;
  // Additional fields from raw data
  ip?: string;
  seen?: boolean;
  vpn?: boolean;
  proxy?: boolean;
  tor?: boolean;
  bot?: boolean;
  mobile?: boolean;
  datacenter?: boolean;
  asn?: string;
  organization?: string;
  country?: string;
  country_code?: string;
  city?: string;
  tags?: string[];
  cve?: string[];
  raw?: {
    ip: string;
    noise: boolean;
    riot: boolean;
    classification: string;
    name: string;
    link: string;
    last_seen: string;
    first_seen?: string;
    message: string;
    seen?: boolean;
    vpn?: boolean;
    proxy?: boolean;
    tor?: boolean;
    bot?: boolean;
    mobile?: boolean;
    datacenter?: boolean;
    location?: {
      country?: string;
      country_code?: string;
      city?: string;
      region?: string;
    };
    asn?: string;
    organization?: string;
    tags?: string[];
    cve?: string[];
    metadata?: {
      asn?: string;
      organization?: string;
      country?: string;
      country_code?: string;
      city?: string;
      os?: string;
      category?: string;
      tor?: boolean;
      vpn?: boolean;
      proxy?: boolean;
      bot?: boolean;
      mobile?: boolean;
      datacenter?: boolean;
    };
    raw_data?: {
      web?: {
        scanning?: Array<{
          port: number;
          protocol: string;
        }>;
        paths?: string[];
        useragents?: string[];
      };
      ids?: Array<{
        signature: string;
        severity: number;
      }>;
    };
  };
}

export interface AbuseIPDBReport {
  reportedAt: string;
  comment: string;
  categories: number[];
  reporterId?: number;
  fromIpCountryCode?: string;
  fromIpCountryName?: string;
}

export interface AbuseIPDBRawData {
  ipAddress: string;
  isPublic: boolean;
  ipVersion: number;
  isWhitelisted: boolean;
  abuseConfidenceScore: number;
  countryCode: string;
  countryName?: string;
  usageType: string;
  isp: string;
  domain: string;
  hostnames: string[];
  isTor: boolean;
  totalReports: number;
  numDistinctUsers: number;
  lastReportedAt: string;
  reports?: AbuseIPDBReport[];
}

export interface AbuseIPDBData {
  abuseConfidenceScore: number;
  totalReports: number;
  countryCode?: string;
  countryName?: string;
  usageType: string;
  isp?: string;
  domain?: string;
  isWhitelisted: boolean;
  isTor?: boolean;
  numDistinctUsers?: number;
  lastReportedAt?: string;
  ipAddress?: string;
  isPublic?: boolean;
  ipVersion?: number;
  hostnames?: string[];
  reports?: AbuseIPDBReport[];
  raw?: AbuseIPDBRawData;
}

export interface OTXPulse {
  id: string;
  name: string;
  description: string;
  modified: string;
  created: string;
  tags: string[];
  references: string[];
  public: number;
  adversary: string;
  targeted_countries: string[];
  malware_families: any[];
  attack_ids: any[];
  industries: string[];
  TLP: string;
  cloned_from: string | null;
  export_count: number;
  upvotes_count: number;
  downvotes_count: number;
  votes_count: number;
  locked: boolean;
  pulse_source: string;
  validator_count: number;
  comment_count: number;
  follower_count: number;
  vote: number;
  author: {
    username: string;
    id: string;
    avatar_url: string;
    is_subscribed: boolean;
    is_following: boolean;
  };
  indicator_type_counts: Record<string, number>;
  indicator_count: number;
  is_author: boolean;
  is_subscribing: boolean | null;
  subscriber_count: number;
  modified_text: string;
  is_modified: boolean;
  groups: string[];
  in_group: boolean;
  threat_hunter_scannable: boolean;
  threat_hunter_has_agents: number;
  related_indicator_type: string;
  related_indicator_is_active: number;
}

export interface OTXData {
  indicator: string;
  type: string;
  pulse_count: number;
  is_malicious: boolean;
  tags: string[];
  pulses?: OTXPulse[];
  malware_families?: any[];
  attack_ids?: any[];
  raw?: {
    whois?: string;
    reputation?: number;
    indicator?: string;
    type?: string;
    type_title?: string;
    base_indicator?: {
      id: number;
      indicator: string;
      type: string;
      title: string;
      description: string;
      content: string;
      access_type: string;
      access_reason: string;
    };
    pulse_info?: {
      count: number;
      pulses: OTXPulse[];
      references: string[];
      related?: {
        alienvault?: {
          adversary: string[];
          malware_families: string[];
          industries: string[];
        };
        other?: {
          adversary: string[];
          malware_families: string[];
          industries: string[];
        };
      };
    };
    false_positive?: string[];
    validation?: string[];
    asn?: string;
    city_data?: boolean;
    city?: string | null;
    region?: string | null;
    continent_code?: string;
    country_code3?: string;
    country_code2?: string;
    subdivision?: string | null;
    latitude?: number;
    postal_code?: string | null;
    longitude?: number;
    accuracy_radius?: number;
    country_code?: string;
    country_name?: string;
    dma_code?: number;
    charset?: number;
    area_code?: number;
    flag_url?: string;
    flag_title?: string;
    sections?: string[];
  };
}

export interface PulsediveData {
  error?: string;
  risk: string;
  score: number;
  is_malicious?: boolean;
  threats?: Array<{
    tid?: number;
    name: string;
    category?: string;
    risk?: string;
    stamp_linked?: string;
  }>;
  properties?: Record<string, any>;
  raw?: any;
  note?: string;
}

export interface MultiRBLList {
  name: string;
  listed: boolean;
  weight?: number;
}

export interface MultiRBLData {
  listedCount: number;
  totalChecked: number;
  is_blacklisted: boolean;
  weighted_score?: number;
  lists: MultiRBLList[];
  note?: string;
}

export interface IPInfoData {
  ip: string;
  hostname?: string | null;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  postal?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  asn?: string;
  org_name?: string;
  privacy?: {
    vpn?: boolean;
    proxy?: boolean;
    tor?: boolean;
    hosting?: boolean;
    relay?: boolean;
  };
  abuse?: {
    address?: string;
    country?: string;
    email?: string;
    name?: string;
    network?: string;
    phone?: string;
  };
  domains?: {
    total?: number;
    domains?: string[];
  };
  company?: {
    name?: string;
    domain?: string;
    type?: string;
  };
  carrier?: {
    name?: string;
    mcc?: string;
    mnc?: string;
  };
  raw?: any;
  enriched?: any;
  note?: string;
  error?: string;
}

export interface ThreatFoxData {
  ioc?: string;
  ioc_count: number;
  is_malicious: boolean;
  iocs?: Array<{
    ioc: string;
    threat_type: string;
    malware: string;
  }>;
  raw?: {
    query_status?: string;
    data?: string;
  };
  note?: string;
}

export interface VirusTotalAnalysisResult {
  method: string;
  engine_name: string;
  category: string;
  result: string;
}

export interface VirusTotalData {
  last_analysis_stats: {
    malicious: number;
    suspicious: number;
    undetected: number;
    harmless: number;
    timeout?: number;
  };
  last_analysis_results?: Record<string, VirusTotalAnalysisResult>;
  asn: number;
  as_owner: string;
  country: string;
  continent: string;
  network: string;
  jarm?: string;
  reputation?: number;
  last_analysis_date?: number;
  input?: string;
  tags?: string[];
  whois?: string;
  last_modification_date?: number;
  regional_internet_registry?: string;
  total_votes?: {
    harmless: number;
    malicious: number;
  };
  rdap?: any;
  id?: string;
  type?: string;
  whois_date?: number;
}

export interface IPifyLocation {
  country: string;
  region: string;
  city: string;
  lat: number;
  lng: number;
  postalCode: string;
  timezone: string;
  geonameId?: number;
}

export interface IPifyAS {
  asn: number;
  name: string;
  route: string;
  domain: string;
  type?: string;
}

export interface IPifyProxy {
  proxy: boolean;
  vpn: boolean;
  tor: boolean;
}

export interface IPifyData {
  ip: string;
  location: IPifyLocation;
  domains: string[];
  as: IPifyAS;
  isp: string;
  proxy: IPifyProxy;
}

export interface VPNAPILocation {
  city: string;
  region: string;
  country: string;
  continent: string;
  region_code: string;
  country_code: string;
  continent_code: string;
  latitude: string;
  longitude: string;
  time_zone: string;
  locale_code: string;
  metro_code: string;
  is_in_european_union: boolean;
}

export interface VPNAPINetwork {
  network: string;
  autonomous_system_number: string;
  autonomous_system_organization: string;
}

export interface VPNAPISecurity {
  vpn: boolean;
  proxy: boolean;
  tor: boolean;
  relay: boolean;
}

export interface VPNAPIData {
  ip: string;
  security: VPNAPISecurity;
  location: VPNAPILocation;
  network: VPNAPINetwork;
}

export interface IPTeohData {
  ip: string;
  security: VPNAPISecurity;
  location: VPNAPILocation;
  network: VPNAPINetwork;
}

export interface ShodanData {
  note?: string;
  ports: number[];
  cves: string[];
  error?: string;
}

export interface CensysData {
  note?: string;
  services: Array<{
    port?: number;
    service_name?: string;
    transport?: string;
    extended_service_name?: string;
  }>;
  raw?: any;
}

export interface TalosData {
  note?: string;
  blacklisted: boolean;
  error?: string;
}

export interface IPQualityScoreData {
  fraud_score: number;
  vpn: boolean;
  proxy: boolean;
  tor: boolean;
  recent_abuse: boolean;
  bot_status?: boolean;
  is_crawler?: boolean;
  mobile?: boolean;
  active?: boolean;
  isp?: string;
  organization?: string;
  hostname?: string;
  asn?: string;
  raw?: {
    success?: boolean;
    message?: string;
    request_id?: string;
  };
}

export interface InQuestSource {
  source: string;
  data: string;
  derived: string;
  date: string;
  source_url?: string | null;
}

export interface InQuestData {
  reputation_hits: number;
  is_malicious: boolean;
  sources: InQuestSource[];
  note?: string;
  raw?: any[];
}

export interface ThreatMinerData {
  note?: string;
  detections: number;
  error?: string;
}

export interface MalwareURLData {
  is_malicious: boolean;
  note?: string;
  error?: string;
}

export interface IOCOneData {
  note?: string;
  hits: number;
  is_malicious: boolean;
  error?: string;
}

export interface URLScanData {
  uuid?: string;
  url?: string;
  is_malicious: boolean;
  score: number;
  verdicts?: Record<string, { malicious: boolean; score: number }>;
  page?: {
    domain?: string;
    ip?: string;
    country?: string;
    server?: string;
    asn?: string;
  };
  stats?: {
    resourceStats?: { count: number };
    requests?: { total: number };
  };
  report_url?: string;
  screenshot?: string;
  raw?: any;
}

export interface URLHausURL {
  id?: string;
  url: string;
  threat?: string;
  tags?: string[];
  date_added?: string;
}

export interface URLHausData {
  is_malicious: boolean;
  count: number;
  threat_types?: string[];
  tags?: string[];
  urls?: URLHausURL[];
  raw?: any;
}

export interface SucuriData {
  status: string;
  is_malicious: boolean;
  blacklist?: {
    malware?: boolean;
    phishing?: boolean;
    spam?: boolean;
    defacement?: boolean;
  };
  recommendations?: string[];
  malware?: string[];
  blacklisted_by?: string[];
  scan_id?: string;
  scanned_at?: string;
  raw?: any;
}

export interface AISummary {
  executiveSummary: string;
  riskAssessment?: string;
  keyIndicators: string[];
  potentialThreats: string[];
  recommendations: string[];
  confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
  sourcesContributingMost: string[];
  tacticalAdvice?: string;
}

export interface AISummaryMeta {
  generatedAt: string;
  model?: string;
  promptTokens?: number;
  responseTokens?: number;
  riskCalculatedBy?: string;
  fallbackUsed?: boolean;
  error?: string;
}

export interface ThreatData {
  // Core fields
  riskScore: number;
  riskLevel?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  input: string;
  inputType?: "ip" | "url" | "domain" | "hash" | "email";
  type?: string;
  timestamp: string;
  analysisDuration?: number;
  analysisId?: string;

  // Threat Intelligence Sources
  vt?: VirusTotalData;
  abuseipdb?: AbuseIPDBData;
  otx?: OTXData;
  greynoise?: GreyNoiseData;
  pulsedive?: PulsediveData;
  multirbl?: MultiRBLData;
  ipinfo?: IPInfoData;
  threatfox?: ThreatFoxData;
  shodan?: ShodanData;
  censys?: CensysData;
  talos?: TalosData;
  vpnapi?: VPNAPIData;
  ipteoh?: IPTeohData;
  malwareurl?: MalwareURLData;
  iocone?: IOCOneData;
  inquest?: InQuestData;
  threatminer?: ThreatMinerData;
  ipqualityscore?: IPQualityScoreData;
  ipify?: IPifyData;

  // URL-specific sources
  urlscan?: URLScanData;
  urlhaus?: URLHausData;
  sucuri?: SucuriData;

  // AI Summary
  aiSummary?: AISummary;
  aiSummaryMeta?: AISummaryMeta;
}

export interface AnalysisResponse {
  success: boolean;
  data: ThreatData;
  error?: string;
}

export interface SearchHistoryItem {
  input: string;
  inputType: string;
  riskScore: number;
  riskLevel?: string;
  timestamp: string;
}

// Component Props Types
export interface ThreatSummaryCardProps {
  data: ThreatData;
  showActions?: boolean;
  onExport?: () => void;
  onCopy?: () => void;
}

export interface ThreatScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export interface SourceBadgeProps {
  source: string;
  status: "malicious" | "suspicious" | "clean" | "unknown";
  score?: number;
}

// Utility type for API responses
export interface APIErrorResponse {
  success: false;
  error: string;
  statusCode?: number;
}
