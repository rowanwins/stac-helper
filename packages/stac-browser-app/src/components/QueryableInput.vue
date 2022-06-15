<template>

  <a-popover placement="bottomLeft" trigger="click" v-model:visible="queryableVisible" :arrowPointAtCenter="false">
    <template #content>
      <ARow>
        <ACol :span="18">
          <h4>{{queryable.queryable.titleOrId}}</h4>
        </ACol>
        <ACol :span="6">
          <p class="linkText" @click="$emit('remove-filter', queryableIndex)">Remove</p>
        </ACol>
      </ARow>
      <ARow>

      </ARow>
      <ARow style="margin-bottom: 16px;">
        <ACol :span="24" class="operatorRadio">
          <ARadioGroup
            button-style="solid"
            style="width: 100%;"
            v-model:value="queryable.operator"
          >
            <ARadioButton
              v-for="(operator, index) in operatorOptions"
              :key="index"
              :value="operator.symbol"
            >
              {{operator.label}}
            </ARadioButton>
          </ARadioGroup>
        </ACol>
      </ARow>
      <ARow>
        <ACol :span="24">
        
          <AInputNumber
            v-if="queryableType === 'numberField'" 
            style="width:100%;" 
            v-model:value="queryable.value"
            :min="queryableDefinition.minimum ? queryableDefinition.minimum : Infinity"
            :max="queryableDefinition.maximum ? queryableDefinition.maximum : Infinity"
          />
          <AInput
            v-else-if="queryableType === 'textField'"
            style="width:100%;"
            v-model:value="queryable.value"
          />
          <ASelect
            v-else-if="queryableType === 'selectField'"
            :options="queryableOptions"
            style="width:100%;"
            v-model:value="queryable.value"
          />
        </ACol>
      </ARow>
    </template>

    <ATag @click="queryableVisible = true" class="queryableTag">
      {{queryableCompleteString}}
      <CaretDownFilled />
    </ATag>
  </a-popover>

</template>

<script>
import { CloseCircleOutlined, CaretDownFilled } from '@ant-design/icons-vue'

export default {
  name: 'QueryableInput',
  props: ['queryable', 'queryable-index'],
  data () {
    return {
      queryableVisible: false
    }
  },
  components: {
    CloseCircleOutlined,
    CaretDownFilled
  },
  emits: ['remove-filter'],
  mounted () {
    if (this.queryable.operator === null) this.queryableVisible = true
    if (this.queryable.operator === null) this.queryable.operator = this.operatorOptions[0].symbol
    if (this.queryable.value === null) this.queryable.value = this.calculateDefaultValue()
  },
  computed: {
    queryableCompleteString () {
      if (this.queryable.operator === null) return this.queryable.queryable.titleOrId
      return `${this.queryable.queryable.titleOrId} ${this.queryable.operator} ${this.queryable.value}`
    },
    queryableDefinition () {
      return this.queryable.queryable.usableDefinition
    },
    queryableType () {
      if (this.queryableDefinition.type === 'number' || this.queryableDefinition.type === 'integer') return 'numberField'
      else if ('enum' in this.queryableDefinition) return 'selectField'
      else if (this.queryableDefinition.type === 'string') return 'textField'
    },
    operatorOptions () {
      const LESS_THAN = {label: 'Less Than', symbol: '<'}
      const MORE_THAN = {label: 'More Than', symbol: '>'}
      const EQUALS = {label: 'Equals', symbol: '='}
      const NOT_EQUALS = {label: 'Not Equals', symbol: '<>'}
      const LIKE = {label: 'Like', symbol: 'LIKE'}

      if (this.queryableType === 'numberField') return [LESS_THAN, MORE_THAN]
      else if (this.queryableType === 'textField') return [EQUALS, NOT_EQUALS, LIKE]
      else if (this.queryableType === 'selectField') return [EQUALS, NOT_EQUALS]
      return null
    },
    queryableOptions () {
      if (this.queryableType !== 'selectField') return []
      else {
        return this.queryableDefinition.enum.map((option) => {
          if (typeof option === 'string') {
            return {
              value: option,
              label: option
            }
          } else {
            return option
          }
        })
      }
    },
    selectedOperator () {
      if (this.operatorOptions === null) return null
      return this.operatorOptions.find(o => o.symbol === this.queryable.operator)
    }
  },
  methods: {
    setOperator (e) {
      this.queryable.operator = e.target.value
    },
    calculateDefaultValue () {
      if (this.queryableType === 'textField') return ''
      else if (this.queryableType === 'numberField') {
        if (this.queryableDefinition.minimum) {
         return this.queryableDefinition.minimum
        }
        return 0
      } else if (this.queryableType === 'selectField') {
        return this.queryableOptions[0].value
      }
    }
  }
}
</script>

<style lang="less">
  @import '@/styles/theme.less';

  .linkText {
    color: @secondary-color;
    font-weight: 500;
    font-size: 0.8rem;
    cursor: pointer;
  }
  .operatorRadio {
    .ant-radio-group {
      background: @grey-200;
      padding: 4px;
      border-radius: 4px;
    }

    .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)::before {
      background: none;
    }
    .ant-radio-group-solid .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):focus-within {
      box-shadow: none;
    }
    .ant-radio-button-wrapper:not(:first-child)::before {
      display: none;
    }

    .ant-radio-button-wrapper {
      font-size: 0.8rem;
      background: none;
      border: none;
    }
    .ant-radio-button-wrapper-checked {
      color: @grey-900!important;
      font-weight: 500;
      background: white!important;
      border: none!important;
      border-radius: 4px!important;
      box-shadow: 0px 8px 24px rgba(103,103,103,0.15);
    }    
  }

.queryableTag {
  cursor: pointer;
  transition: 0.1s;
  &:hover {
    background-color: @grey-200;
  }
}

</style>