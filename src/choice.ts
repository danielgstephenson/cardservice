export class Choice {
  intend: () => void
  fufill: () => void

  constructor (intend: () => void, fufill: () => void) {
    this.intend = intend
    this.fufill = fufill
  }
}
