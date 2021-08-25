/** stuff like how to check wins, how many required to win are on gameState level */
export interface BoardConfig {
  /** the size of the board */
  size: number
  /** the recursive depth of the board */
  depth: number
}

export const defaultBoardConfig = {
  size: 3,
  depth: 2,
} as Readonly<BoardConfig>