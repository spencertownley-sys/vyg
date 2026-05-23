export interface RawSailing {
  sourceId: string;
  sourceUrl: string;
  shipName: string;
  lineName: string;
  departurePort: string;
  arrivalPort: string;
  departDate: string;
  arriveDate: string;
  nights: number;
  destination: string;
  portsOfCall: string[];
  fares: Partial<Record<CabinClass, number>>;
  charterFlag?: boolean;
  charterName?: string;
}

export type CabinClass = "Interior" | "Oceanview" | "Balcony" | "Mini-Suite" | "Suite";

export interface CanonicalSailing {
  sail_id: string;
  ship_name: string;
  line_name: string;
  departure_port: string;
  arrival_port: string;
  departure_dt: string;
  arrival_dt: string;
  sail_duration: number;
  destination: string;
  ports_of_call: string[];
  fares: Partial<Record<CabinClass, number>>;
  charter_flag: boolean;
  charter_name?: string;
  source_url: string;
  booking_url?: string;
}

export type ProgressReporter = {
  log(message: string): void;
  update(progress: { fetched: number; total?: number }): void;
};

export interface SailingSource {
  id: string;
  displayName: string;
  fetch(progress: ProgressReporter): AsyncIterable<RawSailing>;
  normalize(raw: RawSailing): CanonicalSailing | null;
}
