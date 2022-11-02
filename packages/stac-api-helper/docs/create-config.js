import {writeJsonFileSync} from 'write-json-file'
import * as documentation from 'documentation'

documentation.build(['./src/**.js']).then((res) => {

    documentation.formats.json(res).then((docs) => {
        docs = JSON.parse(docs)
        //   const parent = (docs.length > 1) ? pckg.name : null
        console.log(docs.map(d => d.name))
        const out = docs.map((metadata, indx) => {
            const moduleObj = {}
            if (metadata.augments.length > 0) {
                metadata.augments.forEach((a) => {
                    const completeA = docs.find(m => m.name === a.name)
                    if (completeA) {
                        metadata.params.push(...completeA.params)
                        metadata.members.instance.push(...completeA.members.instance)
                    }
                })
            }

            if (moduleObj) {
                moduleObj.name = metadata.name
                moduleObj.description = getDescription(metadata)
                moduleObj.snippet = getSnippet(metadata)
                moduleObj.methods = getMethods(metadata)
                moduleObj.properties = getProperties(metadata)
                moduleObj.example = getExample(metadata)
                moduleObj.returns = getReturns(metadata)
                moduleObj.params = getParams(metadata)
                moduleObj.options = getOptions(metadata)
                moduleObj.throws = getThrows(metadata)
            }
            return moduleObj
        })
        writeJsonFileSync('./docs/assets/config.json', out)
    })
})

function getDescription (metadata) {
    return concatTags(metadata.description.children[0].children, true)
}

function getSnippet (metadata) {
    const example = metadata.examples[0]
    if (example) return example.description
    return false
}

function getExample (metadata) {
    const example = metadata.examples[0]
    if (example) return example.description
    return false
}

function getReturns (metadata) {
    if (!metadata.returns) return false
    return metadata.returns.map(result => getType(result.type)).toString()
}

function getThrows (metadata) {
    if (!metadata.throws) return false
    return metadata.throws.map((result) => {
        if (!result.description.children.length) return false
        return {
            type: getType(result.type),
            desc: concatTags(result.description.children[0].children, false)
        }
    })
}

function getProperties (metadata) {
    if (!metadata.members) return false
    const outProperties = metadata.members.instance.map((property) => {
        if (!property.description.children.length) return false
        return {
            name: property.name,
            returns: getReturns(property),
            description: concatTags(property.description.children[0].children)
        }
    })
    return outProperties
}

function getMethods (metadata) {
    if (!metadata.members) return false
    const outMethods = metadata.members.instance.filter(m => m.kind === 'function').map((method) => {
        if (!method.description.children.length) return false
        return {
            name: method.name,
            returns: getReturns(method),
            description: concatTags(method.description.children[0].children)
        }
    })
    return outMethods
}

function getParams (metadata) {
    if (!metadata.params) return false
    const outParams = metadata.params.map((param) => {
        if (!param.type) return {type: null}
        if (!param.description.children.length) return false
        return {
            name: param.name,
            type: createLink(param.type),
            default: param.default,
            description: concatTags(param.description.children[0].children),
        }
    })
    return outParams
}

function getOptions (metadata) {
    if (!metadata.params) return false
    const options = metadata.params.filter(({name}) => name === 'options')
    if (options.length === 0) return null

    const outParams = options[0].properties.map((prop) => {
        const defaultVal = prop.default ? prop.default.replace('\\', '') : null
        return {
            Prop: prop.name.replace('options.', ''),
            Type: createLink(prop.type),
            Default: defaultVal,
            Description: createLink(prop.description.children[0].children[0])
        }
    })
    return outParams
}

function concatTags (inNode) {
    if (!inNode) return false
    let outDescr = inNode.map((node) => {
        if (node.children) {
            return createLink(node.children[0])
        }
        return node.value
    })
    outDescr = outDescr.join(' ').replace(' .', '.')
    if (outDescr === 'Optional parameters') outDescr = outDescr.concat(': see below')
    return outDescr
}

function getType (inNode) {
    if (!inNode) return false
    return createLink(inNode)
}

// Object.keys(docs.paths).forEach(name => {
//   docs.paths[name.toUpperCase()] = docs.paths[name]
// })

function getLink (name) {
    // console.log(name)
    return null
    // return docs.paths[name.toUpperCase()] || null
}

function createLink (node) {
    let name
    switch (node.type) {
    case 'text':
        name = node.value
        break
    case 'AllLiteral':
        name = '*'
        break
    case 'NameExpression':
        name = node.name
        break
    case 'UndefinedLiteral':
        name = 'undefined'
        break
    case 'NullLiteral':
        name = 'null'
        break
    case 'RestType':
        return `...${createLink(node.expression)}`
    case 'TypeApplication':
        return `${createLink(node.expression)} <${node.applications.map(application => createLink(application)).join('|')}>`
    case 'OptionalType':
        return `(${createLink(node.expression)})`
    case 'UnionType':
        return `(${node.elements.map(element => createLink(element)).join('|')})`
    default:
        console.log(node)
        throw new Error(`${node  } not supported`)
    }
    const link = getLink(name)
    if (link === null) return name
    return `<a target="_blank" href="${link}">${name}</a>`
}
