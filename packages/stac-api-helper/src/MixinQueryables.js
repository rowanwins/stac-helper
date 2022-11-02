import {getWithJsonResponse} from './utils.js'
import {Queryable} from './Queryable.js'

/**
 * This provides properties and methods for working with STAC Queryables,
 * it is not used directly.
 * @mixin
 */
export default class MixinQueryables {

    initializer () {
        this.queryablesLoaded = false
        this.queryablesJson = {}
        this.queryablesArray = []
    }

    get queryablesLink () {
        return `${this.linkToSelf}/queryables`
    }

    async retrieveQueryables () {
        if (Object.keys(this.queryablesJson).length > 0) return this.queryablesJson

        const json = await getWithJsonResponse(this.queryablesLink)
        if (json === null) return json

        Object.assign(this.queryablesJson, json.properties)
        const keys = Object.keys(this.queryablesJson);
        for (let index = 0; index < keys.length; index++) {
            const key = keys[index]
            const q = new Queryable(key, this.queryablesJson[key])
            await q.getReference()
            this.queryablesArray.push(q)
        }
        this.queryablesLoaded = true
        return json
    }

    getQueryableById (id) {
        return this.queryablesArray.find(q => q.id === id)
    }
}
