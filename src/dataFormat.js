/**
 * DataFormat类定义
 */
class DataFormat {
    /**
     * 数值格式化逻辑
     * @param {Number} value 要格式化的数值
     * @param {Object | Number} formatOption 格式化选项，
     *      如果是Object，含有两个属性：
     *          small:（绝对值小于10部分）含有decimal、isRemoveExtraZero和isFillZeroInFront属性
     *          large:（绝对值大于等于10部分）含有decimal和isRemoveExtraZero属性
     *      如果是Number，则等效于:
     *          {
     *              small: {
     *                  decimal: 传递的值,
     *                  isRemoveExtraZero: true,
     *                  isFillZeroInFront: false
     *              },
     *              large: {
     *                  decimal: formatOption,
     *                  isRemoveExtraZero: true
     *              }
     *          }
     * @returns {String} 返回格式化后的值，如果value不是数值类型，则返回原始值
     */
    numberFormat(value, formatOption) {
        switch (typeof formatOption) {
            case 'number':
                formatOption = {
                    small: {
                        decimal: formatOption,
                        isRemoveExtraZero: true,
                        isFillZeroInFront: false
                    },
                    large: {
                        decimal: formatOption,
                        isRemoveExtraZero: true
                    }
                };
                break;
            case 'object':
                break;
            default:
                formatOption = {};
                break;
        }

        let absValue = Math.abs(value);
        if (absValue < 10) {
            return this.smallNumberFormat(value, formatOption.small || {});
        } else {
            return this.largeNumberFormat(value, formatOption.large || {});
        }
    }

    /**
     * 小于10的数值格式化逻辑
     * @param {Number} value 要格式化的值
     * @param {Object} option 格式化选项
     *      包含的属性：decimal(保留小数位)、isRemoveExtraZero(是否删除小数部分末尾的0)、isFillZeroInFront(对于小于10的个位数值，是否前面补0)
     * @returns {String} 返回格式化后的值，如果value不是数值类型，则返回原始值
     */
    smallNumberFormat(value, option = { decimal: 8, isRemoveExtraZero: true, isFillZeroInFront: false }) {
        if (typeof value !== 'number') {
            return value;
        }

        // 处理提供了option，但未提供option.decimal值的情况，需要使用默认值
        if (option) {
            if (isNaN(option.decimal) || option.decimal < 0) {
                option.decimal = 8;
            }
        }

        let formatValue = this.retainDecimal(value, option.decimal, option.isRemoveExtraZero);
        if (option.isFillZeroInFront && Math.abs(value) < 10) {
            formatValue = '0' + formatValue;
        }
        return formatValue;
    }

    /**
     * 大于10的数值格式化逻辑
     * @param {Number} value 要格式化的值
     * @param {Object} option 格式化选项。包含属性如下：
     *      decimal：保留小数位，默认值：2
     *      isRemoveExtraZero：是否删除小数部分末尾的0，默认值：true
     *      isSplitValueAndUnit：是否分割数值和单位——默认不分割，默认值：false
     *      isAttachThousandSymbol：是否附加千分位符（,），默认值：false
     * @returns {String | Object} 返回格式化后的值，如果value不是数值类型，则返回原始值
     */
    largeNumberFormat(
        value,
        option = {
            decimal: 2,
            isRemoveExtraZero: true,
            isSplitValueAndUnit: false,
            isAttachThousandSymbol: false
        }
    ) {
        if (typeof value !== 'number') {
            return value;
        }

        let absValue = Math.abs(value);
        let unit = '亿';
        let divisor = 100000000;
        if (absValue < divisor) {
            unit = '万';
            divisor /= 10000;
        }
        if (absValue < divisor) {
            // unit = 'k';
            // divisor /= 10;
            unit = '';
            divisor = 1;
        }

        value = value / divisor;
        value = this.retainDecimal(value, option.decimal, option.isRemoveExtraZero);
        if (option.isAttachThousandSymbol) {
            let values = value.split('.');
            let integerPart = values[0];
            let decimalPart = values[1] ? '.' + values[1] : '';
            integerPart = Number(integerPart).toLocaleString();
            value = integerPart + decimalPart;
        }
        if (option.isSplitValueAndUnit) {
            return {
                value,
                unit
            };
        }
        return value + unit;
    }

