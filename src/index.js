/**
 * Data is stored column-wise in a single 1D Array
 */
export class Matrix {
  constructor (array, rows, cols) {
    // array must be valid
    if (!array || !Array.isArray(array)) {
      throw new Error('Array must be valid')
    }

    // try and work out no. of rows and columns
    if (rows === undefined && cols === undefined) {
      if (!Array.isArray(array[0])) {
        throw new Error('Array must be 2D if rows and cols omitted');
      }

      rows = array.length
      cols = array[0].length
      // flatten array
      array = array.reduce((m, v) => m.concat(v), [])
    }

    if (1 > rows) {
      throw new Error("Rows must be >= 1")
    }

    if (1 > cols) {
      throw new Error("Columns must be >= 1")
    }

    if (array.length !== rows * cols) {
      throw new Error("Array length doesn't match rows * cols")
    }

    this._array = array
    this._rows = rows
    this._cols = cols

    // instanceof is expensive so we use this flag instead
    this.isMatrix = true
  }

  static zero(rows, cols) {
    return new Matrix(new Array(rows * cols).fill(0), rows, cols);
  }

  static rand(rows, cols) {
    const len = rows * cols;

    const a = new Array(len);
    for (let i = 0; len > i; ++i) {
      a[i] = Math.random();
    }

    return new Matrix(a, rows, cols);
  }

  get rows() {
    return this._rows
  }

  get cols() {
    return this._cols
  }

  toArray () {
    return Array.from(this._array)
  }

  fn (fn) {
    for (let i = 0; i < this._array.length; ++i) {
      this._array[i] = fn(this._array[i], i % this._rows, ~~(i / this._rows))
    }

    return this
  }
}

// Basic element-wise maths
[
  ['plus', '+'],
  ['minus', '-'],
  ['times', '*'],
  ['divideBy', '/']
].forEach(([ methodName, operator ]) => {
  Matrix.prototype[methodName] = Function('val', `
    if (val && val.isMatrix) {
      if (val._rows !== this._rows) {
        throw new Error(\`Broadcast matrix has \${val._rows} rows instead of \${this._rows}\`)
      }

      if (1 === val._cols) {
        for (let i = 0; i < this._array.length; ++i) {
          this._array[i] ${operator}= val._array[i % this._rows]
        }
      } else {
        if (val._cols !== this._cols) {
          throw new Error(\`Broadcast matrix has \${val._cols} columns instead of 1 or \${this._cols}\`)
        }

        for (let i = 0; i < this._array.length; ++i) {
          this._array[i] ${operator}= val._array[i]
        }
      }
    } else {
      for (let i = 0; i < this._array.length; ++i) {
        this._array[i] ${operator}= val
      }
    }

    return this
  `)
})


export const sum = (m, axis) => {
  if ('columns' === axis) {
    let ret = new Array(m._cols)

    for (let col = 0; col < m._cols; ++col) {
      let sum = 0

      let index = col * m._rows
      const endIndex = index + m._rows

      while (endIndex > index) {
        sum += m._array[index]

        index++
      }

      ret[col] = sum
    }

    return new Matrix(ret, 1, m._cols)
  } else if ('rows' === axis) {
    let ret = new Array(m._rows)

    for (let row = 0; row < m._rows; ++row) {
      let sum = 0

      let index = row
      const endIndex = index + m._cols * m._rows

      while (endIndex > index) {
        sum += m._array[index]

        index += m._rows
      }

      ret[row] = sum
    }

    return new Matrix(ret, m._rows, 1)
  } else {
    throw new Error(`Invalid axis: ${axis}`)
  }
}

export const clone = m => new Matrix(Array.from(m._array), m._rows, m._cols)

export const trans = m => {
  const a = new Array(m._array.length)

  for (let j = 0; j < m._cols; ++j) {
    for (let i = 0; i < m._rows; ++i) {
      a[i * m._cols + j] = m._array[j * m._rows + i]
    }
  }

  return new Matrix(a, m._cols, m._rows)
}


// export const dot = (m1, m2) => {
//   if (m1._cols !== m2._rows) {
//     throw new Error(`Invalid dot product: ${m1._rows} x ${m1._cols} . ${m2._rows} x ${m2._cols}`)
//   }
//
//
// }
