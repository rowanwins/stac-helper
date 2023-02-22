import {getWithJsonResponse} from './utils.js'
import {Queryable} from './Queryable.js'

/**
 * This provides properties and methods for working with STAC Queryables,
 * it is not used directly.
 * @mixin
 */
export default class QueryablesMixin {

    /**
     * Initialiser for mixin
     */
    initializer () {

        /**
        * A boolean indicating if the queryables have been loaded for the STAC Entity using the retrieveQueryables method
        * @return {boolean}
        */
        this.queryablesLoaded = false

        /**
        * The raw json from the queryables endpoint
        * @return {JSON}
        */
        this.queryablesJson = {}

        /**
        * An array of Queryable instances for the STAC Entity
        * @return {Array<Queryable>}
        */
        this.queryablesArray = []
    }

    /**
     * Predicts the queryables URL for the STAC Entity
     * @return {string}
     */
    get queryablesLink () {
        return `${this.linkToSelf}/queryables`
    }

    /**
     * Loads (if required) and returns the the queryables JSON, and sets queryablesLoaded to true.
     * @return {Promise<JSON>}
     */
    async retrieveQueryables () {
        if (Object.keys(this.queryablesJson).length > 0) return this.queryablesJson

        const json = await getWithJsonResponse(this.queryablesLink)
        this.queryablesLoaded = true
        if (json === null) return json

        Object.assign(this.queryablesJson, json.properties)
        const keys = Object.keys(this.queryablesJson);
        for (let index = 0; index < keys.length; index++) {
            const key = keys[index]
            const q = new Queryable(key, this.queryablesJson[key])
            await q.getReference()
            this.queryablesArray.push(q)
        }
        return json
    }

    /**
     * Gets a Queryable instance by its ID
     * @return {Queryable}
     */
    getQueryableById (id) {
        return this.queryablesArray.find(q => q.id === id)
    }
}
