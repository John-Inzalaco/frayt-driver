import { titleCase } from '@lib/helpers';
import { MatchSLA } from '@models/MatchSLA';
import moment from 'moment';
import DataCard from './DataCard';
import React from 'react';

type MatchSLACardProps = {
  slas: MatchSLA[];
};

export default function MatchSLACard({ slas }: MatchSLACardProps) {
  const items = slas.map(({ type, end_time, completed_at }) => {
    const diff = moment(completed_at).diff(end_time, 'minutes') || 0;
    const content = diff > 0 ? `${diff} minutes late` : 'On time';
    const label = titleCase(type);

    return { label, content };
  });

  return <DataCard title='SLAs' items={items} />;
}
