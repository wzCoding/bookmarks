declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}

declare module '*.scss' {
  const content: Record<string, string>
  export default content
}

declare module '*.svg' {
  const content: string
  export default content
}
