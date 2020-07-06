<template>
    <div>
        <VueDropdown
            v-model="selected"
            :isCheckType="false"
            :selectboxData="items"
            :allValue="true"
            :allText="'전체 발행주기'"
            style="width:150px"
        ></VueDropdown>
    </div>
</template>

<script>
    export default {
        name: "IssuanceCycleDropdown",
        components: {
            VueDropdown: () => import("@/components/custom/VueDropdown")
        },
        data() {
            return {
                selected: null,
                items: [
                    {
                        key: "weekly",
                        value: "주간"
                    },
                    {
                        key: "monthly",
                        value: "월간"
                    },
                    {
                        key: "quarter",
                        value: "분기"
                    }
                ]
            }
        },
        watch: {
            selected(newValue, oldValue){
                if (newValue !== oldValue)
                    this.$emit('input', newValue);
            }
        }
    }
</script>

<style scoped>
</style>