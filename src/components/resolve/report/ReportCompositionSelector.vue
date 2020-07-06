<template>
    <div>
        <ul class="flex_left weekend">
            <li>
                <div class="checkLabel">
                    <input
                        type="checkbox"
                        class="k-checkbox"
                        id="selectAll$1"
                        v-model="selectAll$1"
                    />
                    <label class="k-checkbox-label" for="selectAll$1">전체</label>
                </div>
            </li>

            <li v-for="item in list" :key="item.idx">
                <div class="checkLabel">
                    <input
                        type="checkbox"
                        class="k-checkbox"
                        v-model="tmpSelected"
                        :id="`item_${item.idx}`"
                        :value="`${item.idx}`"
                    />
                    <label
                        class="k-checkbox-label"
                        :for="`item_${item.idx}`"
                    >{{ item.title }}</label>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>``
    export default {
        name: "ReportCompositionSelector",
        props: ['value'],
        data() {
            return {
                // selectAll: false,
                tmpSelected: [],
                list: [
                    {
                        idx: 1,
                        title: "장비현황"
                    },
                    {
                        idx: 2,
                        title: "운전현황"
                    },
                    {
                        idx: 3,
                        title: "에너지 소비현황"
                    },
                    {
                        idx: 4,
                        title: "기기 점검 현황"
                    },
                    {
                        idx: 5,
                        title: "실내 공기질 현황"
                    }
                ]
            }
        },
        computed: {
            selectAll$1: {
                get() {
                    return this.list.length > 0 ? this.tmpSelected.length === this.list.length : false;
                },
                set(checked) {
                    this.tmpSelected = [];
                    if (checked) {
                        this.list.forEach(v =>
                            this.tmpSelected.push(v.idx)
                        );
                    }
                }
            }
        },
        watch: {
            value(newValue) {
                console.log(`Given the changed items from parent`);
                this.tmpSelected = newValue
            },
            tmpSelected(newValue) {
                console.log(`Set the changed items ${newValue}`);
                this.$emit('input', newValue)
            },
        },
        created(){
            // TODO: get items from the API
        }
    }
Array.prototype.unique = function() {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
}
</script>

<style lang="scss" scoped>

</style>