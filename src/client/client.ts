import { service } from '..'
import { InputEvent } from '../external'
import getPlayer from './getPlayer'
import printEpisodes from './printEpisodes'
import sharedInput from './sharedInput'
// import fs from 'fs'

const input1 = structuredClone(sharedInput)
const events1: InputEvent[] = []
input1.events = events1

console.log('Input 1...')
const output1 = service(input1)

const output1p1 = getPlayer(output1, 'p1')
const output1p2 = getPlayer(output1, 'p2')
const output1p3 = getPlayer(output1, 'p3')
const output1p4 = getPlayer(output1, 'p4')
const output1p5 = getPlayer(output1, 'p5')

const input2 = structuredClone(sharedInput)
input2.events.push(
  {
    type: 'plan',
    playCard: output1p1.hand[0],
    trashCard: output1p1.hand[1],
    playerId: 'p1'
  }, {
    type: 'plan',
    playCard: output1p2.hand[0],
    trashCard: output1p2.hand[1],
    playerId: 'p2'
  }, {
    type: 'plan',
    playCard: output1p3.hand[3],
    trashCard: output1p3.hand[1],
    playerId: 'p3'
  }, {
    type: 'plan',
    playCard: output1p4.hand[0],
    trashCard: output1p4.hand[1],
    playerId: 'p4'
  }, {
    type: 'plan',
    playCard: output1p5.hand[0],
    trashCard: output1p5.hand[1],
    playerId: 'p5'
  }
)

console.log('Input 2...')
const output2 = service(input2)

// const input3 = structuredClone(input2)
// input3.events.push(
//   {
//     type: 'bid',
//     bid: 5,
//     playerId: 'p1'
//   }, {
//     type: 'concede',
//     playerId: 'p2'
//   }, {
//     type: 'concede',
//     playerId: 'p3'
//   }, {
//     type: 'concede',
//     playerId: 'p4'
//   }, {
//     type: 'concede',
//     playerId: 'p5'
//   }
// )

// console.log('Input 3...')
// const output3 = service(input3)

// const input4 = structuredClone(input3)
// input4.events.push(
//   {
//     type: 'take',
//     cardIds: [output3.game.market[1].id, output3.game.market[0].id],
//     playerId: 'p1'
//   }
// )

// console.log('Input 4...')
// const output4 = service(input4)
// const input5 = structuredClone(input4)
// input5.events.push(
//   {
//     type: 'plan',
//     playCard: getPlayer(output4, 'p1').hand[1],
//     playerId: 'p1',
//     trashCard: getPlayer(output4, 'p1').hand[0]
//   },
//   {
//     type: 'plan',
//     playCard: getPlayer(output4, 'p2').hand[1],
//     playerId: 'p2',
//     trashCard: getPlayer(output4, 'p2').hand[0]
//   },
//   {
//     type: 'plan',
//     playCard: getPlayer(output4, 'p3').hand[1],
//     playerId: 'p3',
//     trashCard: getPlayer(output4, 'p3').hand[0]
//   },
//   {
//     type: 'plan',
//     playCard: getPlayer(output4, 'p4').hand[1],
//     playerId: 'p4',
//     trashCard: getPlayer(output4, 'p4').hand[0]
//   },
//   {
//     type: 'plan',
//     playCard: getPlayer(output4, 'p5').hand[1],
//     playerId: 'p5',
//     trashCard: getPlayer(output4, 'p5').hand[0]
//   }
// )
// const output5 = service(input5)

// const json = JSON.stringify(output5)
// fs.writeFileSync('output.json', json)

printEpisodes({
  start: 0,
  output: output2,
  playerId: 'p3'
})

// const { history, ...game } = output4.game
// const players = output4.players.map(player => {
//   const { history, ...rest } = player
//   return rest
// })

// console.log('game:', JSON.stringify(game, null, 2))
// console.log('players:', JSON.stringify(players, null, 2))
