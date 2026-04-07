// src/types/threat.ts - Updated GreyNoiseData interface

export interface GreyNoiseData {
  classification: "benign" | "malicious" | "unknown";
  noise: boolean;
  vpn?: boolean;
  proxy?: boolean;
  tor?: boolean;
  bot?: boolean;
  mobile?: boolean;
  datacenter?: boolean;
  seen?: boolean;
  riot?: boolean;
  ip?: string;
  asn?: string;
  organization?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  firstSeen?: string;
  lastSeen?: string;
  tags?: string[];
  cve?: string[];
  link?: string;
  raw?: {
    ip?: string;
    noise?: boolean;
    riot?: boolean;
    classification?: string;
    name?: string;
    link?: string;
    last_seen?: string;
    first_seen?: string;
    message?: string;
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
    country?: string;
    country_code?: string;
    city?: string;
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

// The rest of the file remains unchanged...
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

export interface AbuseIPDBReport {
  reportedAt: string;
  comment: string;
  categories: number[];
  reporterId?: number;
  reporterCountry?: string;
  reporterCountryCode?: string;
}

export interface AbuseIPDBData {
  abuseConfidenceScore: number;
  totalReports: number;
  country: string;
  countryCode?: string;
  countryName?: string;
  usageType: string;
  isWhitelisted: boolean;
  ipAddress?: string;
  isp?: string;
  domain?: string;
  numDistinctUsers?: number;
  lastReportedAt?: string;
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
  malware_families: Array<{
    id?: string;
    display_name: string;
    target?: string;
  }>;
  attack_ids: Array<{
    id: string;
    name: string;
    display_name: string;
  }>;
  industries: string[];
  TLP: string;
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
  indicator_type_counts: {
    IPv4?: number;
    IPv6?: number;
    URL?: number;
    domain?: number;
    FileHash?: number;
    FileHash_SHA256?: number;
    "FileHash-SHA256"?: number;
    email?: number;
    CVE?: number;
    hostname?: number;
  };
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
    city?: string;
    region?: string;
    continent_code?: string;
    country_code3?: string;
    country_code2?: string;
    subdivision?: string;
    latitude?: number;
    postal_code?: string;
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
  risk: string;
  score: number;
  is_malicious?: boolean;
  threats: {
    tid?: number;
    name: string;
    category?: string;
    risk?: string;
    stamp_linked?: string;
  }[];
  properties?: Record<string, any>;
  raw?: any;
}

export interface MultiRBLData {
  listedCount: number;
  totalChecked: number;
  is_blacklisted?: boolean;
  lists: { name: string; listed: boolean }[];
  note?: string;
}

export interface IPInfoData {
  ip: string;
  hostname?: string;
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
  geo?: {
    city?: string;
    region?: string;
    region_code?: string;
    country?: string;
    country_code?: string;
    continent?: string;
    continent_code?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    postal_code?: string;
  };
  as?: {
    asn?: string;
    name?: string;
    domain?: string;
    type?: string;
    route?: string;
  };
  privacy?: {
    vpn?: boolean;
    proxy?: boolean;
    tor?: boolean;
    hosting?: boolean;
    relay?: boolean;
    service?: string | null;
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
  is_anonymous?: boolean;
  is_anycast?: boolean;
  is_hosting?: boolean;
  is_mobile?: boolean;
  is_satellite?: boolean;
  rate_limit?: {
    tier: string;
    requests_per_month: number;
    used?: number;
    remaining?: number;
    endpoint?: string;
    credits_used?: number;
    message?: string;
    available?: boolean;
  };
  error?: string;
  note?: string;
  raw?: any;
  enriched?: any;
}

export interface ThreatFoxData {
  ioc?: string;
  ioc_count: number;
  is_malicious?: boolean;
  iocs?: { ioc: string; threat_type: string; malware: string }[];
  raw?: any;
}

export interface VirusTotalData {
  last_analysis_stats: {
    malicious: number;
    suspicious: number;
    undetected: number;
    harmless: number;
    timeout?: number;
  };
  last_analysis_results?: Record<
    string,
    {
      method: string;
      engine_name: string;
      category: string;
      result: string;
    }
  >;
  asn: number;
  as_owner: string;
  country: string;
  continent: string;
  network: string;
  jarm: string;
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
  last_https_certificate?: {
    subject?: {
      CN?: string;
      OU?: string;
    };
    validity?: {
      not_before?: string;
      not_after?: string;
    };
    issuer?: {
      C?: string;
      CN?: string;
      O?: string;
    };
  };
  crowdsourced_context?: Array<{
    details?: string;
    link?: string;
    severity?: string;
    timestamp?: number;
    title?: string;
    source?: string;
  }>;
  rdap?: any;
}

export interface IPifyData {
  ip: string;
  location: {
    country: string;
    region: string;
    city: string;
    lat: number;
    lng: number;
    postalCode: string;
    timezone: string;
    geonameId: number;
  };
  domains: string[];
  as: {
    asn: number;
    name: string;
    route: string;
    domain: string;
    type: string;
  };
  isp: string;
  proxy: {
    proxy: boolean;
    vpn: boolean;
    tor: boolean;
  };
}

export interface ThreatData {
  riskScore: number;
  input: string;
  inputType: "ip" | "url" | "domain";
  timestamp: string;
  type?: string;
  riskLevel?: string;
  vt?: VirusTotalData;
  abuseipdb?: AbuseIPDBData;
  otx?: OTXData;
  greynoise?: GreyNoiseData;
  pulsedive?: PulsediveData;
  multirbl?: MultiRBLData;
  ipinfo?: IPInfoData;
  threatfox?: ThreatFoxData;
  shodan?: any;
  censys?: CensysData;
  talos?: any;
  vpnapi?: VPNAPIData;
  ipteoh?: IPTeohData;
  malwareurl?: any;
  iocone?: any;
  inquest?: InQuestData;
  threatminer?: any;
  ipqualityscore?: IPQualityScoreData;
  ipify?: IPifyData;
}

export interface IPQualityScoreData {
  fraud_score: number;
  vpn: boolean;
  proxy: boolean;
  tor: boolean;
  recent_abuse: boolean;
  is_crawler?: boolean;
  mobile?: boolean;
  isp?: string;
  organization?: string;
  hostname?: string;
  asn?: string;
  raw?: {
    success?: boolean;
    message?: string;
    request_id?: string;
    ip?: string;
    timestamp?: string;
    country?: string;
    city?: string;
    region?: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    isp?: string;
    organization?: string;
    hostname?: string;
    asn?: string;
  };
}

export interface CensysData {
  services: Array<{
    port?: number;
    service_name?: string;
    transport?: string;
    extended_service_name?: string;
  }>;
  raw?: {
    result?: {
      resource?: {
        ip?: string;
        location?: {
          continent?: string;
          country?: string;
          country_code?: string;
          city?: string;
          postal_code?: string;
          timezone?: string;
          province?: string;
          coordinates?: {
            latitude?: number;
            longitude?: number;
          };
        };
        autonomous_system?: {
          asn?: number;
          description?: string;
          bgp_prefix?: string;
          name?: string;
          country_code?: string;
        };
        whois?: {
          network?: {
            handle?: string;
            name?: string;
            cidrs?: string[];
            created?: string;
            updated?: string;
            allocation_type?: string;
          };
          organization?: {
            handle?: string;
            name?: string;
            street?: string;
            city?: string;
            state?: string;
            postal_code?: string;
            country?: string;
            abuse_contacts?: Array<{
              handle?: string;
              name?: string;
              email?: string;
            }>;
            admin_contacts?: Array<{
              handle?: string;
              name?: string;
              email?: string;
            }>;
            tech_contacts?: Array<{
              handle?: string;
              name?: string;
              email?: string;
            }>;
          };
        };
        dns?: {
          reverse_dns?: {
            resolve_time?: string;
          };
          names?: string[];
          forward_dns?: Record<
            string,
            {
              resolve_time?: string;
              name?: string;
              record_type?: string;
            }
          >;
        };
      };
      extensions?: any;
    };
  };
}

export interface InQuestSource {
  source: string;
  data: string;
  derived: string;
  date: string;
  source_url?: string | null;
}

export interface InQuestRawEntry {
  created_date: string;
  data: string;
  data_type: string;
  derived: string;
  derived_type: string;
  source: string;
  source_url: string | null;
}

export interface InQuestData {
  reputation_hits: number;
  is_malicious: boolean;
  sources: InQuestSource[];
  note?: string;
  raw?: InQuestRawEntry[];
}

export interface VPNAPIData {
  ip: string;
  security: {
    vpn: boolean;
    proxy: boolean;
    tor: boolean;
    relay: boolean;
  };
  location: {
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
  };
  network: {
    network: string;
    autonomous_system_number: string;
    autonomous_system_organization: string;
  };
}

export interface IPTeohData {
  ip: string;
  security: {
    vpn: boolean;
    proxy: boolean;
    tor: boolean;
    relay: boolean;
  };
  location: {
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
  };
  network: {
    network: string;
    autonomous_system_number: string;
    autonomous_system_organization: string;
  };
}

export interface AnalysisResponse {
  success: boolean;
  data: ThreatData;
}

export interface SearchHistoryItem {
  input: string;
  inputType: string;
  riskScore: number;
  timestamp: string;
}


