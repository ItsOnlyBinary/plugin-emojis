import emojione from 'emojione'
import { Emoji, Picker } from 'emoji-mart-vue'
import platform from 'platform'
import GraphemeSplitter from 'grapheme-splitter'

// polyfill
if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    'use strict';
    if (typeof start !== 'number') {
      start = 0;
    }
    
    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

// mobile check
window.mobilecheck = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

kiwi.plugin('emoji', function (kiwi, log) {

  if(mobilecheck()) {
    console.log("Mobile browser detected. Blocking installation of emoji plugin (because mobile OS's have their own emoji pickers)");
    return;
  }

  function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild; 
  }

  emojione.imagePathPNG = kiwi.state.settings.emojiLocation;
  const emojiTool = document.createElement('i');
  emojiTool.className = 'fa fa-thumbs-up';
  kiwi.addUi('input', emojiTool);
  emojiTool.onclick = function (e){
    if (pickerVisible) {
      hideEmojiPicker();
    } else {
      showEmojiPicker();
    }
  }

  let pickerVisible = false;
  let isWindowsLessThan10 = platform.os.family.substring(0, 7).toLowerCase() === 'windows' && platform.os.version < 10; 
  kiwi.on('message.poststyle', (event) => {
    if (event.message.type !== 'privmsg') return;
    let splitter = new GraphemeSplitter();
    let split = splitter.splitGraphemes(event.message.html);
    for(let i = 0; i < split.length; ++i) {
      if (split[i].length > 1) {
        let img = emojione.unicodeToImage(split[i]);
        if(img.substring(0,4) === '<img') split[i] = img.substring(0,4) + (split.length === 1 ? ' style="width:32px; line-height: 2em;"' : ' style="width: 16px; line-height:1em;"') + img.substring(4);
      }
    }
    event.message.html = split.join('');
  });

  const MyComponent = window.kiwi.Vue.extend({
    template: `
      <div>
          <picker set="emojione" :native="useNative()" :style="{ position: 'absolute', zIndex: 10, bottom: '60px', right: '20px' }" title="Pick your emoji…" emoji="point_up"  @select="onEmojiSelected" />
      </div>`,
    components: {
      Picker
    },
    props: ['emoji', 'ircinput'],
    methods: {
      useNative () {
          return platform.name !== 'IE' && !isWindowsLessThan10;
      },
      onEmojiSelected (emoji) {
        this.$nextTick(function () {
          if(this.useNative()) {
            emojiTool.controlinput.$refs.input.insertText(emoji.native);
          } else {
            let img = createElementFromHTML(emojione.unicodeToImage(emoji.native));
            emojiTool.controlinput.$refs.input.addImg(emoji.native, img.src);
          }
        });
      }
    }
  });

  var emojiPicker = new MyComponent();
  emojiPicker.$mount();

  function showEmojiPicker() {
    document.querySelector('body').appendChild(emojiPicker.$el);
    pickerVisible = true;
  }

  function hideEmojiPicker() {
    document.querySelector('body').removeChild(emojiPicker.$el);
    pickerVisible = false;
  }

  kiwi.on('document.clicked', function (e) {
    if (pickerVisible && e.target.className !== 'fa fa-thumbs-up') hideEmojiPicker();
  });
})
