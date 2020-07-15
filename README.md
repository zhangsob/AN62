# AN62(BASE62)
BASE64 Encode에는 +/= 기본형 또는 -_= URL형이 있다.  
여기서, 항상 특수문자가 문제가 되어. 0&#126;9, A&#126;Z, a&#126;z만으로 이루어진 Base62 아니, AlphaNumeric62을 만들어 보았다.

## 원리
|        Unicode값       |                 UTF-8                   |       Byte단위 값의 범위        |  비고 |
|------------------------|:----------------------------------------|:-------------------------------|-------|
| 0x000000&#126;0x00007F | 0xxx xxxx                               | 0x00&#126;0x7F                 | ASCII |
| 0x000080&#126;0x0007FF | 110x xxxx 10xx xxxx                     | 0xC0&#126;0xDF, 0x80&#126;0xBF | 유럽   |
| 0x000800&#126;0x00FFFF | 1110 xxxx 10xx xxxx 10xx xxxx           | 0xE0&#126;0xEF, 0x80&#126;0xBF | 한글등 |
| 0x010000&#126;0x10FFFF | 1111 0zzz 10zz xxxx 10xx xxxx 10xx xxxx | 0xF0&#126;0xF7, 0x80&#126;0xBF |       |

여기서, 0x0000 ~ 0xFFFF까지 UCS2에 거의 세계의 주요 문자가 속한다.   
(실제로, java나 C#에서 String.length(), String.Length은 문자의 수가 아닌 UTF-16의 길이이다.)  

그래서, 0x00&#126;0x7F, 0x80&#126;0xBF, 0xC0&#126;0xDF, 0xE0&#126;0xEF 즉, 0x00&#126;0xEF(240가지)만 주로 사용된다.   
240<sup>3</sup> &lt; 61<sup>4</sup> 이다. (즉, 240가지 3덩어리 61가지 4덩어리로 표현가능하다.)  

BASE64 Encode의 원리도  
256<sup>3</sup> = 64<sup>4</sup> 즉, 2<sup>(8*3)</sup> = 2<sup>(6*4)</sup> 로 3Byte을 6bit씩 4덩어리로 표현한 것이다.  

여기서, 62가지중 'z'를 escape(0xFX영역)하여 binary도 지원한다.  

## 장단점
단점 : BASE64는 bit연산으로 구현하고, AN62는 산술연산으로 다소 속도는 느림  
장점 : 특수문자(기호)가 없어 어떠한 환경에서 값으로 사용할 수 있음.  

## 지원언어
아래 언어로 소스코드를 올립니다. 
- java
- javascript
- c#
- cpp

## 예
- java
```java
public static void main(String[] args) {
	try {
		String src0 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
		System.out.println("src0:" + src0) ;
		String an62__tmp0 = AN62.encode(src0) ;
		System.out.println("an62__tmp0:" + an62__tmp0) ;
		String an62__out0 = AN62.decode(an62__tmp0) ;
		System.out.println("an62__out0:" + an62__out0) ;

		String base64_tmp = java.util.Base64.getEncoder().encodeToString(src0.getBytes("utf8")) ;
		System.out.println("base64_tmp:" + base64_tmp) ;
		String base64_out = new String(java.util.Base64.getDecoder().decode(base64_tmp), "utf8") ;
		System.out.println("base64_out:" + base64_out) ;

		String src1 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘" ;	// UnsupportedEncodingException이 발생하는 경우
		System.out.println("src1:" + src1) ;
		try {
			String tmp1 = AN62.encode(src1) ;
			System.out.println("tmp1:" + tmp1) ;
			String out1 = AN62.decode(tmp1) ;
			System.out.println("out1:" + out1) ;
		} catch(UnsupportedEncodingException uee) {
			System.err.println(uee) ;

			String tmp2 = AN62.bin2txt(src1.getBytes("utf8")) ;
			System.out.println("tmp2:" + tmp2) ;
			String out2 = new String(AN62.txt2bin(tmp2), "utf8") ;
			System.out.println("out2:" + out2) ;
		}
	} catch(Exception e) {
		e.printStackTrace();
	}
}
```
-----------------------------------------------------------------------------------
```
src0:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
an62__tmp0:QVOZSTTLC33NTIeJPEfTElRKEFxJOid7CixjSEKmOiZwFiOXWiaIco6jfdmdXfmjXfyWWfSTwG7Y
an62__out0:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
base64_tmp:aHR0cDovL3Rlc3QuY29tOjgwODAvYW42Mi5kbz9uYW1lPeqwgOuCmOuLpCDjhLHjhLTigLsK5Y+v
base64_out:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
src1:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可🐘
java.io.UnsupportedEncodingException: Illegal base62 character index 43 🐘
tmp2:QVOZSTTLC33NTIeJPEfTElRKEFxJOid7CixjSEKmOiZwFiOXWiaIco6jfdmdXfmjXfyWWfSTwG7YzIeAi2U
out2:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可🐘
```

## 예
- c#
```c#
static void Main(string[] args)
{
    string src0 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
    Console.WriteLine("src0:" + src0) ;
    string an62__tmp0 = AN62.encode(src0) ;
    Console.WriteLine("an62__tmp0:" + an62__tmp0) ;
    string an62__out0 = AN62.decode(an62__tmp0) ;
    Console.WriteLine("an62__out0:" + an62__out0) ;
    string base64_tmp = Convert.ToBase64String(Encoding.UTF8.GetBytes(src0)) ;
    Console.WriteLine("base64_tmp:" + base64_tmp) ;
    string base64_out = Encoding.UTF8.GetString(Convert.FromBase64String(base64_tmp)) ;
    Console.WriteLine("base64_out:" + base64_out) ;

    string src1 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘" ;    // ArgumentException이 발생하는 경우
    Console.WriteLine("src1:" + src1);
    try
    {
        string tmp1 = AN62.encode(src1);
        Console.WriteLine("tmp1:" + tmp1);
        string out1 = AN62.decode(tmp1);
        Console.WriteLine("out1:" + out1);
    }
    catch (ArgumentException ae)
    {
        Console.Error.WriteLine(ae);

        string tmp2 = AN62.bin2txt(Encoding.UTF8.GetBytes(src1));
        Console.WriteLine("tmp2:" + tmp2);
        string out2 = Encoding.UTF8.GetString(AN62.txt2bin(tmp2));
        Console.WriteLine("out2:" + out2);
    }
}
```
-----------------------------------------------------------------------------------
```
src0:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
an62__tmp0:QVOZSTTLC33NTIeJPEfTElRKEFxJOid7CixjSEKmOiZwFiOXWiaIco6jfdmdXfmjXfyWWfSTwG7Y
an62__out0:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
base64_tmp:aHR0cDovL3Rlc3QuY29tOjgwODAvYW42Mi5kbz9uYW1lPeqwgOuCmOuLpCDjhLHjhLTigLsK5Y+v
base64_out:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
src1:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可??
System.ArgumentException: Illegal base62 character index 43 ??
   위치: AN62.AN62.encode(String text) 파일 D:\2019.MALL\00.scripters\AN62\AN62.cs:줄 54
   위치: AN62.AN62.Main(String[] args) 파일 D:\2019.MALL\00.scripters\AN62\AN62.cs:줄 355
tmp2:QVOZSTTLC33NTIeJPEfTElRKEFxJOid7CixjSEKmOiZwFiOXWiaIco6jfdmdXfmjXfyWWfSTwG7YzIeAi2U
out2:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可??
```

## 예
- javascript
```javascript
function print(msg) {
    if(typeof document !== 'undefined' && typeof msg === 'string')
        document.write(msg.replace(/\n/g,'<br/>') + '<br/>') ;
    console.log(msg) ;
}

try {
    var src0 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
    print("src0:" + src0) ;
    var tmp0 = AN62.encode(src0) ;
    print("tmp0:" + tmp0) ;
    var out0 = AN62.decode(tmp0) ;
    print("out0:" + out0) ;

    var src1 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘" ;    // Exception이 발생하는 경우
    print("src1:" + src1) ;
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
```
-----------------------------------------------------------------------------------
```
src0:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
tmp0:QVOZSTTLC33NTIeJPEfTElRKEFxJOid7CixjSEKmOiZwFiOXWiaIco6jfdmdXfmjXfyWWfSTwG7Y
out0:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
src1:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可🐘
Illegal base62 character index 43 🐘
tmp2:QVOZSTTLC33NTIeJPEfTElRKEFxJOid7CixjSEKmOiZwFiOXWiaIco6jfdmdXfmjXfyWWfSTwG7YzIeAi2U
out2:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可🐘
```