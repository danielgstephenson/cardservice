import { service } from '.'
import { Episode, Input, InputEvent, Output, Player } from './external'

const sharedInput: Input = {
  gameId: 'g1',
  seed: 's2',
  startingPlayerId: 'p1',
  cardDetails: {
    ranks: [
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
      'Red',
      'Green',
      'Yellow',
      'Red',
      'Yellow',
      'Green',
      'Green',
      'Green',
      'Green',
      'Red',
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
      'Yellow',
      'Green',
      'Green',
      'Green'
    ],
    charges: [
      3,
      2,
      3,
      1,
      1,
      3,
      2,
      2,
      0,
      1,
      0,
      1,
      1,
      2,
      2,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      2,
      3
    ],
    firstPowers: [
      'Use the powers on the lowest rank green played card',
      'Put 1 pawn from the bank on the left side of your deck',
      'If the highest rank played card is red or yellow, earn 10 gold',
      'Use the powers on the lowest rank yellow played card',
      'If the 2 lowest rank palace cards are the same color, earn the higher rank in coins',
      'Draw 1 for each card in the dungeon',
      'Take 1 of your exiled cards into your hand',
      'If anyone played a card ranked lower than 8, take 1 of your exiled cards back into your hand',
      'If anyone other than you played a green card, take 2 pawns into your hand',
      'Use the powers on the lowest rank non-red played card',
      'Put 1 pawn on the right side of your deck',
      'Use the powers on the lowest rank non-red palace card',
      'Use the powers on the lowest rank yellow palace card',
      'Use the powers on the rightmost non-red card in your deck',
      'Use the powers on the rightmost yellow card in your deck',
      'Pay the rank of the rightmost card in your deck to the bank in coins',
      'Earn 25 gold',
      'If anyone played a card with 1 or more eyes, earn 15 gold',
      'Earn 5 gold for each color on the played cards',
      'If anyone played a yellow card, earn 20 gold',
      'Earn 5 gold for each card in the dungeon',
      'Earn twice the rank of the the biggest card in your deck',
      'Earn the lowest green played rank in coins',
      'If the rightmost card in your deck is green, draw 5',
      'If you have 50 or less gold, draw 5'
    ],
    secondPowers: [
      'Earn 5 gold',
      'Draw the 2 rightmost cards in your deck',
      'Move the leftmost card in your deck to the right side',
      'Earn 1 silver',
      'Swap the leftmost and rightmost cards in your deck',
      'Put 1 pawn from the bank on trial',
      'If your deck is empty, earn 15 gold',
      'Draw the number of colors on the played cards',
      'Draw a number of cards equal to the most eyes on any played card',
      'Use the powers on the lowest rank non-red dungeon card',
      'Draw a number of cards equal to the lowest rank in the dungeon',
      'Use the powers on the highest rank green played card or highest rank green dungeon card, whichever is higher',
      'Use the powers on the highest rank yellow played card or highest rank yellow dungeon card, whichever is higher',
      'Use the powers on the highest rank non-red dungeon card',
      'Use the powers on the lowest rank palace card',
      'Earn 25 gold',
      'Exile 1 card from your hand',
      'If your deck is empty, earn 10 gold',
      'Earn the lowest rank on any yellow played card in coins',
      'Earn 5 gold for each of your exiled cards',
      'Earn the highest rank in the dungeon in coins',
      'Move the biggest card in your deck to the left side',
      'Draw 5',
      'If the lowest or highest rank played card is green, draw 5',
      'If you have 5 or less cards in your deck, draw them all'
    ],
    bonusPowers: [
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
      'If you have this in play when you win an auction, you may take cards from the dungeon as well as the trial',
      'If you have this in play when you win an auction, you may take any of the cards you win directly into your hand',
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
    archive: 'dungeon',
    archivedTo: 'imprisoned in',
    card: 'card',
    Card: 'Card',
    cards: 'cards',
    Cards: 'Cards',
    center: 'palace',
    charge: 'eye',
    charges: 'eyes',
    deck: 'deck',
    earn: 'earn',
    highestRank: 'highest rank',
    inPlay: 'in play',
    isAddedToMarket: 'is put on trial',
    lowestRank: 'lowest rank',
    major: 'gold',
    market: 'trial',
    minor: 'silver',
    timeDoesNotPass: 'there is no scandal',
    trash: 'exile'
  }
}

const input1 = structuredClone(sharedInput)
const events1: InputEvent[] = []
input1.events = events1

console.log('Inputting for the first time...')
const output1 = service(input1)
function getPlayer (output: Output, playerId: string): Player {
  const player = output.players.find(player => player.id === playerId)
  if (player == null) {
    throw new Error(`${playerId} not found in output1`)
  }
  return player
}

const output1p1 = getPlayer(output1, 'p1')
const output1p2 = getPlayer(output1, 'p2')
const output1p3 = getPlayer(output1, 'p3')
const output1p4 = getPlayer(output1, 'p4')
const output1p5 = getPlayer(output1, 'p5')

console.log('Inputting for the second time...')
const input2 = structuredClone(sharedInput)
const events2: InputEvent[] = [
  ...input1.events,
  {
    type: 'plan',
    phase: 'play',
    playCard: output1p1.hand[0],
    trashCard: output1p1.hand[1],
    time: 1,
    userId: 'p1'
  },
  {
    type: 'plan',
    phase: 'play',
    playCard: output1p2.hand[0],
    trashCard: output1p2.hand[1],
    time: 2,
    userId: 'p2'
  },
  {
    type: 'plan',
    phase: 'play',
    playCard: output1p3.hand[0],
    trashCard: output1p3.hand[1],
    time: 3,
    userId: 'p3'
  },
  {
    type: 'plan',
    phase: 'play',
    playCard: output1p4.hand[0],
    trashCard: output1p4.hand[1],
    time: 4,
    userId: 'p4'
  },
  {
    type: 'plan',
    phase: 'play',
    playCard: output1p5.hand[0],
    trashCard: output1p5.hand[1],
    time: 5,
    userId: 'p5'
  }
]
input2.events = events2

const input3 = structuredClone(input2)
input3.events.push({
  type: 'bid',
  phase: 'auction',
  bid: 5,
  time: 6,
  userId: 'p1'
}, {
  type: 'concede',
  phase: 'auction',
  time: 7,
  userId: 'p2'
})
const output3 = service(input3)

function print (props: {
  depth?: number
  episodes: Array<Episode | undefined>
  path?: number[]
  notation?: boolean
}): void {
  const depth = props.depth ?? 0
  const notation = props.notation ?? false
  props.episodes.forEach((episode, index) => {
    if (episode == null) {
      console.info('--END OF HISTORY--')
      return
    }
    const path = props.path ?? []
    const newPath = [...path, index + 1]
    const joined = newPath.join('.')
    console.info(`${joined}. ${episode.message} ${notation && episode.groupId != null ? `[${episode.groupId}, ${episode.playerId ?? 'NO PLAYER'}]` : ''}`)
    print({
      depth: depth + 1,
      episodes: episode.children,
      path: newPath
    })
  })
}

function printEpisodes (props: {
  start: number
  end?: number
  output: Output
  playerId: string
}): void {
  const player = props.output.players.find(player => player.id === props.playerId)
  if (player == null) {
    throw new Error(`${props.playerId} not found`)
  }
  if (props.end == null || props.end > player.history.length) {
    const episode: Episode = {
      message: '--- End of history ---',
      children: [],
      time: Math.random(),
      id: Math.random().toString(36).substring(2, 15),
      firstInRound: false,
      round: Infinity
    }
    player.history.push(episode)
  }
  const episodes = player.history.slice(props.start, props.end)
  print({ episodes })
}

printEpisodes({
  start: 0,
  output: output3,
  playerId: 'p3'
})
