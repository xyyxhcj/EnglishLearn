<template>
  <van-cell title="Select List" :value="listOptionsPopup.selectedStr" @click="listOptionsPopup.show = true" required/>
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
          <van-button type="success" icon="play-circle-o" round plain class="play-btn" @click="onPlay(key)"
                      v-if="!audioList[key].isPlay"/>
          <van-button icon="stop-circle-o" round plain class="play-btn" @click="onStop" v-else/>
          <van-switch v-model="showExamples[key]" size="24"/>
        </template>
      </van-cell>
      <div v-show="showExamples[key]" style="font-size: 16px!important">
        <van-button icon="eye-o" round @click="onShowAllDesc(key)" size="small"/>
        <li v-for="(example,i) in data[4].split(';')">
          <span class="word">{{ audioList[key].wordList[i] }}</span>
          <van-switch v-model="audioList[key].descList[i].isShow" size="20px" class="desc-switch"/>
          <span class="phonetic-symbol">
            <van-button :plain="CURRENT_PLAY_WORD!==audioList[key].wordList[i]+j" round type="primary"
                        @click="onPlaySingle(audioList[key].wordList[i],j)" size="mini"
                        v-for="(phonetic,j) in audioList[key].phoneticList[i].trim().split('/ /')">
              {{ phonetic.replace('/', '') }}
            </van-button>
          </span>
          <van-skeleton title :loading="!audioList[key].descList[i].isShow">
            <div>{{ audioList[key].descList[i]?.desc }}</div>
          </van-skeleton>
        </li>
      </div>
    </van-collapse-item>
  </van-collapse>

  <div class="save-insert-bottom_25"/>
  <van-overlay :show="loading">
    <div class="wrapper">
      <van-loading type="spinner" color="#1989fa"/>
    </div>
  </van-overlay>

  <van-popup v-model:show="listOptionsPopup.show" position="top" safe-area-inset-bottom class="popup-wrapper"
             transition-appear close-on-popstate>
    <div class="content-wrapper">
      <van-checkbox-group v-model="reqParameter.list" ref="checkboxGroup">
        <van-cell-group inset>
          <van-cell v-for="(item, index) in listOptionsPopup.options" clickable
                    :key="item[0]" :title="`List ${item[1]} ${item[2]}`" @click="checkboxToggle(index)">
            <template #right-icon>
              <van-checkbox
                  :name="item[0]" :ref="el => listOptionsPopup.checkboxRefs[index] = el" @click.stop/>
            </template>
          </van-cell>
        </van-cell-group>
      </van-checkbox-group>
    </div>
    <van-action-bar>
      <van-action-bar-button type="warning" text="Cancel" @click="listOptionsPopup.show=false" />
      <van-action-bar-button text="Check All" @click="checkAll" />
      <van-action-bar-button text="Toggle All" @click="toggleAll" />
      <van-action-bar-button type="primary" text="OK" @click="onConfirmSelectList" />
    </van-action-bar>
  </van-popup>
</template>

<script>
import {ref, reactive} from "vue";
import {post} from "@/common/request";
import UTILS from "@/common/utils";
import {Toast} from "vant";

