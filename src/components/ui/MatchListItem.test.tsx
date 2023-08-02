import { render } from '@testing-library/react-native';
import { MatchListItem } from '@components/ui/MatchListItem';

import React from 'react';
import {
  AddressFactory,
  DriverFactory,
  MatchFactory,
  MatchStopFactory,
} from '@test/factory';

describe('Match List Item', () => {
  it('renders', () => {
    const match = MatchFactory({
      driver_id: '1',
      origin_address: AddressFactory({ city: 'Sunnyvale' }),
      stops: [
        MatchStopFactory({
          destination_address: AddressFactory({
            city: 'Weehawken',
            state_code: 'CA',
          }),
        }),
      ],
    });
    const user = DriverFactory({ id: '1' });
    const { debug, getByText } = render(
      <MatchListItem match={match} user={user} updatingEnRouteMatch={{}} />,
    );

    const originCity = getByText(/Sunnyvale/);
    expect(originCity).toBeTruthy();
  });
});
