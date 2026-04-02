import sharpImport from 'sharp'

const sharp =
  typeof sharpImport === 'function' ? sharpImport : sharpImport.default

export function getNativeModule() {
  return null
}

export { sharp }

export default sharp
