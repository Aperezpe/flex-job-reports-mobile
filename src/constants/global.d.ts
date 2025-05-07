declare module '*.png' {
  const value: number; // Expo asset module returns a number (the module ID)
  export default value;
}