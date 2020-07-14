#include "zstring.h"

#include "log.h"

#include <cstdarg>
#include <cstring>
#include <locale>
#include <codecvt>
#include <vector>

#if defined(_MSC_VER)
#	include <windows.h>
#else
#	include <iconv.h>
#endif

bool isSystemUTF8()
{
	std::string locale(setlocale(LC_ALL, "")) ;
	return strstr(locale.c_str(), "949") == 0 ;
}

std::string fstr(const char *format, ...)
{
	std::string ret ;
	va_list args ;
	
	va_start(args, format) ;
	size_t size = std::vsnprintf(nullptr, 0, format, args) + 1;
	va_end(args) ;
	
	ret.resize(size, 0x00) ;
	
	va_start(args, format) ;
	std::vsnprintf(&ret[0], ret.size(), format, args);
	va_end(args) ;
	
	ret.resize(strlen(ret.c_str())) ;
	return ret ;
}

int toInteger(const std::string& digit, int default_value)
{
	int ret = 0 ;
	if (digit.empty())	return default_value ;

	for(char d : digit) {
		if(!isdigit(d))	return default_value ;
		ret = ret * 10 + (d - '0') ;
	}
	return ret ;
}

#if _ICONV_H
static bool isLitteEndian()
{
	short int si = 0x1234 ;
	return (memcmp(&si, "\x12\x34", 2) != 0) ;
}
#endif

std::wstring string2wstring(const std::string& ansi)
{
	std::wstring ret ;
#if defined(_MSC_VER)
	//printf("%s() is msc\n", __FUNCTION__) ;
	ret.resize(ansi.length()+1) ;
	int len = ::MultiByteToWideChar(CP_ACP, 0, (LPCSTR)ansi.data(), ansi.length(), &ret[0], ret.size()) ;
	ret.resize(len >= 0 ? len : 0) ;
#elif _ICONV_H
	//printf("%s() is iconv\n", __FUNCTION__) ;
	bool isLE = isLitteEndian() ;
	iconv_t ic = iconv_open(isLE ? "UCS-2LE" : "UCS-2BE" /*tocode*/, "CP949" /*fromcode*/ );
	if (ic == (iconv_t)-1)	return ret ;
	
    size_t in_size = ansi.length() ;
    size_t out_size = in_size * 2 + 1;
	std::vector<unsigned char> tmp ;
	tmp.resize(out_size, 0x00) ;
	
    char* in_ptr = (char *)&ansi[0];
    char* out_ptr = (char *)&tmp[0];
    size_t out_buf_left = out_size;
	
	size_t result = iconv(ic, &in_ptr, &in_size, &out_ptr, &out_buf_left);
	//printf("%s() result = %zd, input len = %zd, output len=%zd\n", __FUNCTION__, result, in_size, out_size - out_buf_left);
	
	iconv_close(ic);
	if (result == (size_t)-1)	return ret ;
	int ret_len = out_size - out_buf_left ;
	//for(int i = 0; i < ret_len; ++i)
	//	printf("%s() tmp[%d] = 0x%02X\n", __FUNCTION__, i, tmp[i]) ;

	ret_len /= 2 ;
	ret.resize(ret_len) ;
	unsigned short *us = (unsigned short *)&tmp[0] ;
	if(isLE) {
		for(int i = 0;i < ret_len; ++i) {
			//ret[i] = tmp[i*2+1] << 8 | tmp[i*2+0] ;
			ret[i] = us[i] ;
			//printf("%s() ret[%d] = 0x%04X\n", __FUNCTION__, i, ret[i]) ;
		}
	}
	else {
		for(int i = 0;i < ret_len; ++i)
			//ret[i] = tmp[i*2+0] << 8 + tmp[i*2+1] ;
			ret[i] = us[i] ;
	}
#endif
	return ret ;
}

std::string wstring2string(const std::wstring& unicode)
{
	std::string ret ;
#if defined(_MSC_VER)
	//printf("%s() is msc\n", __FUNCTION__) ;
	ret.resize(unicode.length()*2+1) ;
	int len = ::WideCharToMultiByte(CP_ACP, 0, (LPWSTR)unicode.data(), unicode.length(), &ret[0], ret.size(), NULL, NULL) ;
	ret.resize(len >= 0 ? len : 0) ;
#elif _ICONV_H
	bool isLE = isLitteEndian() ;
	size_t wc_size = sizeof(wchar_t) ;
	//printf("%s() is iconv sizeof(wchar_t) : %zd, %s\n", __FUNCTION__, wc_size, isLE ? "LE" : "BE") ;
	std::string from_code = "UCS-" ;
	from_code.push_back((char)('0' + wc_size)) ;
	from_code += isLE ? "LE" : "BE" ;
	//printf("%s() is iconv wstring is from_code : [%s]\n", __FUNCTION__, from_code.c_str()) ;
	
	//for(int i = 0; i < (int)unicode.length(); ++i)
	//	printf("%s() ret[%d] = 0x%08X\n", __FUNCTION__, i, unicode[i]) ;
	
	iconv_t ic = iconv_open("CP949" /*tocode*/, from_code.c_str() /*fromcode*/ );
	if (ic == (iconv_t)-1)	return ret ;
	
    size_t in_size = unicode.length() * wc_size ;
    size_t out_size = unicode.length() * 2 + 1;
	//printf("%s() input len = %zd, output len=%zd\n", __FUNCTION__, in_size, out_size);
	ret.resize(out_size, 0x00) ;
	
    char* in_ptr = (char *)unicode.data();
    char* out_ptr = (char *)ret.data();
    size_t out_buf_left = out_size;
	
	size_t result = iconv(ic, &in_ptr, &in_size, &out_ptr, &out_buf_left);
	//printf("%s() result = %zd, input len = %zd, output len=%zd\n", __FUNCTION__, result, in_size, out_size - out_buf_left);
	
	iconv_close(ic);
	if (result == (size_t)-1)	ret.clear() ;
	else						ret.resize(out_size - out_buf_left) ;
#endif
	return ret ;
}

