/**
 * 驼峰写法
 * @param  {String} str 要转化的字符串
 * @return {String}     转化后的字符串
 */
'use strict';

function camelCase(str) {
    return str.replace(/-([a-z])/g, function ($0, $1) {
        return $1.toUpperCase();
    }).replace('-', '');
}

/**
 * 格式化css属性对象
 * @param  {Object} props 属性对象
 * @return {Object}       添加前缀的格式化属性对象
 */
function formatCss(props) {
    var prefixs = ['-webkit-', '-moz-', '-ms-'];

    var result = {};

    var regPrefix = /transform|transition|animation/;

    for (var key in props) {
        if (props.hasOwnProperty(key)) {
            var styleValue = props[key];

            // 如果检测是transform或transition属性
            if (regPrefix.test(key)) {
                for (var i = 0; i < prefixs.length; i++) {
                    var styleName = camelCase(prefixs[i] + key);
                    result[styleName] = styleValue.replace(regPrefix, prefixs[i] + '$&');
                }
            }

            result[key] = styleValue;
        }
    }

    return result;
}