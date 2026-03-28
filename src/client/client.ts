import runService from './runService'
import sharedInput from './sharedInput'

const run1 = runService({
  events: [],
  run: { input: sharedInput },
  label: '1'
})

const run2 = runService({
  plans: {
    p1: {
      play: 1,
      trash: 0
    },
    p2: {
      play: 1,
      trash: 0
    },
    p3: {
      play: 3,
      trash: 0
    },
    p4: {
      play: 1,
      trash: 0
    },
    p5: {
      play: 1,
      trash: 0
    }
  },
  run: run1,
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
  run: run2,
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
  run: run3,
  label: '4'
})

const run5 = runService({
  plans: {
    p1: {
      play: 1,
      trash: 0
    },
    p2: {
      play: 1,
      trash: 0
    },
    p3: {
      play: 0,
      trash: 1
    },
    p4: {
      play: 1,
      trash: 0
    },
    p5: {
      play: 1,
      trash: 0
    }
  },
  run: run4,
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
  run: run5,
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
  run: run6,
  label: '7'
})

const run8 = runService({
  plans: {
    p1: {
      play: 0,
      trash: 1
    },
    p2: {
      play: 0,
      trash: 1
    },
    p3: {
      play: 0,
      trash: 1
    },
    p4: {
      play: 0,
      trash: 1
    },
    p5: {
      play: 0,
      trash: 1
    }
  },
  run: run7,
  label: '8'
})

runService({
  events: [
    {
      type: 'bid',
      bid: 5,
      playerId: 'p1'
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
    },
    {
      type: 'take',
      cardIds: [run8.output.game.market[0].id],
      playerId: 'p1'
    }
  ],
  run: run8,
  label: '9',
  print: true,
  playerId: 'p3',
  write: true
})
