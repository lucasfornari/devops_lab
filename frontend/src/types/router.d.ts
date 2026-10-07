import 'vue-router'
import type { Papel } from '.'

declare module 'vue-router' {
  interface RouteMeta {
    requerAuth?: boolean
    papeis?: Papel[]
  }
}
