type Setup = {
  x: number
}

type Episode = {
  x: number
}

type Input = {
  step: Setup
  episodes: Episode[]
}

type Output = {
  x: number
}

type Service = (input: Input) => Output

const service: Service = (input) => {
  return {x: 0}
}

console.log('test')