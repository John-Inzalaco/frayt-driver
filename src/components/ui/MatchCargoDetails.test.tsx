import {
  DriverFactory,
  MatchFactory,
  MatchStopFactory,
  MatchStopItemFactory,
  VehicleFactory,
} from '@test/factory';
import MatchCargoDetails from '@components/ui/MatchCargoDetails';

const driver = DriverFactory({
  vehicle: VehicleFactory({
    capacity_length: 20,
    capacity_width: 20,
    capacity_height: 20,
    capacity_weight: 200,
  }),
});

const small_cargo_match = MatchFactory({
  stops: [
    MatchStopFactory({
      items: [
        MatchStopItemFactory({ length: 10, width: 20, height: 10, weight: 20 }),
      ],
    }),
  ],
});

const large_cargo_match = MatchFactory({
  stops: [
    MatchStopFactory({
      items: [
        MatchStopItemFactory({
          length: 15,
          width: 15,
          height: 10,
          weight: 10,
        }),
        MatchStopItemFactory({
          length: 15,
          width: 15,
          height: 10,
          weight: 10,
        }),
        MatchStopItemFactory({
          length: 15,
          width: 15,
          height: 10,
          weight: 10,
        }),
      ],
    }),
  ],
});

describe('MatchCargoDetails cargo fits', () => {
  it('can fit small box', async () => {
    expect(
      MatchCargoDetails.prototype.cargoFits(driver, small_cargo_match),
    ).toBe(true);
  });
  it('cant fit large box', async () => {
    expect(
      MatchCargoDetails.prototype.cargoFits(driver, large_cargo_match),
    ).toBe(false);
  });
});
