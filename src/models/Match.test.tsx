import Match from '@models/Match';

describe('Match model', () => {
  it('can be constructed', async () => {
    expect(Match.pickedUpStates).toContain('picked_up');
  });
});
