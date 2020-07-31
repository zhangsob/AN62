/**
 * AN62(AlphaNumeric62, BASE62)란.. Text에서 특수문자를 제거한 숫자(10)+영문대문자(26)+영문소문자(26) = 62가지 문자로 변환하기
 *        
 * 원리 : Text를 UTF8처리한다.
 *        여기서, Unicode값 : 0 ~ 0xFFFF(65,536가지)까지의 거의 모든 주요 나라 언어 사용한다.
 *        UTF8은 아래와 같은 Byte범위를 갖는다.
 *        그럼, 0 ~ 0x7F(127)                 --> 0xxx xxxx                       --> 0x00 ~ 0x7F,
 *              0x80(128) ~ 0x7FF(2,047)      --> 110x xxxx 10xxx xxxx            --> 0xC0 ~ 0xDF, 0x80 ~ 0xBF
 *              0x800(2,048) ~ 0xFFFF(65,535) --> 1110 xxxx 10xxx xxxx 10xxx xxxx --> 0xE0 ~ 0xEF, 0x80 ~ 0xBF, 0x80 ~ 0xBF
 *              그래서, 0x00 ~ 0x7F, 0x80 ~ 0xBF, 0xC0 ~ 0xDF, 0xE0 ~ 0xEF = 0x00 ~ 0xEF (즉, 240가지)
 *              240의 1승(240^1 = 240), 240의 2승(240^2 = 60,025), 240의 3승(240^3 = 13,824,000)
 *               61의 1승( 61^1 =  61),  61의 2승( 61^2 =  3,721),  61의 3승( 61^3 =    226,981), 61의 4승(61^4 = 13,845,841)
 *              즉, 240^3 < 61^4이다. [ BASE64처럼 256^3 = 64^4 구현하면 된다. ]
 *              
 *        여기서, 'z'를 Padding으로 사용할 수도 있었으나, 아래와 같이 활용함.
 *        0xF0 ~ 0xFF을 escape하는 용도로 하여 Binary를 Text화 일반적인 encoding하는데 사용하였다.
 *        bin2txt()함수
 *        
 * @author zhangsob@gmail.com
 *
 * @history 2020-07-03 encode(), decode() 만듦.
 *          2020-07-14 bin2txt(), txt2bin() 만듦.
 */