#include <codecvt>

std::wstring utf8_to_wstring(const std::string& utf8)
{
    std::wstring_convert<std::codecvt_utf8<wchar_t>> wconv;
	return wconv.from_bytes(utf8);
}

std::string wstring2utf8(const std::wstring& unicode)
{
    std::wstring_convert<std::codecvt_utf8<wchar_t>> wconv;
	return wconv.to_bytes(unicode);
}

std::string utf8_to_string(const std::string& utf8)
{
	std::wstring unicode = utf8_to_wstring(utf8) ;
	return wstring2string(unicode) ;
}

std::string string2utf8(const std::string& ansi)
{
	std::wstring unicode = string2wstring(ansi) ;
	return wstring2utf8(unicode) ;
}

std::wstring system2wstring(const std::string& txt)
{
	return isSystemUTF8() ? utf8_to_wstring(txt) : string2wstring(txt) ;
}

std::string wstring2system(const std::wstring& unicode)
{
	return isSystemUTF8() ? wstring2utf8(unicode) : wstring2string(unicode) ;
}

std::string utf8_to_system(const std::string& txt)
{
	return isSystemUTF8() ? txt : utf8_to_string(txt) ;
}

std::string system2utf8(const std::string& txt)
{
	return isSystemUTF8() ? txt : string2utf8(txt) ;
}

static const std::string base64_chars = 
             "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
             "abcdefghijklmnopqrstuvwxyz"
             "0123456789+/";

static inline bool is_base64(unsigned char c) {
  return (isalnum(c) || (c == '+') || (c == '/'));
}

std::string base64_encode(unsigned char const* bytes_to_encode, unsigned int in_len)
{
	//LOG_MRI("%s(,%d) call\n", __func__, in_len) ;
  std::string ret;
  int i = 0;
  int j = 0;
  unsigned char char_array_3[3];
  unsigned char char_array_4[4];

  while (in_len--) {
    char_array_3[i++] = *(bytes_to_encode++);
    if (i == 3) {
      char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
      char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
      char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
      char_array_4[3] = char_array_3[2] & 0x3f;

      for(i = 0; (i <4) ; i++)
        ret += base64_chars[char_array_4[i]];
      i = 0;
    }
  }

  if (i)
  {
    for(j = i; j < 3; j++)
      char_array_3[j] = '\0';

    char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
    char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
    char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
    char_array_4[3] = char_array_3[2] & 0x3f;

    for (j = 0; (j < i + 1); j++)
      ret += base64_chars[char_array_4[j]];

    while((i++ < 3))
      ret += '=';

  }
	//LOG_MRI("%s() size : %zd\n", __func__, ret.size()) ;
  return ret;

}

std::string base64_encode(const std::vector<unsigned char>& binary)
{
	return base64_encode(&binary[0], binary.size()) ;
}

std::string base64_decode(std::string const& encoded_string)
{
  int in_len = encoded_string.size();
  int i = 0;
  int j = 0;
  int in_ = 0;
  unsigned char char_array_4[4], char_array_3[3];
  std::string ret;

  while (in_len-- && ( encoded_string[in_] != '=') && is_base64(encoded_string[in_])) {
    char_array_4[i++] = encoded_string[in_]; in_++;
    if (i ==4) {
      for (i = 0; i <4; i++)
        char_array_4[i] = base64_chars.find(char_array_4[i]);

      char_array_3[0] = (char_array_4[0] << 2) + ((char_array_4[1] & 0x30) >> 4);
      char_array_3[1] = ((char_array_4[1] & 0xf) << 4) + ((char_array_4[2] & 0x3c) >> 2);
      char_array_3[2] = ((char_array_4[2] & 0x3) << 6) + char_array_4[3];

      for (i = 0; (i < 3); i++)
        ret += char_array_3[i];
      i = 0;
    }
  }

  if (i) {
    for (j = i; j <4; j++)
      char_array_4[j] = 0;

    for (j = 0; j <4; j++)
      char_array_4[j] = base64_chars.find(char_array_4[j]);

    char_array_3[0] = (char_array_4[0] << 2) + ((char_array_4[1] & 0x30) >> 4);
    char_array_3[1] = ((char_array_4[1] & 0xf) << 4) + ((char_array_4[2] & 0x3c) >> 2);
    char_array_3[2] = ((char_array_4[2] & 0x3) << 6) + char_array_4[3];

    for (j = 0; (j < i - 1); j++) ret += char_array_3[j];
  }

  return ret;
}
