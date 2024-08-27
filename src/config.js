/* global kiwi:true */

export const basePath = getBasePath();
export const configBase = 'plugin-emojis';
// eslint-disable-next-line no-undef
export const buildVersion = __VERSION__;

export const defaultConfig = {
    sendNativeEmojis: true,
    parseEmoticons: true,
    parseColons: true,
    parseNative: true,
    imageTitle: 'name', // 'name', 'colons', 'native', ''
    emojiSet: 'google', // 'apple', 'google', 'twitter', 'facebook', 'native'
    pickerProps: {
        emoji: 'point_up',
        title: '',
        perLine: 8,
    },
    frequentlyUsedList: undefined,
    frequentlyUsedLength: 16,
    categoryInclude: undefined,
    categoryExclude: undefined,
    customEmojis: [
        {
            name: 'Kiwi IRC',
            short_names: ['kiwiirc'],
            text: '',
            emoticons: [],
            keywords: [],
            imageUrl: 'static/favicon.png',
        },
    ],
    externalEnabled: true,
    externalPicker: 'none', // 'all', 'hover', 'none'
    externalUrl: 'static/plugin-emojis/emojis_gif_64/%CODEPOINT%.gif',
    // externalUrl:
    //     `https://cdn.jsdelivr.net/gh/kiwiirc/plugin-emojis@v${buildVersion}/static/emojis_png_64/%CODEPOINT%.png`,
};

export function setDefaults(kiwi) {
    kiwi.setConfigDefaults(configBase, defaultConfig);
}

export function setting(name) {
    return kiwi.state.setting([configBase, name].join('.'));
}

export function getSetting(name) {
    return kiwi.state.getSetting(['settings', configBase, name].join('.'));
}

export function setSetting(name, value) {
    return kiwi.state.setSetting(['settings', configBase, name].join('.'), value);
}

function getBasePath() {
    const scripts = document.getElementsByTagName('script');
    const scriptPath = scripts[scripts.length - 1].src;
    return scriptPath.substring(0, scriptPath.lastIndexOf('/') + 1);
}
