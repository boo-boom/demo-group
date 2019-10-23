/**
 * calculation: javascript在计算浮点数（小数）不准确，解决方案
 */
import React, { Component } from "react";
// import * as math from "mathjs";
import { create, all } from 'mathjs';

import MarkdownIt from "markdown-it";
import "./style.scss";

class Calculation extends Component {
  constructor(props) {
    super(props);
    const mdStr = `
# 解决JS浮点数运算结果不精确的Bug

### 一. 常见例子

\`\`\`
// 加法
0.1 + 0.2 = 0.30000000000000004
0.1 + 0.7 = 0.7999999999999999
0.2 + 0.4 = 0.6000000000000001

// 减法
0.3 - 0.2 = 0.09999999999999998
1.5 - 1.2 = 0.30000000000000004

// 乘法
0.8 * 3 = 2.4000000000000004
19.9 * 100 = 1989.9999999999998

// 除法
0.3 / 0.1 = 2.9999999999999996
0.69 / 10 = 0.06899999999999999

// 比较
0.1 + 0.2 === 0.3 // false
\`\`\`

### 二. 解决办法

[1] 引用类库

  - Math.js
  - decimal.js
  - big.js

[2] 自定义一个转换和处理函数

    `;
    this.md = new MarkdownIt();
    this.state = {
      demoHtml: this.md.render(mdStr),
      numObj: {
        type: "+",
        a: 0.1,
        b: 0.2,
        c: 0.1 + 0.2
      }
    };

    // mathjs用法
    const math = create(all, { number: 'BigNumber' });
    console.log(math.number(math.evaluate('0.1 + 0.2')));
    // console.log(math.format(math.chain(math.bignumber(0.1)).add(math.bignumber(0.2)).done()));
  }

  funA(e) {
    const { numObj } = this.state;
    numObj.a = e.target.value;
    this.setState({
      numObj
    });
  }

  funB(e) {
    const { numObj } = this.state;
    numObj.b = e.target.value;
    this.setState({
      numObj
    });
  }

  funType(e) {
    const { numObj } = this.state;
    numObj.type = e.target.value;
    this.setState({
      numObj
    });
  }

  add() {
    const { numObj } = this.state;
    const { type } = numObj;
    switch (type) {
      case "+":
        numObj.c = floatTool.add(numObj.a, numObj.b);
        break;
      case "-":
        numObj.c = floatTool.subtract(numObj.a, numObj.b);
        break;
      case "*":
        numObj.c = floatTool.multiply(numObj.a, numObj.b);
        break;
      case "/":
        numObj.c = floatTool.divide(numObj.a, numObj.b);
        break;
      default:
        alert("计算类型只有'+-*/'");
        break;
    }
    this.setState({
      numObj
    });
  }

  render() {
    const { numObj } = this.state;
    return (
      <div className="page-calculation">
        <div className="detail-content markdown-body" dangerouslySetInnerHTML={{ __html: this.state.demoHtml }}></div>
        <div>
          <input type="number" value={numObj.a} onChange={e => this.funA(e)} />
          <input type="text" value={numObj.type} onChange={e => this.funType(e)} />
          <input type="number" value={numObj.b} onChange={e => this.funB(e)} />
          =
          <input type="text" readOnly value={numObj.c} />
          <button onClick={() => { this.add() }} > 计算 </button>
        </div>
      </div>
    );
  }
}

export default Calculation;

/**
 *  ** method **
 *  add / subtract / multiply /divide
 */
const floatTool = (function() {
  /**
   * 判断obj是否为一个整数
   * @param {number} number
   */
  const isInteger = number => {
    return Math.floor(number) === number;
  };

  /**
   * 将一个浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数是 100
   * @param {number} floatNumber 小数
   * @return {object} {times:100, num: 314}
   */
  const toInteger = floatNumber => {
    const res = { multiple: 1, number: 0 };
    // 整数时不处理
    if (isInteger(floatNumber)) {
      res.number = floatNumber;
      return res;
    }
    // 如果是小数时处理逻辑 => 取小数点后位长度作为次幂
    const floatStr = floatNumber + "";
    const dotPosition = floatStr.indexOf(".");
    const dotAfterLen = floatStr.substr(dotPosition + 1).length;
    const numberPow = Math.pow(10, dotAfterLen);
    const intNumber = parseInt(floatNumber * numberPow, 10);
    return {
      multiple: numberPow,
      number: intNumber
    };
  };

  const operation = (num1, num2, type) => {
    const o1 = toInteger(num1);
    const o2 = toInteger(num2);
    const n1 = o1.number;
    const n2 = o2.number;
    const m1 = o1.multiple;
    const m2 = o2.multiple;
    // 取最大倍数
    const max = m1 > m2 ? m1 : m2;
    let res = null;
    switch (type) {
      case "add":
        if (m1 === m2) {
          // 两个小数位数相同
          res = n1 + n2;
        } else if (m1 > m2) {
          // m1小数位大于m2, 算出差位，补0使2个数字小数位对其
          res = n1 + n2 * (m1 / m2);
        } else {
          // m1小数位小于m2, 算出差位，补0使2个数字小数位对其
          res = n1 * (m2 / m1) + n2;
        }
        return res / max;
      case "subtract":
        if (m1 === m2) {
          res = n1 - n2;
        } else if (m1 > m2) {
          res = n1 - n2 * (m1 / m2);
        } else {
          res = n1 * (m2 / m1) - n2;
        }
        return res / max;
      case "multiply":
        res = (n1 * n2) / (m1 * m2);
        return res;
      case "divide":
        return (res = (function() {
          const r1 = n1 / n2;
          const r2 = m2 / m1;
          return operation(r1, r2, "multiply");
        })());
      default:
        return res;
    }
  };

  const add = (num1, num2) => operation(num1, num2, "add");
  const subtract = (num1, num2) => operation(num1, num2, "subtract");
  const multiply = (num1, num2) => operation(num1, num2, "multiply");
  const divide = (num1, num2) => operation(num1, num2, "divide");

  return {
    add,
    subtract,
    multiply,
    divide
  };
})();

