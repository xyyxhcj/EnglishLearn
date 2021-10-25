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
        <van-tag type="primary">{{ key + 1 }}</van-tag>
        {{ data[2] }}
      </template>
      <van-image width="100" :src="data[6]" v-if="data[6]"/>
      {{ data[3] }}
      <van-cell center title="Show Example">
        <template #right-icon>
          <van-button type="success" icon="play-circle-o" round size="mini" plain class="play-btn" @click="onPlay(key)"
                      v-if="!audioList[key].isPlay"/>
          <van-button icon="stop-circle-o" round size="mini" plain class="play-btn" @click="onStop" v-else/>
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

  <div class="save-insert-bottom_25"/>
  <van-calendar v-model:show="showSelectDate" type="range" @confirm="onConfirmSelectDate" :min-date="recordMinDate"
                :max-date="recordMaxDate" :allow-same-day="true" :default-date="null"/>
  <van-overlay :show="loading">
    <div class="wrapper">
      <van-loading type="spinner" color="#1989fa"/>
    </div>
  </van-overlay>
</template>

<script>
import {ref} from "vue";
import {post} from "@/common/request";
import UTILS from "@/common/utils";

export default {
  name: "Records",
  setup() {
    const YD_AUDIO_PRE = 'http://dict.youdao.com/dictvoice?type=0&audio=';
    const PLAY_AUDIO = new Audio();
    PLAY_AUDIO.preload = true;
    PLAY_AUDIO.controls = true;
    PLAY_AUDIO.loop = false;
    let CURRENT_PLAY_KEY = -1;
    const CURR_PLAY_LIST = ref([]);
    // control each button of play
    const audioList = ref([]);

    function stopPlay() {
      PLAY_AUDIO.removeEventListener('ended', playEndedHandler, false);
      PLAY_AUDIO.pause();
      if (CURRENT_PLAY_KEY === -1) {
        return;
      }
      audioList.value[CURRENT_PLAY_KEY].isPlay = false;
      CURRENT_PLAY_KEY = -1;
    }

    function playEndedHandler() {
      if (!CURR_PLAY_LIST.value.length) {
        stopPlay();
        return;
      }
      PLAY_AUDIO.src = CURR_PLAY_LIST.value.shift();
      PLAY_AUDIO.play();
    }

    function funcFormatDate(date) {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    // set default select
    let now = new Date();
    let start = new Date(new Date().setDate(now.getDate() - 2));
    const selectDataText = ref('');
    const reqParameter = ref({
      type: null,
      start: start.toLocaleDateString().replace(/\//g, "-"),
      end: now.toLocaleDateString().replace(/\//g, "-")
    });
    selectDataText.value = `${funcFormatDate(start)} - ${funcFormatDate(now)}`;

    const recordsTypeOption = [
      {text: 'All', value: null},
      {text: 'Suffix', value: 1},
      {text: 'Prefix', value: 2},
      {text: 'Root', value: 3},
    ];

    const showSelectDate = ref(false);

    const dataList = ref([]);
    const activeNames = ref([]);
    const showExamples = ref([]);
    const loading = ref(false);

    const onShuffle = () => {
      UTILS.shuffle(dataList.value);
      activeNames.value.length = 0;
      showExamples.value.length = 0;
      audioList.value.length = 0;
      dataList.value.forEach((data) => {
        showExamples.value.push(false);
        let exampleWordPlays = [];
        data[4].split(';').forEach(example => {
          exampleWordPlays.push(YD_AUDIO_PRE + example.trim().split(' ')[0]);
        })
        audioList.value.push({isPlay: false, list: exampleWordPlays});
      });

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

    const onPlay = (key) => {
      if (CURRENT_PLAY_KEY !== -1) {
        // stop the old
        stopPlay();
      }
      let selectAudioObj = audioList.value[key];
      if (!selectAudioObj.list || selectAudioObj.list.length === 0) {
        return;
      }

      // sign the key
      CURRENT_PLAY_KEY = key;
      selectAudioObj.isPlay = true;
      CURR_PLAY_LIST.value = selectAudioObj.list.slice(0);
      PLAY_AUDIO.src = CURR_PLAY_LIST.value.shift();
      PLAY_AUDIO.addEventListener('ended', playEndedHandler, false);

      PLAY_AUDIO.play();
    }

    const onStop = () => {
      stopPlay();
    }
    // get recordMinDate & recordMaxDate
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
      audioList,
      loading,
      onShuffle,
      onFlushDataList,
      onConfirmSelectDate,
      onPlay,
      onStop,
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

.play-btn {
  margin-right: 25px;
}

.save-insert-bottom_25 {
  height: 25px;
}

</style>