import { dateFromJson } from '@lib/JsonConversion';

export type SLAType = 'acceptance' | 'pickup' | 'delivery';

export type MatchSLAData = {
  type: SLAType;
  start_time: string | null | Date;
  end_time: string | null | Date;
  completed_at: string | null | Date;
};

export type MatchSLA = {
  start_time: Date | null;
  end_time: Date | null;
  completed_at: Date | null;
} & MatchSLAData;

export const buildMatchSla = (data: MatchSLAData): MatchSLA => ({
  ...data,
  start_time: dateFromJson(data.start_time),
  end_time: dateFromJson(data.end_time),
  completed_at: dateFromJson(data.completed_at),
});