// 多层加减精度计算
// const floatTool1 = (function() {
//   const operation = (nums, type) => {
//     const dArr = [];
//     let dotLen = 0,
//         multiple = 0,
//         res = 0;
//     for (let i = 0; i < nums.length; i++) {
//       try {
//         dotLen = nums[i].toString().split(".")[1].length;
//       } catch (err) {
//         dotLen = 0;
//       }
//       dArr.push(dotLen);
//     }
//     multiple = Math.pow(10, Math.max.apply(this, dArr));

//     const div_lens = [], div_nums = [];
//     for (let i = 0; i < nums.length; i++) {
//       if (type === "add") {
//         res += nums[i] * multiple;
//       } else if (type === "subtract") {
//         if (i === 0) {
//           res += nums[0] * multiple;
//         } else {
//           res -= nums[i] * multiple;
//         }
//       }

//       // else if (type === "multiply") {
//       //   if (i === 0) {
//       //     res = nums[0] * multiple;
//       //   } else {
//       //     res = res * (nums[i] * multiple);
//       //   }
//       // }
//     }

//     // if (type === "multiply") {
//     //   return res / Math.pow(10, dArr.length);
//     // }
//     return res / multiple;
//   };

//   const add = nums => operation(nums, "add");
//   const subtract = nums => operation(nums, "subtract");

//   return {
//     add,
//     subtract,
//     multiply,
//     divide
//   };
// })();

// console.log(floatTool.add(0.1, 0.2) === 0.3);
// console.log(floatTool.subtract(0.3, 0.2));
// console.log(floatTool1.divide([0.8, 3, 0.1, 0.2]));

/**
 * 精度溢出处理
 * @param amount/a {Number}   要格式化的数字
 * @param base/b   {Number}   格式化基数,默认为100
 * @param type   {String}     格式化类型，默认除div
 * @returns {number}
 *
 */
// function formatNumAccuracy(amount, base, type) {
//   // 默认值
//   let a = Number(amount) ? Number(amount) : 0;
//   let b = Number(base) ? Number(base) : 0;
//   type = type ? type : "div";

//   switch (type) {
//     case "add": {
//       // 加 api.add(0.1, 0.2),例1.1+0.1
//       let c, d, e;
//       try {
//         c = a.toString().split(".")[1].length;
//       } catch (f) {
//         c = 0;
//       }
//       try {
//         d = b.toString().split(".")[1].length;
//       } catch (f) {
//         d = 0;
//       }
//       e = Math.pow(10, Math.max(c, d));
//       return (a * e + b * e) / e;
//     }
//     case "sub": {
//       // 减 api.sub(0.1, 0.2)，-0.09999999 - 0.00000001
//       let c, d, e;
//       try {
//         c = a.toString().split(".")[1].length;
//       } catch (f) {
//         c = 0;
//       }
//       try {
//         d = b.toString().split(".")[1].length;
//       } catch (f) {
//         d = 0;
//       }
//       e = Math.pow(10, Math.max(c, d));
//       return (a * e - b * e) / e;
//     }
//     case "mul": {
//       // 乘 api.mul(0.1, 0.2),例1.1*100
//       let c = 0,
//         d = a.toString(),
//         e = b.toString();
//       try {
//         c += d.split(".")[1].length;
//       } catch (f) {
//         null;
//       }
//       try {
//         c += e.split(".")[1].length;
//       } catch (f) {
//         null;
//       }
//       return (Number(d.replace(".", "")) * Number(e.replace(".", ""))) / Math.pow(10, c);
//     }
//     case "div": {
//       // 除 api.div(0.1, 0.2),例0.12345/0.000001，0.000001 / 0.0001
//       var c,
//         d,
//         e = 0,
//         f = 0;
//       try {
//         e = a.toString().split(".")[1].length;
//       } catch (g) {
//         null;
//       }
//       try {
//         f = b.toString().split(".")[1].length;
//       } catch (g) {
//         null;
//       }
//       c = Number(a.toString().replace(".", ""));
//       d = Number(b.toString().replace(".", ""));
//       return (c / d) * Math.pow(10, f - e);
//     }
//     default:
//       return 0;
//   }
// }
