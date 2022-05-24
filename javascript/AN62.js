/**
 * AN62(AlphaNumeric62)이란.. Text에서 특수문자를 제거한 숫자(10)+영문대문자(26)+영문소문자(26) = 62가지 문자로 변환하기<br/>
 * String To String Encoding/Decoding<br/>
 * <br/>       
 * 원리 : Text를 UTF8처리한다.<br/>
 *        UTF8은 아래와 같은 Byte범위를 갖는다.
 *        그럼, 0x000000 ~ 0x00007F --> 0xxx xxxx                               --> 0x00 ~ 0x7F<br/>
 *              0x000080 ~ 0x0007FF --> 110x xxxx 10xx xxxx                     --> 0xC0 ~ 0xDF, 0x80 ~ 0xBF<br/>
 *              0x000800 ~ 0x00FFFF --> 1110 xxxx 10xx xxxx 10xx xxxx           --> 0xE0 ~ 0xEF, 0x80 ~ 0xBF, 0x80 ~ 0xBF<br/>
 *              0x010000 ~ 0x10FFFF --> 1111 0zzz 10zz xxxx 10xx xxxx 10xx xxxx --> 0xF0 ~ 0xF4, 0x80 ~ 0xBF, 0x80 ~ 0xBF, 0x80 ~ 0xBF<br/>
 *              그래서, 0x00 ~ 0x7F, 0x80 ~ 0xBF, 0xC0 ~ 0xDF, 0xE0 ~ 0xEF, 0xF0 ~ 0xF4 = 0x00 ~ 0xF4 (즉, 245가지)<br/>
 *              245의 1승(245^1 =   245), 245의 2승(245^2 =  60,025), 245의 3승(245^3 = 14,706,125)<br/>
 *               62의 2승( 62^2 = 3,844),  62의 3승( 62^3 = 238,328),  62의 4승( 62^4 = 14,776,336)<br/>
 *              즉, 245^3 < 62^4이다. [ BASE64(256^3 = 64^4)처럼  구현하면 된다. ]<br/>  
 *        <br/>
 *        Binary To String Encoding은 https://github.com/zhangsob/Base62 를 참조.<br/>
 *        
 * @author zhangsob@gmail.com
 * 
 * @history 2020-08-25 encode(), decode() 만듦.<br/>
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
			if(val >= 0xF5) throw "invalid UTF8 character" ;
			
			value = value * 0xF5 + val ;

			if(i % 3 == 2) {
				for(j = 3; j >= 0; --j, value = Math.floor(value / 62))
					tmp[j] = toBase62[value % 62];

				for(j = 0; j <= 3; ++j)
					ret.push(tmp[j]) ;

				value = 0 ;
			}
		}
		
		len = utf8.length % 3 ;
		if(len > 0) {
			for(j = len; j >= 0; --j, value = Math.floor(value / 62))
				tmp[j] = toBase62[value % 62] ;
			
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
				if((val & 0xC0) != 0x80) throw "invalid UTF8" ;

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
		if(len % 4 == 1)    throw "invalid AN62 length" ;
		
		var dst = [] ;
		var tmp = [] ;
		var value = 0 ;
		var ch = 0 ;
		
		var bi = 0 ;
		var i = 0, j = 0;
		for(i = 0; i < len; ++i) {
			ch = text.charCodeAt(i) ;
			if(ch >= 0x80)
				throw "invalid AN62 character " + ch ;
			
			value = value * 62 + fromBase62[ch] ;

			if(i % 4 == 3) {
				for(j = 2; j >= 0; --j, value = Math.floor(value / 0xF5))
					tmp[j] = value % 0xF5 ;

				for(j = 0; j < 3; ++j)
					dst[bi+j] = tmp[j] ;

				bi += 3 ;
			}
		}
		
		len = len % 4 ;
		if(len > 0) {
			len -= 1 ;
			for(j = len-1; j >= 0; --j, value = Math.floor(value / 0xF5))
				tmp[j] = value % 0xF5 ;

			for(j = 0; j < len; ++j)
				dst[bi+j] = tmp[j] ;

			bi += len ;
		}

		return fromUTF8(dst) ;
	} ;
	
	return {
		encode : encode,
		decode : decode,
	} ;
}()) ;

// for node
if(typeof module === 'object')
	module.exports = AN62 ;
