// Assertation 1: Operations must have a unique operationId.

const pickBy = require("lodash/pickBy")
const reduce = require("lodash/reduce")
const merge = require("lodash/merge")
const each = require("lodash/each")

module.exports.validate = function({ jsSpec }) {
  let errors = []
  let warnings = []

  let validOperationKeys = ["get", "head", "post", "put", "patch", "delete", "options", "trace"]

  let operations = reduce(jsSpec.paths, (arr, path, pathKey) => {
    let pathOps = pickBy(path, (obj, k) => {
      return validOperationKeys.indexOf(k) > -1
    })
    each(pathOps, (op, opKey) => arr.push(merge({
      path: `paths.${pathKey}.${opKey}`
    }, op)))
    return arr
  }, [])

  let seenOperationIds = {}

  let tallyOperationId = (operationId) => {
    let prev = seenOperationIds[operationId]
    seenOperationIds[operationId] = true
    // returns if it was previously seen
    return !!prev
  }

  operations.forEach(op => {
    // wrap in an if, since operationIds are not required
    if(op.operationId) {
      let hasBeenSeen = tallyOperationId(op.operationId)
      if(hasBeenSeen) {
        errors.push({
          path: op.path + ".operationId",
          message: "operationIds must be unique"
        })
      }
    }
  })

  return { errors, warnings }
}
