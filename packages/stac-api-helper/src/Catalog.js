import aggregation from 'aggregation/es6'
import {StacEntity} from './internal.js'
import ChildrenMixin from './MixinChildren.js'

export class Catalog extends aggregation(StacEntity, ChildrenMixin) {
    get stacType () {
        return 'Catalog'
    }
}
