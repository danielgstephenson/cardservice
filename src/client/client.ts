import runService from './runService'
import sharedInput from './sharedInput'

const run1 = runService({
  events: [],
  input: sharedInput,
  label: '1'
})

const run2 = runService({
  events: [
    {
      type: 'plan',
      playCard: run1.players.p1.hand[1],
      trashCard: run1.players.p1.hand[0],
      playerId: 'p1'
    }, {
      type: 'plan',
      playCard: run1.players.p2.hand[1],
      trashCard: run1.players.p2.hand[0],
      playerId: 'p2'
    }, {
      type: 'plan',
      playCard: run1.players.p3.hand[3],
      trashCard: run1.players.p3.hand[0],
      playerId: 'p3'
    }, {
      type: 'plan',
      playCard: run1.players.p4.hand[1],
      trashCard: run1.players.p4.hand[0],
      playerId: 'p4'
    }, {
      type: 'plan',
      playCard: run1.players.p5.hand[1],
      trashCard: run1.players.p5.hand[0],
      playerId: 'p5'
    }
  ],
  input: run1.input,
  label: '2'
})

const run3 = runService({
  events: [
    {
      type: 'bid',
      bid: 5,
      playerId: 'p1'
    }, {
      type: 'concede',
      playerId: 'p2'
    }, {
      type: 'concede',
      playerId: 'p3'
    }, {
      type: 'concede',
      playerId: 'p4'
    }, {
      type: 'concede',
      playerId: 'p5'
    }
  ],
  input: run2.input,
  label: '3'
})

const run4 = runService({
  events: [
    {
      type: 'take',
      cardIds: [run3.output.game.market[1].id, run3.output.game.market[0].id],
      playerId: 'p1'
    }
  ],
  input: run3.input,
  label: '4'
})

const run5 = runService({
  events: [
    {
      type: 'plan',
      playCard: run4.players.p1.hand[1],
      playerId: 'p1',
      trashCard: run4.players.p1.hand[0]
    },
    {
      type: 'plan',
      playCard: run4.players.p2.hand[1],
      playerId: 'p2',
      trashCard: run4.players.p2.hand[0]
    },
    {
      type: 'plan',
      playCard: run4.players.p3.hand[0],
      playerId: 'p3',
      trashCard: run4.players.p3.hand[1]
    },
    {
      type: 'plan',
      playCard: run4.players.p4.hand[1],
      playerId: 'p4',
      trashCard: run4.players.p4.hand[0]
    },
    {
      type: 'plan',
      playCard: run4.players.p5.hand[1],
      playerId: 'p5',
      trashCard: run4.players.p5.hand[0]
    }
  ],
  input: run4.input,
  label: '5'
})

const run6 = runService({
  events: [
    {
      type: 'bid',
      bid: 5,
      playerId: 'p1'
    },
    {
      type: 'bid',
      bid: 10,
      playerId: 'p2'
    },
    {
      type: 'bid',
      bid: 10,
      playerId: 'p3'
    },
    {
      type: 'concede',
      playerId: 'p2'
    },
    {
      type: 'concede',
      playerId: 'p3'
    },
    {
      type: 'concede',
      playerId: 'p4'
    },
    {
      type: 'concede',
      playerId: 'p5'
    }
  ],
  input: run5.input,
  label: '6'
})

const run7 = runService({
  events: [
    {
      type: 'take',
      cardIds: [],
      playerId: 'p1'
    }
  ],
  input: run6.input,
  label: '7'
})

runService({
  events: [
    {
      type: 'plan',
      playCard: run7.players.p1.hand[0],
      playerId: 'p1',
      trashCard: run7.players.p1.hand[1]
    },
    {
      type: 'plan',
      playCard: run7.players.p2.hand[0],
      playerId: 'p2',
      trashCard: run7.players.p2.hand[1]
    },
    {
      type: 'plan',
      playCard: run7.players.p3.hand[0],
      playerId: 'p3',
      trashCard: run7.players.p3.hand[1]
    },
    {
      type: 'plan',
      playCard: run7.players.p4.hand[0],
      playerId: 'p4',
      trashCard: run4.players.p4.hand[1]
    },
    {
      type: 'plan',
      playCard: run7.players.p5.hand[0],
      playerId: 'p5',
      trashCard: run7.players.p5.hand[1]
    }
  ],
  input: run7.input,
  label: '8',
  print: true,
  playerId: 'p3',
  write: true
})
