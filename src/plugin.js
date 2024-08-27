/* global kiwi:true */

import { EmojiIndex } from 'emoji-mart-vue-fast/src';
import 'emoji-mart-vue-fast/css/emoji-mart.css';
import EmojiData from 'emoji-mart-vue-fast/data/all.json';
import { transparentPixel } from 'emoji-mart-vue-fast/src/utils/emoji-data';
import EmojiPicker from '@/components/EmojiPicker.vue';
import * as config from '@/config.js';
import * as EmojiProvider from '@/libs/EmojiProvider.js';
import '@/res/style.scss';

import AnimatedEmojiData from '../static/emojis_gif_64/data.json';

kiwi.plugin('emojis', (kiwi) => {
    config.setDefaults(kiwi);

    const emojiIndex = new EmojiIndex(EmojiData, {
        include: config.setting('categoryInclude'),
        exclude: config.setting('categoryExclude'),
        custom: config.setting('customEmojis'),
        recent: config.setting('frequentlyUsedList'),
        recentLength: config.setting('frequentlyUsedLength'),
        externalEmojis: config.setting('externalEmojis') || AnimatedEmojiData,
        externalUrl: config.setting('externalUrl'),
    });
    kiwi['plugin-emojis'] = Object.create(null);
    kiwi['plugin-emojis'].emojiIndex = emojiIndex;

    kiwi.replaceModule('libs/EmojiProvider', EmojiProvider);
    kiwi.replaceModule('components/inputtools/Emoji', EmojiPicker);

    kiwi.state.$once('network.connecting', () => {
        // Preload emoji sheet
        const img = document.createElement('img');
        img.className = `emoji-set-${config.setting('emojiSet')} emoji-type-image`;
        img.style = 'width: 1px; height: 1px; position: absolute; left: -10px;';
        document.body.appendChild(img);

        // Two ticks are required to append the child
        // and start loading the background-image
        kiwi.Vue.nextTick(() => {
            kiwi.Vue.nextTick(() => {
                document.body.removeChild(img);
            });
        });
    });

    const warningEmoji = emojiIndex.findEmoji('warning');
    window.emojiLoaded = (event) => {
        if (event.target.src !== transparentPixel) {
            event.target.style.imageBackground = 'unset';
        }
    };
    window.emojiError = (event) => {
        event.target.src = transparentPixel;
        const style = event.target.style;
        if (!style.backgroundPosition) {
            // style: `background-position: ${emojiRaw.getPosition()}; height: 1.2em; vertical-align: -0.3em;`,
            style.backgroundPosition = warningEmoji.getPosition();
            style.height = '1.2em';
            style.verticalAlign = '-0.3em';
        }
        console.log('warningEmoji', warningEmoji);
    };

    kiwi.Vue.watch(
        () => config.setting('externalEnabled'),
        () => {
            kiwi.state.networks.forEach((network) => {
                // Re-render messages with user colours
                Object.values(network.buffers).forEach((buffer) => {
                    buffer.getMessages().forEach((msg) => {
                        if (msg.html.indexOf('kiwi-messagelist-emoji') > -1) {
                            msg.hasRendered = false;
                        }
                    });
                });
            });
        }
    );
});
