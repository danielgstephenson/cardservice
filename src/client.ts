import { service } from '.'
import { Input, Output, Player } from './external'

const input1: Input = {
  gameId: 'g1',
  seed: 's2',
  startingPlayerId: 'p1',
  cardDetails: {
    ranks: [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25
    ],
    colors: [
      'Green',
      'Red',
      'Yellow',
      'Green',
      'Red',
      'Yellow',
      'Green',
      'Green',
      'Green',
      'Green',
      'Red',
      'Green',
      'Green',
      'Red',
      'Red',
      'Red',
      'Red',
      'Yellow',
      'Yellow',
      'Yellow',
      'Yellow',
      'Yellow',
      'Yellow',
      'Green',
      'Green',
      'Green'
    ],
    charges: [
      3,
      3,
      2,
      2,
      1,
      1,
      3,
      3,
      0,
      0,
      1,
      0,
      0,
      3,
      2,
      2,
      2,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      2,
      1
    ],
    firstPowers: [
      'Move the leftmost card in your draw row to the right side',
      'Copy the lowest rank green card in play',
      'Earn 10 gold',
      'Draw 1 for each card in the dungeon',
      'Copy the lowest rank yellow card in play',
      'If the 2 lowest rank cards in the center row are the same color, earn the higher rank',
      'Draw the highest rank card in your draw row',
      'Draw 1',
      'Take 1 pawn from the bank into your hand',
      'If anyone played a card ranked lower than 9, take 1 of your exiled cards back into your hand',
      'Copy the lowest rank non-red card in play',
      'Draw 2',
      'Put 1 pawn from the bank on the right side of your draw row',
      'If the rightmost card in your draw row is yellow, copy it',
      'If the rightmost card in your draw row is not red, copy it',
      'Copy the lowest rank yellow card in the center row',
      'Copy the lowest rank card in the center',
      'Pay the rank of the rightmost city in your draw row in gold and silver',
      'Earn 25 gold',
      'Earn 10 gold for each yellow card in your draw row',
      'Earn 5 gold for each color in play',
      'Earn 5 gold for each card in the dungeon',
      'If the rightmost card in your draw row is yellow, earn twice its rank in gold and silver',
      'Earn the lowest green rank in play in gold and silver',
      'If the rightmost card in your draw row is green, draw 5',
      'If you have 50 or less gold, draw 5'
    ],
    secondPowers: [
      'Draw a number of cards equal to the lowest time on any card in play',
      'Earn 5 gold',
      'Move the lowest rank card in your draw row to the right side',
      'Put 1 pawn from the bank on trial',
      'Earn 1 silver',
      'Swap the leftmost and rightmost cards in your draw row',
      'Move the highest rank card in your draw row to the left side',
      'Put 1 pawn from the bank on the left side of your draw row',
      'Draw a number of cards equal to the highest unrest on any city in play',
      'Draw the number of colors in play',
      'Copy the lowest rank non-red card in the dungeon',
      'Take 1 of your exiled cards into your hand',
      'Draw a number of cards equal to the lowest rank in the dungoen',
      'Copy the biggest green card in play or in the dungeon',
      'Copy the lowest rank of all green and yellow cards in the center row',
      'Copy the highest rank yellow card in play or in the dungeon',
      'Copy the highest rank non-red card in the dungeon',
      'Earn 25 gold',
      'Exile 1 card from your hand',
      'Earn 5 gold for each of your exiled cards',
      'Earn the lowest yellow rank in play in gold and silver',
      'Earn the highest rank in the dungeon in gold and silver',
      'Move the rightmost card in your battle to the left side',
      'Draw 3',
      'If the lowest or highest rank card in play is green, draw 5',
      'If you have 5 or less cards in your draw row, draw 5'
    ],
    bonusPowers: [
      '',
      'If you have this in play when another player wins the auction, you may take 1 of your exiled cards into your hand',
      '',
      '',
      'If you have this in play during the auction, you may bid silver',
      '',
      '',
      '',
      '',
      '',
      'If you have this in play during the auction, your bid is increased by 10',
      '',
      '',
      'If you have this in play when you win an auction, you may take any of the cards you win directly into your hand',
      'If you have this in play when you win an auction, you may take cards from the dungeon as well as the trial',
      'If you have this in play when you win an auction, you may take any number of cards from the dungeon into your hand',
      'If you have this in play when another player wins the auction, you may take any number of your exiled cards into your hand',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    ]
  },
  playerCount: 5,
  players: [
    { id: 'p1', userId: 'u1', name: 'n1' },
    { id: 'p2', userId: 'u2', name: 'n2' },
    { id: 'p3', userId: 'u3', name: 'n3' },
    { id: 'p4', userId: 'u4', name: 'n4' },
    { id: 'p5', userId: 'u5', name: 'n5' }
  ],
  events: [],
  names: {
    card: 'card',
    Card: 'Card',
    cards: 'cards',
    Cards: 'Cards',
    market: 'trial',
    isAddedToMarket: 'is put on trial',
    archive: 'dungeon',
    archivedTo: 'imprisoned in',
    lowestRank: 'lowest rank',
    deck: 'deck',
    center: 'timeline',
    trash: 'exile'
  }
}

function getPlayer (output: Output, playerId: string): Player {
  const player = output1.players.find(player => player.id === playerId)
  if (player == null) {
    throw new Error(`${playerId} not found in output1`)
  }
  return player
}

const output1 = service(input1)
const output1p1 = getPlayer(output1, 'p1')
const output1p2 = getPlayer(output1, 'p2')
const output1p3 = getPlayer(output1, 'p3')
const output1p4 = getPlayer(output1, 'p4')
const output1p5 = getPlayer(output1, 'p5')

const input2 = structuredClone(input1)
console.log('input2.seed', input2.seed)
input2.events.push({
  type: 'plan',
  phase: 'play',
  playCard: output1p1.hand[0],
  trashCard: output1p1.hand[1],
  time: 1,
  userId: 'p1'
})
input2.events.push({
  type: 'plan',
  phase: 'play',
  playCard: output1p2.hand[0],
  trashCard: output1p2.hand[1],
  time: 2,
  userId: 'p2'
})
input2.events.push({
  type: 'plan',
  phase: 'play',
  playCard: output1p3.hand[0],
  trashCard: output1p3.hand[1],
  time: 3,
  userId: 'p3'
})
input2.events.push({
  type: 'plan',
  phase: 'play',
  playCard: output1p4.hand[0],
  trashCard: output1p4.hand[1],
  time: 4,
  userId: 'p4'
})
input2.events.push({
  type: 'plan',
  phase: 'play',
  playCard: output1p5.hand[0],
  trashCard: output1p5.hand[1],
  time: 5,
  userId: 'p5'
})

const output2 = service(input2)
void output2
const output2p1 = output2.players.find(player => player.id === 'p1')
if (output2p1 == null) {
  throw new Error('p1 not found in output2')
}

// output2.game.history.forEach(episode => {
//   console.log(episode.message)
//   episode.children.forEach(child => {
//     console.log(child.message)
//   })
// })

const details = {
  // hand: output2p1.hand,
  // play: output2p1.play,
  // trash: output2p1.trash,
  playerHistory: [
    output2p1.history[2],
    output2p1.history[3],
    output2p1.history[4],
    output2p1.history[5],
    output2p1.history[6],
    output2p1.history[7],
    output2p1.history[8]
  ]
  // publicHistory: output2.game.history
}
const pretty = JSON.stringify(details, null, 2)
console.log(pretty)
