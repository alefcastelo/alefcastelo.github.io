/**
 * The fixed set of reactions, in display order. Changing it takes a deploy;
 * removing an emoji also takes a migration that deletes its reactions.
 */
export const REACTION_EMOJIS = ['👍', '❤️', '🎉', '🤔', '👀'] as const

export type ReactionEmoji = (typeof REACTION_EMOJIS)[number]

export function isReactionEmoji(value: string): value is ReactionEmoji {
  return (REACTION_EMOJIS as ReadonlyArray<string>).includes(value)
}
