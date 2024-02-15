// charset : UTF-8 with BOM (on Linux)
// g++ -o an62test.ex an62.utf8.test.cpp an62.cpp zstring.cpp
#include "an62.h"

#include <clocale>
#include <cstdio>
#include <chrono>
#include <ctime>

#include "zstring.h"

int main(int argc, char *argv[])
{
	std::string locale(std::setlocale(LC_ALL, "")) ;
	std::printf("locale : [%s]\n", locale.c_str()) ;
	std::printf("sizeof(wchar_t) : %zd\n", sizeof(wchar_t)) ;

#if 1
	{
		std::wstring src0 = L"http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
		long long encode = 0LL, decode = 0LL, encodeOld = 0LL, decodeOld = 0LL;
		std::string tmp0 ;
		std::wstring out0;
		for(int times = 0; times < 1000; ++times)
		{
			auto start = std::chrono::high_resolution_clock::now();
			tmp0 = an62::encode(src0);
			encode += (long long)(std::chrono::high_resolution_clock::now() - start).count();

			start = std::chrono::high_resolution_clock::now();
			tmp0 = an62::encodeOld(src0);
			encodeOld += (long long)(std::chrono::high_resolution_clock::now() - start).count();

			start = std::chrono::high_resolution_clock::now();
			out0 = an62::decode(tmp0);
			decode += (long long)(std::chrono::high_resolution_clock::now() - start).count();

			start = std::chrono::high_resolution_clock::now();
			out0 = an62::decodeOld(tmp0);
			decodeOld += (long long)(std::chrono::high_resolution_clock::now() - start).count();

			if(src0.compare(out0))	std::printf("src0.compare(out0) : %d\n", src0.compare(out0));
		}

		std::printf("encode : %9lld ns\n", encode / 1000);
		std::printf("   old : %9lld ns\n", encodeOld / 1000);
		std::printf("decode : %9lld ns\n", decode / 1000);
		std::printf("   old : %9lld ns\n", decodeOld / 1000);
		std::printf("encode / decode : %5.2f %%\n", encode * (float)100 / (float)decode);
		std::printf("encode /    old : %5.2f %%\n", encode * (float)100 / (float)encodeOld);
		std::printf("decode /    old : %5.2f %%\n", decode * (float)100 / (float)decodeOld);
	}
#endif	
	{
		std::wstring src0 = L"http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
		std::printf("src0[%zd]:%s\n", src0.length(), wstring2system(src0).c_str());
		std::string tmp0 = an62::encode(src0);
		std::printf("tmp0:%s\n", tmp0.c_str());
		std::wstring out0 = an62::decode(tmp0);
		std::printf("out0[%zd]:%s\n", out0.length(), wstring2system(out0).c_str());
		std::printf("src0.compare(out0) : %d\n", src0.compare(out0));
	}
	{
		std::string src0 = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
		std::printf("src0[%zd]:%s\n", src0.length(), src0.c_str()) ;
		std::string tmp0 = an62::encode(system2wstring(src0)) ;
		std::printf("tmp0:%s\n", tmp0.c_str()) ;
		std::string out0 = wstring2system(an62::decode(tmp0)) ;
		std::printf("out0:%s\n", out0.c_str()) ;
		std::printf("src0.compare(out0) : %d\n", src0.compare(out0)) ;
	}

	{
		// [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
		std::wstring src1 = L"http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
		if(sizeof(wchar_t) == 2) {	// Windows
			src1.push_back((wchar_t)0xD83D) ;
			src1.push_back((wchar_t)0xDC18) ;
		}
		else {	// Linux
			src1.push_back((wchar_t)0x01F418) ;
		}
		std::printf("src1[%zd]:%s\n", src1.length(), wstring2system(src1).c_str()) ;
		std::string tmp1 = an62::encode(src1) ;
		std::printf("tmp1:%s\n", tmp1.c_str()) ;
		std::wstring out1 = an62::decode(tmp1) ;
		std::printf("out1:%s\n", wstring2system(out1).c_str()) ;
		std::printf("src1.compare(out1) : %d\n", src1.compare(out1)) ;
	}
#if !defined(_MSC_VER)
	{
		// [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
		std::string utf8 = system2utf8("http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘") ;
		std::string tmp1 = an62::encode(utf8_to_wstring(utf8)) ;
		std::printf("utf8[%zd]:%s\n", utf8.length(), utf8_to_system(utf8).c_str()) ;
		std::printf("tmp1:%s\n", tmp1.c_str()) ;
		std::string out8 = wstring2utf8(an62::decode(tmp1)) ;
		std::printf("out8[%zd]:%s\n", out8.length(), utf8_to_system(out8).c_str()) ;
		std::printf("utf8.compare(out8) : %d\n", utf8.compare(out8)) ;
	}
#endif
	return 0 ;
}
