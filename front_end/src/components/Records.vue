<template>
  <van-cell title="Select Date Range" :value="selectDataText" @click="showSelectDate = true"/>
  <van-dropdown-menu>
    <van-dropdown-item v-model="reqParameter.type" :options="recordsTypeOption" @change="onFlushDataList"/>
    <van-dropdown-item :disabled="true">
      <template #title>
        <van-button type="danger" size="small" @click="onShuffle">Shuffle</van-button>
      </template>
    </van-dropdown-item>

  </van-dropdown-menu>
  <van-collapse v-model="activeNames">
    <van-collapse-item v-for="(data,key) in dataList" :key="key" :name="key">
      <template #title>
        <van-tag type="primary">{{ key+1 }}</van-tag>
        {{data[2]}}
      </template>
      {{ data[3] }}
      <van-cell center title="Show Example">
        <template #right-icon>
          <van-switch v-model="showExamples[key]" size="24"/>
        </template>
      </van-cell>
      <div v-show="showExamples[key]" style="font-size: 16px!important">
        <li v-for="(example,i) in data[4].split(';')">
          {{ example }}
        </li>
      </div>
    </van-collapse-item>
  </van-collapse>
  <van-calendar v-model:show="showSelectDate" type="range" @confirm="onConfirmSelectDate" :min-date="recordMinDate"
                :max-date="recordMaxDate" :allow-same-day="true" :default-date="null"/>
  <van-overlay :show="loading">
    <div class="wrapper">
      <van-loading type="spinner" color="#1989fa" />
    </div>
  </van-overlay>
</template>

<script>
import {ref} from "vue";
import CONSTS from "@/common/consts";
import {post} from "@/common/request";
import UTILS from "@/common/utils";

export default {
  name: "Records",
  setup() {
    const reqParameter = ref({
      type: CONSTS.RECORDS_TYPE.SUFFIX,
      start: null,
      end: null
    });

    const recordsTypeOption = [
      {text: 'All', value: null},
      {text: 'Suffix', value: 1},
      {text: 'Prefix', value: 2},
    ];
    const selectDataText = ref('');
    const showSelectDate = ref(false);
    const funcFormatDate = (date) => `${date.getMonth() + 1}/${date.getDate()}`;

    const dataList = ref([]);
    const activeNames = ref([]);
    const showExamples = ref([]);
    const loading = ref(false);

    const onShuffle = () => {
      UTILS.shuffle(dataList.value);
      activeNames.value.length = 0;
      showExamples.value.length = 0;
      dataList.value.forEach(() => showExamples.value.push(false));
    }

    const onFlushDataList = () => {
      loading.value = true;
      post('/get_records', reqParameter.value).then(resp => {
        dataList.value = resp.data;
        onShuffle();
      }).finally(() => loading.value = false);
    }

    const onConfirmSelectDate = (values) => {
      showSelectDate.value = false;
      reqParameter.value.start = values[0].toLocaleDateString().replace(/\//g, "-");
      reqParameter.value.end = values[1].toLocaleDateString().replace(/\//g, "-");
      selectDataText.value = `${funcFormatDate(values[0])} - ${funcFormatDate(values[1])}`;
      onFlushDataList();
    };

    // get recordMinDate & recordMaxDate
    let now = new Date();
    const recordMinDate = ref(now);
    const recordMaxDate = ref(now);
    post('/get_records_min_max_date').then(resp => {
      [recordMinDate.value, recordMaxDate.value] = [new Date(resp.data[0][0]), new Date(resp.data[0][1])];
    })

    onFlushDataList();

    return {
      recordsTypeOption,
      selectDataText,
      showSelectDate,
      recordMinDate,
      recordMaxDate,
      reqParameter,
      dataList,
      activeNames,
      showExamples,
      loading,
      onShuffle,
      onFlushDataList,
      onConfirmSelectDate,
    };
  }
}
</script>

<style scoped>
.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

</style>