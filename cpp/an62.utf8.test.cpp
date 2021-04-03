// charset : UTF-8(on Linux)
#include "an62.h"

#include <clocale>
#include <cstdio>

#include "zstring.h"


int main(int argc, char *argv[])
{
	std::string locale(std::setlocale(LC_ALL, "")) ;
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