export default {
  name: "Records",
  setup() {
    const YD_AUDIO_PRE = 'http://dict.youdao.com/dictvoice?type=0&audio=';
    const YD_EN_AUDIO_PRE = 'http://dict.youdao.com/dictvoice?type=1&audio=';
    const PLAY_AUDIO = new Audio();
    PLAY_AUDIO.preload = true;
    PLAY_AUDIO.controls = true;

    let CURRENT_PLAY_KEY = -1;
    let CURRENT_PLAY_WORD = ref('');
    const CURR_PLAY_LIST = ref([]);
    // control each button of play
    const audioList = ref([]);

    const checkboxGroup = ref(null);
    const listOptionsPopup = reactive({show: false, options: [], selectedStr: '', checkboxRefs: []});
    const checkboxToggle = (index) => {
      listOptionsPopup.checkboxRefs[index].toggle();
    };

    function stopPlay() {
      PLAY_AUDIO.removeEventListener('ended', playEndedHandler, false);
      PLAY_AUDIO.pause();
      if (CURRENT_PLAY_KEY !== -1) {
        audioList.value[CURRENT_PLAY_KEY].isPlay = false;
        CURRENT_PLAY_KEY = -1;
      }
      if (CURRENT_PLAY_WORD.value !== '') {
        CURRENT_PLAY_WORD.value = '';
      }
    }

    function playEndedHandler() {
      if (!CURR_PLAY_LIST.value.length) {
        stopPlay();
        return;
      }
      PLAY_AUDIO.src = CURR_PLAY_LIST.value.shift();
      PLAY_AUDIO.play();
    }

    // set default select
    const reqParameter = ref({
      type: null,
      list: []
    });

    const recordsTypeOption = [
      {text: 'All', value: null},
      {text: 'Suffix', value: 1},
      {text: 'Prefix', value: 2},
      {text: 'Root', value: 3},
    ];

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
        let wordList = [];
        let descList = [];
        data[4].split(';').forEach(example => {
          let trim = example.trim();
          let splitElement = trim.split(' ')[0];
          wordList.push(splitElement);
          descList.push({desc: trim.substring(splitElement.length), isShow: false});
          if (splitElement === '') {
            return;
          }
          exampleWordPlays.push(YD_AUDIO_PRE + splitElement);
        })

        audioList.value.push({
          isPlay: false,
          list: exampleWordPlays,
          wordList: wordList,
          descList: descList,
          phoneticList: data[7].split('|')
        });
      });
    }

    const onFlushDataList = () => {
      loading.value = true;
      post('/get_records_by_list', reqParameter.value).then(resp => {
        dataList.value = resp.data;
        onShuffle();
      }).finally(() => loading.value = false);
    }

    const onConfirmSelectList = () => {
      if (reqParameter.value.list.length < 1) {
        Toast.fail('At least select one');
        return;
      }
      listOptionsPopup.show = false;
      if (reqParameter.value.list.length < 10) {
        listOptionsPopup.selectedStr = reqParameter.value.list.join(',');
      } else {
        listOptionsPopup.selectedStr = reqParameter.value.list.slice(0, 9).join(',') + ' ...';
      }
      onFlushDataList();
    };

    const onPlay = (key) => {
      if (CURRENT_PLAY_KEY !== -1 || CURRENT_PLAY_WORD.value !== '') {
        // stop the old
        stopPlay();
      }
      let selectAudioObj = audioList.value[key];
      if (!selectAudioObj.list || selectAudioObj.list.length === 0) {
        return;
      }

      // sign the key
      CURR_PLAY_LIST.value = selectAudioObj.list.slice(0);
      PLAY_AUDIO.src = CURR_PLAY_LIST.value.shift();
      PLAY_AUDIO.addEventListener('ended', playEndedHandler, false);
      PLAY_AUDIO.loop = false;
      selectAudioObj.isPlay = true;
      CURRENT_PLAY_KEY = key;
      PLAY_AUDIO.play();
    }

    const onPlaySingle = (word, j) => {
      let currPlay = CURRENT_PLAY_WORD.value;
      if (CURRENT_PLAY_KEY !== -1 || currPlay !== '') {
        // stop the old
        stopPlay();
      }
      if (currPlay === word + j) {
        return;
      }
      let audioPre = j === 0 ? YD_EN_AUDIO_PRE : YD_AUDIO_PRE;
      PLAY_AUDIO.src = audioPre + word;
      PLAY_AUDIO.loop = true;
      CURRENT_PLAY_WORD.value = word + j;
      PLAY_AUDIO.play();
    }

    const onShowAllDesc = (key) => {
      let selectAudioObj = audioList.value[key];
      if (!selectAudioObj.list || selectAudioObj.list.length === 0 || !selectAudioObj.descList) {
        return;
      }
      selectAudioObj.descList.forEach(desc => desc.isShow = true);
    }

    const onStop = () => {
      stopPlay();
    }
    post('/get_lists').then(resp => listOptionsPopup.options = resp.data)
    // onFlushDataList();

    return {
      CURRENT_PLAY_WORD,
      recordsTypeOption,
      listOptionsPopup,
      checkboxToggle,
      reqParameter,
      dataList,
      activeNames,
      showExamples,
      audioList,
      loading,
      onShuffle,
      onFlushDataList,
      onConfirmSelectList,
      onPlay,
      onPlaySingle,
      onStop,
      onShowAllDesc,

      checkboxGroup,
      checkAll: () => checkboxGroup.value.toggleAll(true),
      toggleAll: () => checkboxGroup.value.toggleAll(),
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

.word {
  font-family: '微软雅黑', serif;
  font-size: 22px;
  font-weight: bold;
  margin-right: 5px;
}

.desc-switch {
  top: 2px;
}

.phonetic-symbol {
  font-size: 12px;
  display: flex;
}

.popup-wrapper {
  overflow: hidden;
  height: 100vh;
  width: 100%;
}

.content-wrapper {
  height: 94vh;
}

.bottom-btn {
  height: 6vh;
}

</style>