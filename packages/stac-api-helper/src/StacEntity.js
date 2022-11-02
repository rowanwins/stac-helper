import {Parser, HtmlRenderer} from 'commonmark'
import resolveRelative from 'resolve-relative-url'

import {sniffStacType, getWithJsonResponse, createStacItemFromDataAndType, getLinkByRelType} from './utils.js'
import {createValidFetchUrl, isRelativeUrl, isValidHttpUrl} from './urlUtils.js'

const reader = new Parser()
const writer = new HtmlRenderer({safe: true, smart: true})


/**
 * This is the parent class for Stac Catalog, Stac Collection or Stac Items.
 * It contains functionality that are common across all
 * @class
 */
export class StacEntity {

    /**
     * Create a STAC Entity, a generic holder for Catalog, Collection or Item which has share functionality.
     * @param {json} json The raw json of the stac entity
     * @param {string | null} [url=null] The url of the stac entity
     * @param {StacEntity | null} [parent = null] The parent class that created this stac entity
     * @param {json | null} [linkThatCreatedThis = null] The entire link object that loaded the json
     */
    constructor (json, url = null, parent = null, linkThatCreatedThis = null) {

        /**
         * The id of the stac entity
         * @type {string}
         * @public
         * @return {string}
         */
        this.id = json.id

        /**
         * The json of the stac entity as originally retrieved. This object is
         * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze|frozen} to prevent modification.
         * @type {json}
         * @return {json}
         * @public
         */
        this.rawJson = Object.freeze(json)

        /**
         * The base url of the stac entity (similar to linkToSelf)
         * @type {string|null}
         * @return {string|null}
         * @public
         */
        this.url = url

        /**
         * The parent stac entity class
         * @type {StacEntity|null}
         * @return {StacEntity|null}
         * @public
         */
        this.parent = parent

        /**
         * The json link object that was used to create this stac entity
         * @type {json|null}
         * @public
         */
        this.linkThatCreatedThis = linkThatCreatedThis
    }

    /**
     * Gets the type of stac entity. One of either 'Catalog', 'Collection' or 'Item'.
     * @return {string} The stac entity type
     */
    get stacType () {
        return ''
    }

    /**
     * Gets a string of either the title, or if not present, the id
     * @return {string} The stac entity's title or id
     */
    get titleOrId () {
        return this.title !== null ? this.rawJson.title : this.rawJson.id
    }

    /**
     * Get' a string of either the title, or if not present null
     * @return {string | null} The stac entity's title or null
     */
    get title () {
        return 'title' in this.rawJson ? this.rawJson.title : null
    }

    /**
     * Gets a description as rendered html using commonmark, or null
     * @return {string | null} The stac entity's description as a html string, or null
     */
    get descriptionAsHtml () {
        if (!('description' in this.rawJson)) return null
        return writer.render(reader.parse(this.rawJson.description))
    }

    /**
    * Gets this stac entity's url
    * @return {string | null} The stac entity's url
    */
    get linkToSelf () {
        if (this.url !== null) return this.url
        const selfLink = getLinkByRelType(this.rawJson, 'self')
        if (selfLink !== null) {
            if (isRelativeUrl(selfLink.href)) {
                return resolveRelative(selfLink.href, this.url)
            }
            return selfLink.href
        }

        // Try navigate up the tree if this StacEntity doesn't have a self link
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

    /**
    * A boolean indicating if a parent link is found in the raw json
    * @return {boolean}
    */
    get hasParent () {
        if (this.rawJson.links.findIndex(i => i.rel === 'parent') > -1) return true
        if (this.stacType === 'Item' && this.rawJson.links.findIndex(i => i.rel === 'collection') > -1) return true
        return false
    }

    /**
    * If present the parent's link url, or null
    * @return {string | null}
    */
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

    /**
    * A boolean indicating if this entity represents the root entity
    * @return {boolean}
    */
    get isRoot () {
        if (this.linkToRoot !== null) {
            if (this.url === this.linkToRoot) return true
            if (this.url === `${this.linkToRoot}/`) return true
            if (`${this.url}/` === this.linkToRoot) return true
            return false
        }
        return null
    }

    /**
    * A boolean indicating if this entity has a root entity
    * @return {boolean}
    */
    get hasRoot () {
        return this.rawJson.links.findIndex(i => i.rel === 'root') !== -1
    }

    /**
    * If present the parent's root url, or null
    * @return {string | null}
    */
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

    /**
    * A boolean indicating if the parent entity is the root entity
    * @return {boolean}
    */
    get parentIsRoot () {
        if (this.linkToParent === null) return null
        return this.linkToRoot === this.linkToParent
    }

    /**
    * A boolean indicating if entity has assets
    * @return {boolean}
    */
    get hasAssets () {
        return 'assets' in this.rawJson
    }

    /**
    * The number of assets present. If none then 0 is returned
    * @return {number}
    */
    get numberOfAssets () {
        if (!this.hasAssets) return 0
        return Object.keys(this.rawJson.assets).length
    }

    /**
    * The url of the thumbnail asset
    * @return {string}
    */
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

    /**
    * The url of the overview asset
    * @return {string}
    */
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

    /**
    * A valid http url for the thumbnail asset, if it exists.
    * @return {string | null}
    */
    get validHttpThumbnailUrl () {
        if (!isValidHttpUrl(this.thumbnailUrl)) return null
        return this.thumbnailUrl
    }

    /**
    * A valid http url for the overview asset, if it exists.
    * @return {string | null}
    */
    get validHttpOverviewUrl () {
        if (!isValidHttpUrl(this.overviewUrl)) return null
        return this.overviewUrl
    }

    /**
     * Gets the type of parent stac entity. One of either 'Catalog', 'Collection' or 'Item'.
     * @return {string | null} The stac entity type. Or null if a parent is not present.
     */
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

    /**
    * A boolean indicating if entity supports the filter extension for searching.
    * @return {boolean}
    */
    get supportsFilterExtension () {
        return this.rawJson.conformsTo.find(l => l.indexOf('item-search#filter') > -1) !== undefined
    }

    /**
     * @private
     */
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

    /**
     * Loads (if required) and returns the parent as it's StacEntity Class.
     * @return {Promise<StacEntity | null>}
     */
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

    /**
     * Loads (if required) and returns the root entity as it's StacEntity Class.
     * @return {Promise<StacEntity | null>}
     */
    async loadRoot () {
        if (this.linkToRoot === null) return null
        if (this.linkToRoot === this.url) return null
        const out = await this._loadLink(this.linkToRoot)
        if (out !== null) return out
        return null
    }
}
