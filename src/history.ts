import { Episode, EpisodeDef } from "./episode";
import { State } from "./state";

export class History extends Episode {

  constructor(state: State) {
    const def: EpisodeDef = {
      state,
      siblings: [],
      message: 'HISTORY',
    }
    super(def)
  }

} 