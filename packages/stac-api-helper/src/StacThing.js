import {Parser, HtmlRenderer} from 'commonmark'
import {sniffStacType, getWithJsonResponse, createStacItemFromDataAndType} from './utils.js'
import {createValidFetchUrl, isRelativeUrl} from './urlUtils.js'
import resolveRelative from 'resolve-relative-url'


const reader = new Parser()
const writer = new HtmlRenderer({safe: true, smart: true})

// This is the parent class for Stac Catalog, Stac Collection or Stac Items
// It contains functionality that are common across all
export class StacThing {

    constructor (json, url = null, parent = null) {
        this.id = json.id
        this.url = url
        this.rawJson = json
        this.parent = parent

        Object.freeze(this.rawJson)
    }

    get stacType () {
        return ''
    }

    get titleOrId () {
        return this.rawJson.title ? this.rawJson.title : this.rawJson.id
    }

    get descriptionAsHtml () {
        if (!('description' in this.rawJson)) return null
        return writer.render(reader.parse(this.rawJson.description))
    }

    get linkToSelf () {
        if (this.url !== null) return this.url
        if (this.rawJson.links.findIndex(i => i.rel === 'self') !== -1) {
            const selfUrl = this.rawJson.links.find(i => i.rel === 'self').href
            if (isRelativeUrl(selfUrl)) {
                return resolveRelative(selfUrl, this.url)
            }
            return selfUrl
        }

        // Try navigate up the tree if StacThing doesn't have a self link
        if (this.parent && this.parent.rawJson.links.findIndex(l => l.title === this.id) > -1) {
            const parentUrl = this.parent.rawJson.links.find(l => l.title === this.id).href
            if (isRelativeUrl(parentUrl)) {
                return resolveRelative(parentUrl, this.url)
            }
            return parentUrl
        }

        // This seems bad, think it's a remnant from old STAC Spec
        // Eg maxar catalog v0.8.1
        if (this.rawJson.links.findIndex(i => i.rel === 'root') !== -1) {
            const rootUrl = this.rawJson.links.find(i => i.rel === 'root').href
            if (isRelativeUrl(rootUrl)) {
                return resolveRelative(rootUrl, this.url)
            }
        }
        return null
    }

    get hasParent () {
        if (this.rawJson.links.findIndex(i => i.rel === 'parent') > -1) return true
        if (this.stacType === 'Item' && this.rawJson.links.findIndex(i => i.rel === 'collection') > -1) return true
        return false
    }

    get linkToParent () {
        if (this.hasParent && this.rawJson.links.findIndex(i => i.rel === 'parent') > -1) {
            const parentUrl = this.rawJson.links.find(i => i.rel === 'parent').href
            if (isRelativeUrl(parentUrl)) {
                return resolveRelative(parentUrl, this.url)
            }
            return parentUrl
        }
        if (this.stacType === 'Item') return this.rawJson.links.find(i => i.rel === 'collection').href
        return null
    }

    get isRoot () {
        if (this.linkToRoot !== null) {
            if (this.url === this.linkToRoot) return true
            if (this.url === this.linkToRoot + '/') return true
            if (this.url + '/' === this.linkToRoot) return true
            return false
        }
        return null
    }

    get hasRoot () {
        return this.rawJson.links.findIndex(i => i.rel === 'root') !== -1
    }

    get linkToRoot () {
        if (this.hasRoot) {
            const rootUrl = this.rawJson.links.find(i => i.rel === 'root').href
            if (isRelativeUrl(rootUrl)) {
                return resolveRelative(rootUrl, this.url)
            }
            return rootUrl
        }
        return null
    }

    get parentIsRoot () {
        if (this.linkToParent === null) return null
        return this.linkToRoot === this.linkToParent
    }

    get hasAssets () {
        return 'assets' in this.rawJson
    }

    get numberOfAssets () {
        if (!this.hasAssets) return 0
        return Object.keys(this.rawJson.assets).length
    }

    get thumbnailUrl () {
        if (this.numberOfAssets === 0) return null
        for (const [key, value] of Object.entries(this.rawJson.assets)) {
            if ('roles' in value) {
                if (value.roles.indexOf('thumbnail') > -1) {
                    return this.rawJson.assets[key].href
                }
            }
        }
        return null
    }

    get overviewUrl () {
        if (this.numberOfAssets === 0) return null
        for (const [key, value] of Object.entries(this.rawJson.assets)) {
            if ('roles' in value) {
                if (value.roles.indexOf('overview') > -1) {
                    return this.rawJson.assets[key].href
                }
            }
        }
        return null
    }

    get parentType () {
        if (this.parent === null) return null
        return this.parent.stacType
    }

    get licenseTypeAndLink () {
        if (!this.rawJson.license) return null
        return {
            licenseName: this.rawJson.license,
            link: this.rawJson.links.find(l => l.rel === 'license')
        }
    }

    async _loadLink (link) {
        if (link === null) return null
        const validUrl = createValidFetchUrl(link, this)
        const data = await getWithJsonResponse(link)
        if (data) {
            const stacType = sniffStacType(data)
            if (stacType === 'Catalog' || stacType === 'Collection') {
                return createStacItemFromDataAndType(data, stacType, validUrl, null)
            }
        }
        return null
    }

    async loadParent () {
        if (this.parent !== null) return this.parent
        if (this.hasParent) {
            const validUrl = createValidFetchUrl(this.linkToParent, this)
            const out = await this._loadLink(validUrl)
            if (out !== null) {
                this.parent = out
                return this.parent
            }
        } else if (this.hasRoot) {
            const root = await this.loadRoot()
            if (root !== null) {
                this.parent = root
                return this.parent
            }
        }
        return null
    }

    async loadRoot () {
        if (this.linkToRoot === null) return null
        if (this.linkToRoot === this.url) return null
        const out = await this._loadLink(this.linkToRoot)
        if (out !== null) return out
        return null
    }
}
