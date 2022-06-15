import {getWithJsonResponse} from './utils'
import {Queryable} from './Queryable'

export default class MixinQueryables {
    initializer () {
        this.queryablesLoaded = false
        this.queryablesJson = {}
        this.queryablesArray = []
    }

    get numberOfPagesLoaded () {
        return this._pageIndex
    }

    get queryablesLink () {
        return `${this.linkToSelf}/queryables`
    }

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
}
