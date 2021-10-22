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

export const isOwner = rule()(async (parent, args, ctx, info) => {
  return ctx.user.items.some((id) => id === parent.id)
})

export const roles = {
  isAuthenticated,
  isAdmin,
  isEditor,
  isOwner
};