var AN62 = (function() {
/*********
    function num2hex(num, len) {
        var i = 0, str = '', hex_tab = '0123456789ABCDEF';
        for(i = 0; i < len; ++i) {
            str = hex_tab.charAt(num & 0x0F) + str;
            //num >>= 4 ;   // 32bit 미만에서만 사용가능
            num /= 16 ;     // 32bit 초과시에도 사용가능
        }
        return str;
    }

    function print(bin) {
        var line = '', i = 0, len = bin.length ;
        for(; i < len; ++i) {
            line += num2hex(bin[i], 2) + ' ' ;
            if(i % 16 == 15) {
                console.log(line) ;
                line = '' ;
            }
        }
        console.log(line) ;
    }
*********/

    if (!String.prototype.codePointAt) {
        String.prototype.codePointAt = function (idx) {
            idx = idx || 0;
            var code = this.charCodeAt(idx), low = 0 ;
            if (0xD800 <= code && code <= 0xDBFF) {
                low = this.charCodeAt(idx+1) ;
                if (isNaN(low))
                    throw 'High surrogate not followed by low surrogate in codePointAt()';
                code = ((code - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
            }
            return code ;
        };
    }

    if (!String.fromCodePoint) (function(stringFromCharCode) {
        var fromCodePoint = function(_) {
          var codeUnits = [], codeLen = 0, result = "";
          for (var index=0, len = arguments.length; index !== len; ++index) {
            var codePoint = +arguments[index];
            // correctly handles all cases including `NaN`, `-Infinity`, `+Infinity`
            // The surrounding `!(...)` is required to correctly handle `NaN` cases
            // The (codePoint>>>0) === codePoint clause handles decimals and negatives
            if (!(codePoint < 0x10FFFF && (codePoint>>>0) === codePoint))
              throw RangeError("Invalid code point: " + codePoint);
            if (codePoint <= 0xFFFF) { // BMP code point
              codeLen = codeUnits.push(codePoint);
            } else { // Astral code point; split in surrogate halves
              // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
              codePoint -= 0x10000;
              codeLen = codeUnits.push(
                (codePoint >> 10) + 0xD800,  // highSurrogate
                (codePoint % 0x400) + 0xDC00 // lowSurrogate
              );
            }
            if (codeLen >= 0x3fff) {
              result += stringFromCharCode.apply(null, codeUnits);
              codeUnits.length = 0;
            }
          }
          return result + stringFromCharCode.apply(null, codeUnits);
        };
        try { // IE 8 only supports `Object.defineProperty` on DOM elements
          Object.defineProperty(String, "fromCodePoint", {
            "value": fromCodePoint, "configurable": true, "writable": true
          });
        } catch(e) {
          String.fromCodePoint = fromCodePoint;
        }
    }(String.fromCharCode));
    
    var toBase62 = [
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
            'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    ];
    
    var toUTF8 = function(text) {
        var i = 0, unicode = 0, ret = [], j = 0, len = text.length ;
        for(i = 0; i < len; ++i) {
            unicode = text.codePointAt(i) ;
            if(unicode < 0x80) {
                ret[j++] = unicode ;
            }
            else if(unicode < 0x800) {
                ret[j++] = 0xC0 | (unicode >> 6) ;
                ret[j++] = 0x80 | (unicode & 0x3F) ;
            }
            else if(unicode <= 0xFFFF) {
                ret[j++] = 0xE0 | (unicode >> 12) ;
                unicode &= 0x00FFF ;
                ret[j++] = 0x80 | (unicode >> 6) ;
                ret[j++] = 0x80 | (unicode & 0x3F) ;
            }
            else {
                ret[j++] = 0xF0 | (unicode >> 18) ;
                unicode &= 0x3FFFF ;
                ret[j++] = 0x80 | (unicode >> 12) ;
                unicode &= 0x00FFF ;
                ret[j++] = 0x80 | (unicode >> 6) ;
                ret[j++] = 0x80 | (unicode & 0x3F) ;
                ++i ;   // string의 length는 utf16기준임.
            }
        }
        return ret ;
    } ;

    var encode = function(text) {
        var utf8 = toUTF8(text) ;
        var ret = [] ;
        var value = 0 ;
        var val = 0 ;
        var len = utf8.length ;
        var tmp = [] ;
        var i = 0, j = 0 ;
        for(i = 0; i < len; ++i) {
            val = utf8[i] ;
            if(val >= 0xF0)    {
                for(j = 0; j < text.length; ++j)
                    if(text.codePointAt(j) > 0xFFFF)
                        throw "Illegal base62 character index " + j + " " + text.substring(j, j+2) ;
            }
            
            value = value * 0xF0 + val ;

            if(i % 3 == 2) {
                for(j = 3; j >= 0; --j, value = Math.floor(value / 61))
                    tmp[j] = toBase62[value % 61];

                for(j = 0; j <= 3; ++j)
                    ret.push(tmp[j]) ;

                value = 0 ;
            }
        }
        
        len = utf8.length % 3 ;
        if(len > 0) {
            for(j = len; j >= 0; --j, value = Math.floor(value / 61))
                tmp[j] = toBase62[value % 61] ;
            
            for(j = 0; j <= len; ++j)
                ret.push(tmp[j]) ;
        }
        
        return ret.join('') ;
    } ;
    
    var fromBase62 = Array(128) ;
    for (i = 0; i < fromBase62.length; ++i)
        fromBase62[i] = -1 ;
    for (i = 0; i < toBase62.length; ++i)
        fromBase62[toBase62[i].charCodeAt(0)] = i ;
    fromBase62['z'.charCodeAt(0)] = -2 ;

    var fromUTF8 = function(utf8) {
        var val = 0, i = 0, count = 0, value = 0, len = utf8.length, ret = '' ;
        for(i = 0; i < len; ++i) {
            val = utf8[i] ;
            if(count == 0) {
                if((val & 0xF8) == 0xF0) {
                    count = 3 ;
                    value = val & 0x07 ;
                }   
                else if((val & 0xF0) == 0xE0) {
                    count = 2 ;
                    value = val & 0x0F ;
                } 
                else if((val & 0xE0) == 0xC0) {
                    count = 1 ;
                    value = val & 0x1F ;
                }
                else {
                    ret += String.fromCodePoint(val) ;
                    value = 0 ;
                }
            }
            else {
                if((val & 0xC0) != 0x80) throw "Illegal UTF8" ;

                value <<= 6 ;
                value |= val & 0x3F ;
                if(--count == 0) {
                    ret += String.fromCodePoint(value) ;
                    value = 0 ;
                }
            }
        }
        return ret ;
    } ;

    var decode = function(text) {
        var len = text.length ;
        if(len % 4 == 1)    throw "Illegal base62 length" ;
        
        var dst = [] ;
        var tmp = [] ;
        var value = 0 ;
        var ch = 0 ;
        
        var bi = 0 ;
        var i = 0, j = 0;
        for(i = 0; i < len; ++i) {
            ch = text.charCodeAt(i) ;
            if(ch >= 0x80)
                throw "Illegal base62 character " + ch ;
            
            value = value * 61 + fromBase62[ch] ;

            if(i % 4 == 3) {
                for(j = 2; j >= 0; --j, value = Math.floor(value / 0xF0))
                    tmp[j] = value % 0xF0 ;

                for(j = 0; j < 3; ++j)
                    dst[bi+j] = tmp[j] ;

                bi += 3 ;
            }
        }
        
        len = len % 4 ;
        if(len > 0) {
            len -= 1 ;
            for(j = len-1; j >= 0; --j, value = Math.floor(value / 0xF0))
                tmp[j] = value % 0xF0 ;

            for(j = 0; j < len; ++j)
                dst[bi+j] = tmp[j] ;

            bi += len ;
        }

        return fromUTF8(dst) ;
    } ;

    var bin2txt = function(bin) {
        var ret = [] ;
        var value = 0 ;
        var len = Math.floor(bin.length / 3) * 3 ;
        var tmp = [] ;
        var FX_bit = 0 ;
        var i = 0, j = 0 ;

        for(i = 0; i < len; i += 3) {
            FX_bit = 0 ;
            value = 0 ;
            
            for(j = 0; j < 3; ++j)
                if((bin[i+j] & 0xF0) == 0xF0) {
                    FX_bit = 1 ;
                    break ;
                }

            if (FX_bit != 0) {
                ret.push('z') ;

                FX_bit = 0 ;
                for(j = 0; j < 3; ++j) {
                    FX_bit <<= 1 ;
                    if((bin[i+j] & 0xF0) == 0xF0) {
                        FX_bit |= 0x01 ;
                    }
                    else {
                        value <<= 4 ;
                        value |= (bin[i+j] >> 4) & 0x0F ;
                    }
                    value <<= 4 ;
                    value |= bin[i+j] & 0x0F ;
                }
                value |= FX_bit << 20 ;
            }
            else {
                for(j = 0; j < 3; ++j)
                    value = value * 0xF0 + (bin[i+j] & 0xFF) ;
            }

            for(j = 3; j >= 0; --j, value = Math.floor(value / 61))
                tmp[j] = toBase62[value % 61] ;
                
            for(j = 0; j <= 3; ++j)
                ret.push(tmp[j]) ;
        }
        
        len = bin.length % 3 ;
        if(len > 0) {
            FX_bit = 0 ;
            value = 0 ;
            for(j = 0; j < len; ++j)
                if((bin[i+j] & 0xF0) == 0xF0) {
                    FX_bit <<= 1 ;
                    break ;
                }

            if (FX_bit != 0) {
                ret.push('z') ;

                FX_bit = 0 ;
                for(j = 0; j < len; ++j) {
                    FX_bit <<= 1 ;
                    if((bin[i+j] & 0xF0) == 0xF0) {
                        FX_bit |= 0x01 ;
                    }
                    else {
                        value <<= 4 ;
                        value |= (bin[i+j] >> 4) & 0x0F ;
                    }
                    value <<= 4 ;
                    value |= bin[i+j] & 0x0F ;
                }
                value |= FX_bit << ((len == 1) ? 4 : 12) ;
            }
            else {
                for(j = 0; j < len; ++j)
                    value = value * 0xF0 + (bin[i+j] & 0xFF) ;
            }

            for(j = len; j >= 0; --j, value = Math.floor(value / 61))
                tmp[j] = toBase62[value % 61] ;

            for(j = 0; j <= len; ++j)
                ret.push(tmp[j]) ;
        }
            
        return ret.join('') ;
    }
    
    var txt2bin = function(txt) {
        var len = txt.length ;
        var dst = [] ;
        var tmp = [] ;
        var value = 0 ;
        var val = 0 ;
        var ch = 0 ;
        var count = 0 ;    
        var bi = 0 ;
        var isFX = 0 ;
        var i = 0, j = 0 ;
        for(i = 0; i < len; ++i) {
            ch = txt.charCodeAt(i) ;
            if(ch >= 0x80)
                throw "Illegal base62 character " + ch ;
                
            val = fromBase62[ch] ;
            if(val < 0) {
                if(val == -2 && (count % 4) == 0 && isFX == 0) {
                    isFX = 1 ;
                    continue ;
                }

                throw "Illegal base62 character " + ch ;
            }
            ++count ;

            value = value * 61 + val ;
            if(count % 4 == 0) {
                if (isFX != 0) {
                    isFX = value >> 20 ;
                    for (j = 2, mask=1; j >= 0; --j, mask <<= 1) {
                        tmp[j] = value & 0x0F ;
                        value >>= 4 ;
                        if ((isFX & mask) == mask) {
                            tmp[j] |= 0xF0 ;
                        }
                        else {
                            tmp[j] |= (value & 0x0F) << 4 ;
                            value >>= 4 ;
                        }
                    }
                    isFX = 0 ;
                }
                else {
                    for(j = 2; j >= 0; --j, value = Math.floor(value / 0xF0))
                        tmp[j] = value % 0xF0 ;
                }

                value = 0 ;
                for(j = 0; j < 3; ++j)
                    dst[bi++] = tmp[j] ;    
            }
        }

        len = count % 4 ;
        if(len > 0) {
            len -= 1 ;
            if (isFX != 0) {
                isFX = value >> ((len >= 2) ? 12 : 4) ;
                for (j = len-1, mask=1; j >= 0; --j, mask <<= 1) {
                    tmp[j] = value & 0x0F ;
                    value >>= 4 ;
                    if ((isFX & mask) == mask) {
                        tmp[j] |= 0xF0 ;
                    }
                    else {
                        tmp[j] |= (value & 0x0F) << 4 ;
                        value >>= 4 ;
                    }
                }
            }
            else {
                for(j = len-1; j >= 0; --j, value = Math.floor(value / 0xF0))
                    tmp[j] = value % 0xF0 ;
            }

            for(j = 0; j < len; ++j)
                dst[bi++] = tmp[j] ;
        }

        return dst ;
    }
    
    return {
        encode : encode,
        decode : decode,
        bin2txt : bin2txt,
        txt2bin : txt2bin,
        toUTF8 : toUTF8,
        fromUTF8 : fromUTF8,
    } ;
}()) ;

function print(msg) {
    if(typeof document !== 'undefined' && typeof msg === 'string')
        document.write(msg.replace(/\n/g,'<br/>') + '<br/>') ;
    console.log(msg) ;
}

try {
    var src0 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
    print('src0['+src0.length+']:' + src0) ;
    var tmp0 = AN62.encode(src0) ;
    print("tmp0:" + tmp0) ;
    var out0 = AN62.decode(tmp0) ;
    print("out0:" + out0) ;

    // [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
    var src1 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘" ;    // Exception이 발생하는 경우
    print('src1['+src1.length+']:' + src1) ;
    try {
        var tmp1 = AN62.encode(src1) ;
        print("tmp1:" + tmp1) ;
        var out1 = AN62.decode(tmp1) ;
        print("out1:" + out1) ;
    }
    catch(e) {
        console.error(e) ;

        var tmp2 = AN62.bin2txt(AN62.toUTF8(src1)) ;
        print("tmp2:" + tmp2) ;
        var out2 = AN62.fromUTF8(AN62.txt2bin(tmp2)) ;
        print("out2:" + out2) ;
    }
} catch(e) {
    print(e) ;
}
