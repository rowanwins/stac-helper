import aggregation from 'aggregation/es6'
import {StacThing} from './internal.js'
import ChildrenMixin from './MixinChildren.js'

export class Catalog extends aggregation(StacThing, ChildrenMixin) {
    get stacType () {
        return 'Catalog'
    }
}
