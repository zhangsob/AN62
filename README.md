# AN62(AlphaNumeric62)
BASE64 Encode에는 +/= 기본형 또는 -_= URL형이 있다.  
여기서, 항상 특수문자가 문제가 되어. 0&#126;9, A&#126;Z, a&#126;z만으로 이루어진 AlphaNumeric62을 만들어 보았다.

## 원리
|        Unicode값       |                 UTF-8                   |       Byte단위 값의 범위        |  비고 |
|------------------------|:----------------------------------------|:-------------------------------|-------|
| 0x000000&#126;0x00007F | 0xxx xxxx                               | 0x00&#126;0x7F                 | ASCII |
| 0x000080&#126;0x0007FF | 110x xxxx 10xx xxxx                     | 0xC0&#126;0xDF, 0x80&#126;0xBF | 유럽   |
| 0x000800&#126;0x00FFFF | 1110 xxxx 10xx xxxx 10xx xxxx           | 0xE0&#126;0xEF, 0x80&#126;0xBF | 한글등 |
| 0x010000&#126;0x10FFFF | 1111 0zzz 10zz xxxx 10xx xxxx 10xx xxxx | 0xF0&#126;0xF4, 0x80&#126;0xBF |       |

그래서, 0x00&#126;0x7F, 0x80&#126;0xBF, 0xC0&#126;0xDF, 0xE0&#126;0xEF, 0xF0&#126;0xF4 즉, 0x00&#126;0xF4(245가지).

245<sup>3</sup> &lt; 62<sup>4</sup> (14,706,125 < 14,776,336) 이다. (즉, 245가지 3덩어리를 62가지 4덩어리로 표현가능하다.)  

