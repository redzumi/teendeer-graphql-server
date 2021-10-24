import { rule } from 'graphql-shield';

export const isAuthenticated = rule({ cache: 'contextual' })(async (parent, args, ctx, info) => {
  return ctx.user !== null
})

export const isAdmin = rule({ cache: 'contextual' })(async (parent, args, ctx, info) => {
  return ctx.user.role === 'admin'
})

export const isEditor = rule({ cache: 'contextual' })(async (parent, args, ctx, info) => {
  return ctx.user.role === 'editor'
})

// TODO: not correct, cuz we didnt know about true authorId of note or etc.
// export const isNoteOwner = rule()(async (parent, args, ctx, info) => {
//   return ctx.user.notesIds.some((id) => id === args._id)
// })

export const roles = {
  isAuthenticated,
  isAdmin,
  isEditor
};