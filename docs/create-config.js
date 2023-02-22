import {writeJsonFileSync} from 'write-json-file'
import * as documentation from 'documentation'

documentation.build(['./src/**.js']).then((res) => {
    documentation.formats.json(res).then((docs) => {
        docs = JSON.parse(docs)
        //   const parent = (docs.length > 1) ? pckg.name : null
        console.log(docs.map(d => d.name))
        const out = docs.map((metadata) => {
            const moduleObj = {}
            if (metadata.augments.length > 0) {
                metadata.augments.forEach((a) => {
                    const augmented = docs.find(m => m.name === a.name)
                    if (augmented) {
                        const uniqueAugmentedParams = augmented.params.filter(p => metadata.params.findIndex(p2 => p2.name === p.name) === -1)
                        metadata.params.push(...uniqueAugmentedParams)


                        const uniqueAugmentedMembers = augmented.members.instance.filter(p => metadata.members.instance.findIndex(p2 => p2.name === p.name) === -1 && p.name !== 'initializer')
                        metadata.members.instance.push(...uniqueAugmentedMembers)
                    }
                })
            }
            // console.log(metadata)
            // const moduleObj = getModuleObj(metadata.name)
            if (moduleObj) {
                moduleObj.name = metadata.name
                // moduleObj.parent = parent
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
    if (metadata.returns.length === 0 && metadata.type) {
        if ('type' in metadata.type) return getType(metadata.type)
    }
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
    const outProperties = metadata.members.instance.filter(m => m.kind !== 'function').map((property) => {
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
            arguments: getParams(method),
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
    return outDescr
}

function getType (inNode) {
    if (!inNode) return false
    return createLink(inNode)
}

const links = {
    BOOLEAN: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean',
    ARRAY: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
    STRING: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String',
    NULL: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null',
    JSON: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON',
    NUMBER: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number',
    PROMISE: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
    ITEMCOLLECTION: '/api/itemcollection',
    'STAC ITEM COLLECTION': 'https://github.com/radiantearth/stac-api-spec/blob/main/fragments/itemcollection/README.md',
    COLLECTION: '/api/collection',
    'STAC COLLECTION': 'https://github.com/radiantearth/stac-spec/blob/master/collection-spec/collection-spec.md',
    CATALOG: '/api/catalog',
    'STAC CATALOG': 'https://github.com/radiantearth/stac-spec/blob/master/catalog-spec/catalog-spec.md',
    ITEM: '/api/item',
    'STAC ITEM': 'https://github.com/radiantearth/stac-spec/blob/master/item-spec/item-spec.md',
    STACENTITY: '/api/stac-entity',
    SEARCH: '/api/search'
}

function getLink (name) {
    return links[name.toUpperCase()] || null
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
        throw new Error(`${node  } not supported`)
    }
    const link = getLink(name)
    if (link === null) return name
    if (link.indexOf('://') > -1) return `<a target="_blank" href="${link}">${name}</a>`
    return `<a href="${link}">${name}</a>`
}
