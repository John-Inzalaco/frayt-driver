import Match, { MatchData } from '@models/Match';

type MatchSortFn = (a: Match, b: Match) => number;

type MatchFilterFn = (value: Match) => boolean;

type MatchMapFn = (value: Match, index: number, array: Match[]) => any;

type MatchesCollectionInstances = { [key: string]: MatchesCollection };

export default class MatchesCollection {
  static instances: MatchesCollectionInstances = {};

  syncDB: boolean;
  matches: Match[];
  constructor(matches: Match[] = [], syncDB = true) {
    this.matches = matches;
    this.syncDB = syncDB;
  }

  hasIndex = (index: unknown): index is number => {
    return typeof index === 'number' && index !== null && index in this.matches;
  };

  syncToDB(syncDB = true) {
    this.syncDB = syncDB;
    return this;
  }

  find(matchId: string): Match | null {
    return this.findBy('id', matchId);
  }

  exists(matchId: string): boolean {
    return !!this.findBy('id', matchId);
  }

  findBy(key: keyof Match, value: any): Match | null {
    let matched = this.where(key, value);

    return matched[0] || null;
  }

  where(key: keyof Match, value: any): Match[] {
    let matched = this.filter((match: Match) => {
      return match[key] === value;
    });

    return matched;
  }

  first(): Match | null {
    return this.matches[0] || null;
  }

  last(): Match | null {
    const i = this.matches.length - 1;
    return this.matches[i] || null;
  }

  all() {
    return this.matches;
  }

  sort(callback: MatchSortFn): MatchesCollection {
    this.matches = this.matches.sort(callback);
    return this;
  }

  column(column_name: keyof Match): any[] {
    return this.matches.map((match) => match[column_name]);
  }

  set(key: keyof Match, value: any): this {
    this.matches = this.matches.map((m) => {
      m[key] = value;
      this.syncDB && m.update();
      return m;
    });

    return this;
  }

  add(m: Match | MatchData): this {
    const match: Match = m instanceof Match ? m : new Match(m);
    this.syncDB && match.save();
    this.matches.unshift(match);
    this.clean();
    return this;
  }

  addSet(matches: Match[]): this {
    matches = Array.isArray(matches) ? matches : [];

    this.matches = matches
      .map((match) => {
        match = match instanceof Match ? match : new Match(match);
        this.syncDB && match.save();
        return match;
      })
      .concat(this.matches);

    this.clean();

    return this;
  }

  replaceSet(matches: Match[]): this {
    matches = Array.isArray(matches) ? matches : [];

    for (let match of this.matches) {
      this.syncDB && match.delete();
    }

    this.matches = matches.map((match) => {
      match = match instanceof Match ? match : new Match(match);
      this.syncDB && match.save();
      return match;
    });

    return this;
  }

  filter(callback: MatchFilterFn): Match[] {
    return this.matches.filter(callback);
  }

  clone(): MatchesCollection {
    return new MatchesCollection([...this.matches], this.syncDB);
  }

  getEnRoute(): Match[] {
    return this.filter((match) => match.isEnRoute());
  }

  getLive(): Match[] {
    return this.filter((match) => match.isLive());
  }

  getComplete(): Match[] {
    return this.filter((match) => match.isComplete());
  }

  getAvailable(): Match[] {
    return this.filter((match) => match.isAvailable());
  }

  getRecent(): Match[] {
    return this.filter((match) => match.isRecent());
  }

  removeWhere(callback: (m: Match) => boolean): this {
    this.matches = this.matches.filter((match) => {
      let found = callback(match);

      if (found) {
        this.syncDB && match.delete();
      }

      return !found;
    });

    return this;
  }

  clear(): this {
    for (let match of this.matches) {
      this.syncDB && match.delete();
    }

    this.matches = [];

    return this;
  }

  remove(matchId: string): this {
    this.matches = this.matches.filter((match) => {
      return match.id !== matchId;
    });

    this.syncDB && Match.deleteWhere(`id = "${matchId}"`);

    return this;
  }

  clean(): this {
    const unique: Match[] = this.matches
      .map((m) => m.id)
      .map((id, i, final) => final.indexOf(id) === i && i)
      .filter(this.hasIndex)
      .map((i) => this.matches[i]);

    this.matches = unique;
    return this;
  }

  length(): number {
    return this.matches.length;
  }

  toArray(): Match[] {
    return this.matches;
  }
}
