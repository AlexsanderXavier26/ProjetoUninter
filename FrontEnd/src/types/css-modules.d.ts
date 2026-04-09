// Declaração de tipos para CSS Modules
declare module '*.module.css' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}
