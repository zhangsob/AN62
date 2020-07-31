// charset : UTF-8
#include "an62.h"
#include "zstring.h"
#include <stdio.h>

int main(int argc, char *argv[])
{
#if defined(_MSC_VER)
	std::wstring src0 = L"http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
	printf("src0[%zd]:%s\n", src0.length(), wstring2system(src0).c_str()) ;
	std::string tmp0 = an62::encode(src0) ;
#else
	std::string src0 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
	printf("src0[%zd]:%s\n", src0.length(), utf8_to_system(src0).c_str()) ;
	std::string tmp0 = an62::encode(utf8_to_wstring(src0)) ;
#endif
	printf("tmp0:%s\n", tmp0.c_str()) ;
	std::string out0 = wstring2system(an62::decode(tmp0)) ;
	printf("out0:%s\n", out0.c_str()) ;

    // [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
#if defined(_MSC_VER)
	std::wstring src1 = L"http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘" ;    // exception이 발생하는 경우
	printf("src1[%zd]:%ls\n", src1.length(), src1.c_str()) ;
	try {
		std::string tmp1 = an62::encode(src1) ;
#else
	std::string src1 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘" ;    // exception이 발생하는 경우
	printf("src1[%zd]:%s\n", src1.length(), utf8_to_system(src1).c_str()) ;
	try {
		std::string tmp1 = an62::encode(utf8_to_wstring(src1)) ;
#endif
		printf("tmp1:%s\n", tmp1.c_str()) ;
		std::string out1 = wstring2system(an62::decode(tmp1)) ;
		printf("out1:%s\n", out1.c_str()) ;
	}
	catch(const std::exception& e) {
		fprintf(stderr, "%s\n", e.what()) ;

#if defined(_MSC_VER)
		std::string src8 = wstring2utf8(src1) ;
		std::vector<unsigned char> bin(src8.cbegin(), src8.cend()) ;	// UTF-8
#else
		std::vector<unsigned char> bin(src1.cbegin(), src1.cend()) ;	// UTF-8
#endif
		std::string tmp2 = an62::bin2txt(bin) ;
		printf("tmp2:%s\n", tmp2.c_str()) ;
		std::vector<unsigned char> bin2 = an62::txt2bin(tmp2) ;
		std::string utf8(bin2.cbegin(), bin2.cend()) ;
		std::string out2 = utf8_to_system(utf8) ;
		printf("out2:%s\n", out2.c_str()) ;
	}

	return 0 ;
}