BASE64 Encode의 원리도
256<sup>3</sup> = 64<sup>4</sup> 즉, 2<sup>(8&#42;3)</sup> = 2<sup>(6&#42;4)</sup> 로 3Byte을 6bit씩 4덩어리로 표현한 것이다.

## 장단점
단점 : BASE64는 bit연산으로 구현하고, AN62는 산술연산으로 다소 속도는 느림  

장점 : 특수문자(기호)가 없어 어떠한 환경에서 값으로 사용할 수 있음.  

## 지원언어
아래 언어로 소스코드를 올립니다. 
- java
- javascript
- c#
- cpp
- python
- pascal(Delphi)

## 예
- java
```java
public static void main(String[] args) {
    try {
        String src0 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
        System.out.println("src0["+src0.length()+"]:" + src0) ;
        String an62__tmp0 = AN62.encode(src0) ;
        System.out.println("an62__tmp0:" + an62__tmp0) ;
        String an62__out0 = AN62.decode(an62__tmp0) ;
        System.out.println("an62__out0:" + an62__out0) ;
        String base64_tmp = java.util.Base64.getEncoder().encodeToString(src0.getBytes("utf8")) ;
        System.out.println("base64_tmp:" + base64_tmp) ;
        String base64_out = new String(java.util.Base64.getDecoder().decode(base64_tmp), "utf8") ;
        System.out.println("base64_out:" + base64_out) ;

        // [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
		String src1 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘" ;
		System.out.println("src1["+src1.length()+"]:" + src1) ;		// String.length()은 문자갯수가 아니라, UTF16의 길이다. 
		String tmp1 = AN62.encode(src1) ;
		System.out.println("tmp1:" + tmp1) ;
		String out1 = AN62.decode(tmp1) ;
		System.out.println("out1:" + out1) ;

        if(src1.equals(out1))	System.out.println("src1.equals(out1)") ;

    } catch(Exception e) {
        e.printStackTrace();
    }
}
```
-----------------------------------------------------------------------------------
```
src0[43]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
an62__tmp0:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39
an62__out0:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
base64_tmp:aHR0cDovL3Rlc3QuY29tOjgwODAvYW42Mi5kbz9uYW1lPeqwgOuCmOuLpCDjhLHjhLTigLsK5Y+v
base64_out:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
src1[45]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可🐘
tmp1:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39ybpT2S
out1:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可🐘
src1.equals(out1)
```

## 예
- c#
```c#
static void Main(string[] args)
{
    string src0 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可";
    Console.WriteLine("src0[" + src0.Length + "]:" + src0);
    string an62__tmp0 = AN62.encode(src0);
    Console.WriteLine("an62__tmp0:" + an62__tmp0);
    string an62__out0 = AN62.decode(an62__tmp0);
    Console.WriteLine("an62__out0:" + an62__out0);
    string base64_tmp = Convert.ToBase64String(Encoding.UTF8.GetBytes(src0));
    Console.WriteLine("base64_tmp:" + base64_tmp);
    string base64_out = Encoding.UTF8.GetString(Convert.FromBase64String(base64_tmp));
    Console.WriteLine("base64_out:" + base64_out);

    // [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
    string src1 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘";
    Console.WriteLine("src1[" + src1.Length + "]:" + src1);
    string tmp1 = AN62.encode(src1);
    Console.WriteLine("tmp1:" + tmp1);
    string out1 = AN62.decode(tmp1);
    Console.WriteLine("out1:" + out1);

    if (src1.Equals(out1)) Console.WriteLine("src1.Equals(out1)");
}
```
-----------------------------------------------------------------------------------
```
src0[43]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
an62__tmp0:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39
an62__out0:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
base64_tmp:aHR0cDovL3Rlc3QuY29tOjgwODAvYW42Mi5kbz9uYW1lPeqwgOuCmOuLpCDjhLHjhLTigLsK5Y+v
base64_out:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
src1[45]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可??
tmp1:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39ybpT2S
out1:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可??
src1.Equals(out1)
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
    print('src0['+src0.length+']:' + src0) ;
    var tmp0 = AN62.encode(src0) ;
    print("tmp0:" + tmp0) ;
    var out0 = AN62.decode(tmp0) ;
    print("out0:" + out0) ;

    // [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
    var src1 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘" ;
    print('src1['+src1.length+']:' + src1) ;
    var tmp1 = AN62.encode(src1) ;
    print("tmp1:" + tmp1) ;
    var out1 = AN62.decode(tmp1) ;
    print("out1:" + out1) ;

    if(src1 === out1)   print("src1 === out1") ;
} catch(e) {
    print(e) ;
}
```
-----------------------------------------------------------------------------------
```
src0[43]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
tmp0:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39
out0:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
src1[45]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可🐘
tmp1:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39ybpT2S
out1:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可🐘
src1 === out1
```

## 예
- python
```python
if __name__ == '__main__':
    src0 = 'http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可'
    print('src0['+str(len(src0))+']:' + src0)
    an62__tmp0 = AN62.encode(src0)
    print('an62__tmp0:' + an62__tmp0)
    an62__out0 = AN62.decode(an62__tmp0)
    print('an62__out0:' + an62__out0)
    base64_tmp = base64.b64encode(src0.encode('utf8')).decode('utf8')
    print('base64_tmp:' + base64_tmp)
    base64_out = base64.b64decode(base64_tmp.encode('utf8')).decode('utf8')
    print('base64_out:' + base64_out)

    # [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
    src1 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘"
    print("src1:["+str(len(src1))+"]" + src1)
    tmp1 = AN62.encode(src1)
    print("tmp1:" + tmp1)
    out1 = AN62.decode(tmp1)
    print("out1:" + out1)

    if(src1 == out1) :
        print("src1 == out1")
```
-----------------------------------------------------------------------------------
```
src0[43]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
an62__tmp0:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39
an62__out0:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
base64_tmp:aHR0cDovL3Rlc3QuY29tOjgwODAvYW42Mi5kbz9uYW1lPeqwgOuCmOuLpCDjhLHjhLTigLsK5Y+v
base64_out:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
src1:[44]http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可🐘
tmp1:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39ybpT2S
out1:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可🐘
src1 == out1
```

## 예
- cpp (Windows)
```cpp
// charset : EUC-KR(on Windows)
#include "an62.h"
#include "zstring.h"
#include <stdio.h>

int main(int argc, char *argv[])
{
	std::string locale(setlocale(LC_ALL, "")) ;
	printf("locale : [%s]\n", locale.c_str()) ;
	printf("sizeof(wchar_t) : %zd\n", sizeof(wchar_t)) ;

	{
		std::wstring src0 = L"http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
		printf("src0[%zd]:%s\n", src0.length(), wstring2system(src0).c_str()) ;
		std::string tmp0 = an62::encode(src0) ;
		printf("tmp0:%s\n", tmp0.c_str()) ;
		std::wstring out0 = an62::decode(tmp0) ;
		printf("out0:%s\n", wstring2system(out0).c_str()) ;
		printf("src0.compare(out0) : %d\n", src0.compare(out0)) ;
	}
	{
		std::string src0 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
		printf("src0[%zd]:%s\n", src0.length(), src0.c_str()) ;
		std::string tmp0 = an62::encode(system2wstring(src0)) ;
		printf("tmp0:%s\n", tmp0.c_str()) ;
		std::string out0 = wstring2string(an62::decode(tmp0)) ;
		printf("out0:%s\n", out0.c_str()) ;
		printf("src0.compare(out0) : %d\n", src0.compare(out0)) ;
	}
    
	{
		// [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
		std::wstring src1 = L"http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
		if(sizeof(wchar_t) == 2) {	// Windows
			src1.push_back(0xD83D) ;
			src1.push_back(0xDC18) ;
		}
		else {	// Linux
			src1.push_back(0x01F418) ;
		}
		printf("src1[%zd]:%s\n", src1.length(), wstring2system(src1).c_str()) ;
		std::string tmp1 = an62::encode(src1) ;
		printf("tmp1:%s\n", tmp1.c_str()) ;
		std::wstring out1 = an62::decode(tmp1) ;
		printf("out1:%s\n", wstring2system(out1).c_str()) ;
		printf("src1.compare(out1) : %d\n", src1.compare(out1)) ;
	}

	{
		// [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
		std::string utf8 = system2utf8("http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可") ;
		utf8.push_back(0xF0) ;
		utf8.push_back(0x9F) ;
		utf8.push_back(0x90) ;
		utf8.push_back(0x98) ;
		std::string tmp1 = an62::encode(utf8_to_wstring(utf8)) ;
		printf("utf8[%zd]:%s\n", utf8.length(), utf8_to_system(utf8).c_str()) ;
		printf("tmp1:%s\n", tmp1.c_str()) ;
		std::string out8 = wstring2utf8(an62::decode(tmp1)) ;
		printf("out8[%zd]:%s\n", out8.length(), utf8_to_system(out8).c_str()) ;
		printf("utf8.compare(out8) : %d\n", utf8.compare(out8)) ;
	}

	return 0 ;
}
```
-----------------------------------------------------------------------------------
```
locale : [Korean_Korea.949]
sizeof(wchar_t) : 2
src0[43]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
tmp0:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39
out0:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
src0.compare(out0) : 0
src0[50]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
tmp0:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39
out0:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
src0.compare(out0) : 0
src1[45]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可??
tmp1:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39ybpT2S
out1:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可??
src1.compare(out1) : 0
utf8[61]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可??
tmp1:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39ybpT2S
out8[61]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可??
utf8.compare(out8) : 0
```
## 예
- cpp (Linux)
```cpp
// charset : UTF-8(on Linux)
#include "an62.h"
#include "zstring.h"
#include <stdio.h>

int main(int argc, char *argv[])
{
	std::string locale(setlocale(LC_ALL, "")) ;
	printf("locale : [%s]\n", locale.c_str()) ;
	printf("sizeof(wchar_t) : %zd\n", sizeof(wchar_t)) ;
	
	{
		std::wstring src0 = L"http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
		printf("src0[%zd]:%s\n", src0.length(), wstring2system(src0).c_str()) ;
		std::string tmp0 = an62::encode(src0) ;
		printf("tmp0:%s\n", tmp0.c_str()) ;
		std::wstring out0 = an62::decode(tmp0) ;
		printf("out0:%s\n", wstring2system(out0).c_str()) ;
		printf("src0.compare(out0) : %d\n", src0.compare(out0)) ;
	}
	{
		std::string src0 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
		printf("src0[%zd]:%s\n", src0.length(), src0.c_str()) ;
		std::string tmp0 = an62::encode(system2wstring(src0)) ;
		printf("tmp0:%s\n", tmp0.c_str()) ;
		std::string out0 = wstring2system(an62::decode(tmp0)) ;
		printf("out0:%s\n", out0.c_str()) ;
		printf("src0.compare(out0) : %d\n", src0.compare(out0)) ;
	}
    
	{
		// [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
		std::wstring src1 = L"http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
		if(sizeof(wchar_t) == 2) {	// Windows
			src1.push_back(0xD83D) ;
			src1.push_back(0xDC18) ;
		}
		else {	// Linux
			src1.push_back(0x01F418) ;
		}
		printf("src1[%zd]:%s\n", src1.length(), wstring2system(src1).c_str()) ;
		std::string tmp1 = an62::encode(src1) ;
		printf("tmp1:%s\n", tmp1.c_str()) ;
		std::wstring out1 = an62::decode(tmp1) ;
		printf("out1:%s\n", wstring2system(out1).c_str()) ;
		printf("src1.compare(out1) : %d\n", src1.compare(out1)) ;
	}

	{
		// [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
		std::string utf8 = system2utf8("http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘") ;
		std::string tmp1 = an62::encode(utf8_to_wstring(utf8)) ;
		printf("utf8[%zd]:%s\n", utf8.length(), utf8_to_system(utf8).c_str()) ;
		printf("tmp1:%s\n", tmp1.c_str()) ;
		std::string out8 = wstring2utf8(an62::decode(tmp1)) ;
		printf("out8[%zd]:%s\n", out8.length(), utf8_to_system(out8).c_str()) ;
		printf("utf8.compare(out8) : %d\n", utf8.compare(out8)) ;
	}

	return 0 ;
}
```
-----------------------------------------------------------------------------------
```
locale : [ko_KR.UTF-8]
sizeof(wchar_t) : 4
src0[43]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
tmp0:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39
out0:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
src0.compare(out0) : 0
src0[57]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
tmp0:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39
out0:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
src0.compare(out0) : 0
src1[44]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可🐘
tmp1:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39ybpT2S
out1:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可🐘
src1.compare(out1) : 0
utf8[61]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可🐘
tmp1:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39ybpT2S
out8[61]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可🐘
utf8.compare(out8) : 0
```

## 예
- pascal (Dephi)
```pascal
{ charset : EUC-KR }
program AN62Test;

{$APPTYPE CONSOLE}

uses
  SysUtils,
  AN62 in 'AN62.pas',
  ZString in 'ZString.pas';

var
  wsrc, wout : WideString ;
  wtmp, tmp0, tmp8 : string ;
  src0, out0 : AnsiString ;
  utf8, out8 : UTF8String ;
begin
  WriteLn('----------AnsiString------------') ;
  src0 := 'http://test.com:8080/an62.do?name=가나다 ㄱㄴ※'#10'可' ;
  WriteLn('src0[', Length(src0), ']:', src0) ;

  tmp0 := TAN62.Encode(AnsiToUtf8(src0)) ;
  WriteLn('tmp0[', Length(tmp0), ']:', tmp0) ;

  out0 := Utf8ToAnsi(TAN62.Decode(tmp0)) ;
  WriteLn('out0[', Length(out0), ']:', out0) ;

  WriteLn('src0 = out0 : ', (src0 = out0)) ;

  WriteLn('----------UTF8String----------') ;
  utf8 := AnsiToUtf8('http://test.com:8080/an62.do?name=가나다 ㄱㄴ※'#10'可') ;
  WriteLn('utf8[', Length(utf8), ']:', Utf8ToAnsi(utf8)) ;

  tmp8 := TAN62.Encode(utf8) ;
  WriteLn('tmp8[', Length(tmp8), ']:', tmp8) ;

  out8 := TAN62.Decode(tmp8) ;
  WriteLn('out8[', Length(out8), ']:', Utf8ToAnsi(out8)) ;

  WriteLn('utf8 = out8 : ', (utf8 = out8)) ;

  WriteLn('----------WideString------------') ;
  // [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
  wsrc := 'http://test.com:8080/an62.do?name=가나다 ㄱㄴ※'#10'可' ;
  wsrc := wsrc + #55357 ; // 0xD83D #55357
  wsrc := wsrc + #56344 ; // 0xDC18 #56344
  WriteLn('wsrc[', Length(wsrc), ']:', wsrc) ;

  wtmp := TAN62.Encode(wsrc) ;
  WriteLn('wtmp[', Length(wtmp), ']:', wtmp) ;

  //wout := UTF8Decode(TAN62.Decode(wtmp)) ;  // 코끼리 때문에 안됨.
  wout := TZString.SafeUTF8Decode(TAN62.Decode(wtmp)) ;
  WriteLn('wout[', Length(wout), ']:', wout) ;

  WriteLn('wsrc = wout : ', (wsrc = wout)) ;

  WriteLn('----------UTF8String----------') ;
  // [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
  utf8 := UTF8Encode('http://test.com:8080/an62.do?name=가나다 ㄱㄴ※'#10'可') ;
  utf8 := utf8 + #240 ; // 0xF0 #240
  utf8 := utf8 + #159 ; // 0x9F #159
  utf8 := utf8 + #144 ; // 0x90 #144
  utf8 := utf8 + #152 ; // 0x98 #152
  //WriteLn('utf8[', Length(utf8), ']:', UTF8Decode(utf8)) ; // 코끼리 때문에 안됨.
  WriteLn('utf8[', Length(utf8), ']:', TZString.SafeUTF8Decode(utf8)) ;

  tmp8 := TAN62.Encode(utf8) ;
  WriteLn('tmp8[', Length(tmp8), ']:', tmp8) ;

  out8 := TAN62.Decode(tmp8) ;
  //WriteLn('utf8[', Length(out8)), ']:', UTF8Decode(out8)) ; // 코끼리 때문에 안됨.
  WriteLn('utf8[', Length(out8), ']:', TZString.SafeUTF8Decode(out8)) ;

  WriteLn('utf8 = out8 : ', (utf8 = out8)) ;

  ReadLn;
end.
```
-----------------------------------------------------------------------------------
```
----------EUC-KR------------
src0[50]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
tmp0:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39
out0[50]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
src0 = out0
----------UTF-8----------
utf8[57]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
tmp8:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39
out8[57]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
utf8 = out8
----------WideString------------
wsrc[45]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可??
wtmp:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39ybpT2S
wout[45]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可??
wsrc = wout
----------UTF8String----------
utf8[61]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可??
tmp8:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39ybpT2S
utf8[61]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可??
utf8 = out8
```
## 예
- pas (Free Pascal)
```pas
{ charset : UTF-8 }
program AN62Test;

{$APPTYPE CONSOLE}

uses
  SysUtils, AN62, ZString;

var
  wsrc, wout : WideString ;
  wtmp, tmp8, tmp0 : string ;
  src0, out0 : AnsiString ;
  utf8, out8 : UTF8String ;

begin
  WriteLn('----------UTF8String----------') ;
  utf8 := AnsiToUtf8(UTf8ToAnsi('http://test.com:8080/an62.do?name=가나다 ㄱㄴ※'#10'可')) ;
  WriteLn('utf8[', Length(utf8), ']:', Utf8ToAnsi(utf8)) ;

  tmp8 := TAN62.Encode(utf8) ;
  WriteLn('tmp8[', Length(tmp8), ']:', tmp8) ;

  out8 := TAN62.Decode(tmp8) ;
  WriteLn('out8[', Length(out8), ']:', Utf8ToAnsi(out8)) ;

  WriteLn('utf8 = out8 : ', (utf8 = out8)) ;

  WriteLn('----------AnsiString------------') ;
  src0 := Utf8ToAnsi('http://test.com:8080/an62.do?name=가나다 ㄱㄴ※'#10'可') ;
  WriteLn('src0[', Length(src0), ']:', src0) ;

  tmp0 := TAN62.Encode(AnsiToUtf8(src0)) ;
  WriteLn('tmp0[', Length(tmp0), ']:', tmp0) ;

  out0 := Utf8ToAnsi(TAN62.Decode(tmp0)) ;
  WriteLn('out0[', Length(out0), ']:', out0) ;

  WriteLn('src0 = out0 : ', (src0 = out0)) ;

  WriteLn('----------WideString----------') ;
  wsrc := UTF8Decode('http://test.com:8080/an62.do?name=가나다 ㄱㄴ※'#10'可') ;
  WriteLn('wsrc[', Length(wsrc), ']:', wsrc) ;

  wtmp := TAN62.Encode(wsrc) ;
  WriteLn('wtmp[', Length(wtmp), ']:', wtmp) ;

  wout := UTF8Decode(TAN62.Decode(wtmp)) ;
  WriteLn('wout[', Length(wout), ']:', wout) ;

  WriteLn('wsrc = wout : ', (wsrc = wout)) ;

  Writeln('----------UTF8String----------') ;
  // [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
  utf8 := UTF8Encode(UTF8Decode('http://test.com:8080/an62.do?name=가나다 ㄱㄴ※'#10'可🐘')) ;
  WriteLn('utf8[', Length(utf8), ']:', UTF8Decode(utf8)) ;

  tmp8 := TAN62.Encode(utf8) ;
  WriteLn('tmp8[', Length(tmp8), ']:', tmp8) ;

  out8 := TAN62.Decode(tmp8) ;
  WriteLn('out8[', Length(out8), ']:', UTF8Decode(out8)) ;

  WriteLn('utf8 = out8 : ', (utf8 = out8)) ;

  WriteLn('----------WideString------------') ;
  // [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
  wsrc := UTF8Decode('http://test.com:8080/an62.do?name=가나다 ㄱㄴ※'#10'可🐘') ;
  WriteLn('wsrc[', Length(wsrc), ']:', wsrc) ;

  wtmp := TAN62.Encode(wsrc) ;
  WriteLn('wtmp[', Length(wtmp), ']:', wtmp) ;

  wout := UTF8Decode(TAN62.Decode(wtmp)) ;
  WriteLn('wout[', Length(wout), ']:', wout) ;

  WriteLn('wsrc = wout : ', (wsrc = wout)) ;

  ReadLn ;
end.
```
-----------------------------------------------------------------------------------
```
----------UTF8String----------
utf8[57]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
tmp8[76]:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39
out8[57]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
utf8 = out8 : TRUE
----------AnsiString------------
src0[50]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
tmp0[76]:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39
out0[50]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
src0 = out0 : TRUE
----------WideString----------
wsrc[43]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
wtmp[76]:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39
wout[43]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可
wsrc = wout : TRUE
----------UTF8String----------
utf8[61]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可??
tmp8[82]:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39ybpT2S
out8[61]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可??
utf8 = out8 : TRUE
----------WideString------------
wsrc[45]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可??
wtmp[82]:QJPMSGcDBxKqT59pP30lEfGUE9WZOXhdCdieS1KqOXeRFbUNWTlJcWWwfKzvXQYGXQk6WQfhvp39ybpT2S
wout[45]:http://test.com:8080/an62.do?name=가나다 ㄱㄴ※
可??
wsrc = wout : TRUE
```
