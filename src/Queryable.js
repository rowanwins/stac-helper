import URI from 'urijs'

import {getWithJsonResponse, getValueFromObjectUsingPath} from './utils.js'

/**
 * Provides a Class for working with a Queryable object, often used in searching collections.
 * @class
 */
export class Queryable {

    /**
     * @param {string} id - The id of the queryable
     * @param {JSON} [json] - The json of the queryable definition
     */
    constructor (id, json) {

        /**
         * The ID of the queryable
         * @type {string}
         */
        this.id = id

        /**
         * The JSON of the definition as provided at the queryables endpoint
         * @type {JSON}
         * @private
         */
        this._rawJson = json

        /**
         * Any additional JSON that was required to complete the definition
         * @type {JSON}
         * @private
         */
        this._referenceJson = null
    }

    /**
     * Gets the title if present, or the ID
     * @return {string}
     */
    get titleOrId () {
        if ('title' in this.usableDefinition) return this.usableDefinition.title
        return this.id
    }

    /**
     * A boolean indicating if more reference JSON is required to be loaded
     * @private
     * @return {boolean}
     */
    get _requiresReferenceJson () {
        if ('type' in this._rawJson) return false
        else if ('$ref' in this._rawJson) return true
        return false
    }

    /**
     * The usable JSON definition, either directly from the queryable or its reference.
     * @return {JSON}
     */
    get usableDefinition () {
        if (!this._requiresReferenceJson || this._referenceJson === null) return this._rawJson
        return this._referenceJson
    }

    /**
     * A string indicating the type of field, eg 'number' or 'string'
     * @return {string}
     */
    get inputType () {
        return this.usableDefinition.type
    }

    /**
     * Loads the reference JSON if required
     * @return {Promise<>}
     */
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
