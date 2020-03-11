/**
 * 查找并处理某些属性值是函数的对象
 * @param {Object} source 源对象
 * @param {Object} target 目标对象
 */
const processPropertyIsFunction = (source, target) => {
    if (typeof source !== 'object' || source === null) {
        return;
    }
    for (const key in source) {
        if (!source.hasOwnProperty(key)) {
            continue;
        }
        const value = source[key];
        if (typeof value === 'function') {
            target[key] = value;
        } else if (typeof value === 'object') {
            if (value instanceof Array) {
                value.forEach((item, index) => {
                    processPropertyIsFunction(item, target[key][index]);
                });
            } else {
                processPropertyIsFunction(value, target[key]);
            }
        }
    }
};

/**
 * 克隆对象
 * @param {Object} source 要克隆的源对象
 * @returns {Object} 返回克隆后的结果
 */
export default source => {
    let content = JSON.stringify(source);
    let target = JSON.parse(content);
    // 特殊处理属性值是函数的问题
    processPropertyIsFunction(source, target);
    return target;
};
