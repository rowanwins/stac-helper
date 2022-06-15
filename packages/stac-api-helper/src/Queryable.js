import URI from 'urijs'
import {getWithJsonResponse, getValueFromObjectUsingPath} from './utils'

export class Queryable {
    constructor (id, json) {
        this.id = id
        this._rawJson = json
        this._referenceJson = null
    }

    get titleOrId () {
        if ('title' in this.usableDefinition) return this.usableDefinition.title
        return this.id
    }

    get _requiresReferenceJson () {
        if ('type' in this._rawJson) return false
        else if ('$ref' in this._rawJson) return true
        return false
    }

    get usableDefinition () {
        if (!this._requiresReferenceJson || this._referenceJson === null) return this._rawJson
        return this._referenceJson
    }

    get inputType () {
        return this.usableDefinition.type
    }

    async getReference () {
        if (!this._requiresReferenceJson) return
        const referenceUrl = this._rawJson.$ref
        const json = await getWithJsonResponse(referenceUrl)
        const uri = new URI(referenceUrl)
        const hash = uri.hash()
        const hashComponents = hash.replace('#/', '').split('/')
        const obj = getValueFromObjectUsingPath(json, hashComponents)
        if (obj !== null) this._referenceJson = obj
    }
}
