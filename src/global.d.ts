declare module '*.jpg'
declare module '*.pdf'

interface PathSegment {
  path: number[][],
  color: number[],
  id: number
}

interface LineSegment {
  from: number[],
  to: number[],
  color: number[],
  id: number
}

interface DDBRow {
  createTime: number,
  lastAccessTime: number,
  deleteTime: number,
  value: string
}

interface IRow {
  /** Index of the point, from 0-21 */
  index: number,
  /** Number of measurements */
  measurements: number,
  /** Type of the sample {@link RowType} */
  type: string,
  /**
   * Normalized offset relative to the left in a figure width of {@link NORMALIZED_WIDTH}
   */
  normOffsetX: number,
  /** Normalized offset relative to the top in a figure height of {@link NORMALIZED_HEIGHT} */
  normOffsetY: number,
  isHovered: boolean,
  /** Moisture at the sample*/
  moisture?: number[],
  /** Shears at the sample */
  shear?: number[],
}