    /**
     * 保留小数
     * @param {Number} value 原始值
     * @param {Number} decimal 要保留几位小数(默认值：2)
     * @param {Boolean} isRemoveExtraZero 是否删除小数部分末尾的0(默认值：true)
     * @returns {String} 返回保留小数后的结果，如果value不是数值类型，则返回原始值
     */
    retainDecimal(value, decimal = 2, isRemoveExtraZero = true) {
        if (typeof value !== 'number') {
            return value;
        }

        if (isNaN(decimal) || decimal < 0) {
            decimal = 2;
        }

        if (decimal === 0) {
            return Math.round(value).toString();
        }

        // 因为JavaScript的小数位精度比较低，导致Number.toFixed方法四舍五入的时候值不对(如:2.55.toFixed(1)结果为2.5)，所以手动处理
        let values = value.toString().split('.');
        let integerPart = values[0];
        let decimalPart = values[1] || '';
        if (decimalPart.length < decimal) {
            decimalPart += new Array(decimal - decimalPart.length + 1).join('0');
        }
        // 按照新的小数位进行四舍五入
        let newValue = Number(integerPart + decimalPart.substr(0, decimal) + '.' + decimalPart.substr(decimal));
        newValue = Math.round(newValue);
        value = newValue.toString();
        if (value.length > decimal) {
            value = value.slice(0, -decimal) + '.' + value.slice(-decimal);
        } else {
            value = '0.' + new Array(decimal - value.length + 1).join('0') + value;
        }

        // 是否删除末尾的0
        if (isRemoveExtraZero) {
            value = Number(value).toString();
        }
        return value;
    }

    /**
     * 百分比格式化逻辑
     * @param {Number} value 要格式化的值
     * @param {Boolean} isAttachSymbol 是否附加正负号（默认值：true）
     * @returns {String} 返回格式化后的值，如果value不是数值类型，则返回原始值
     */
    percentFormat(value, isAttachSymbol = true) {
        if (typeof value !== 'number') {
            return value;
        }

        let symbol = '';
        if (isAttachSymbol && value !== 0) {
            if (value > 0) {
                symbol = '+';
            } else {
                symbol = '-';
            }
        }

        value = Math.abs(value) * 100;
        value = this.retainDecimal(value, 2);

        return symbol + value + '%';
    }

    /**
     * 日期时间格式化逻辑
     * @param {Number} value 时间戳
     * @param {String} express 格式化表达式（默认值:yyyyMMdd hh:mm:ss）
     * @returns {String} 返回格式化后的值，如果value不是数值类型，则返回原始值
     */
    datetimeFormat(value, express = 'yyyyMMdd hh:mm:ss') {
        if (typeof value !== 'number') {
            return value;
        }

        let date = new Date(value);
        let datetime = {
            yyyy: date.getFullYear(),
            M: date.getMonth() + 1,
            d: date.getDate(),
            h: date.getHours(),
            m: date.getMinutes(),
            s: date.getSeconds()
        };
        datetime.yy = datetime.yyyy.toString().substr(2);
        // 处理显示两位（小于10补零）的情况
        ['MM', 'dd', 'hh', 'mm', 'ss'].forEach(key => {
            let time = datetime[key.slice(1)];
            datetime[key] = this.smallNumberFormat(time, { decimal: 0, isFillZeroInFront: true });
        });

        let formatValue = express;
        // 先替换完整的，再替换显示一位的
        ['yyyy', 'MM', 'dd', 'hh', 'mm', 'ss', 'yy', 'M', 'd', 'h', 'm', 's'].forEach(key => {
            formatValue = formatValue.replace(key, datetime[key]);
        });
        return formatValue;
    }
}

export default new DataFormat();
