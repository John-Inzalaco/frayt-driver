export type MatchFeeData = {
  id: string;
  amount: number;
  description: Nullable<string>;
  type: string;
  name: string;
};

export default class MatchFee implements MatchFeeData {
  id;
  amount;
  description;
  type;
  name;

  constructor(data: MatchFeeData) {
    this.id = data.id;
    this.amount = data.amount;
    this.description = data.description;
    this.type = data.type;
    this.name = data.name;
  }

  display_amount(): string {
    let dollars = (this.amount || 0) / 100;

    return dollars.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }
}
