#include "an62.h"

#include <cstring>
#include <vector>

#include "zstring.h"

static char toBase62[62] = {
	'0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
	'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
	'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
	'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
	'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
};

std::string an62::encodeOld(const std::wstring& text)
{
	std::string utf8 = wstring2utf8(text);
	std::string ret;
	long value = 0;
	int val = 0;
	int len = (int)utf8.length();
	char tmp[4];
	for (int i = 0; i < len; ++i) {
		val = (utf8[i] & 0xFF);
		if (val >= 0xF5) {
			an62::invalid_character_exception ice;
			ice.msg = "invalid UTF8 character";
			throw ice;
		}

		value = value * 0xF5 + val;
		if (i % 3 == 2) {
			for (int j = 3; j >= 0; --j, value /= 62)
				tmp[j] = toBase62[(int)(value % 62)];
			value = 0;
			ret.append(tmp, tmp + 4);
		}
	}

	len = utf8.length() % 3;
	if (len > 0) {
		for (int j = len; j >= 0; --j, value /= 62)
			tmp[j] = toBase62[(int)(value % 62)];

		ret.append(tmp, tmp + len + 1);
	}

	return ret;
}

std::string an62::encode(const std::wstring& text)
{
	unsigned char* utf8_buffer = (unsigned char*)malloc(text.length() * 4);
	size_t utf8_size = wstring2utf8(utf8_buffer, text);

	char* ret_buffer = (char*)malloc(((utf8_size + 2) / 3) * 4);
	long value = 0;
	int val = 0;
	int ri = 0;
	for (size_t i = 0; i < utf8_size; ++i) {
		val = utf8_buffer[i];
		if (val >= 0xF5) {
			free(utf8_buffer);
			an62::invalid_character_exception ice;
			ice.msg = "invalid UTF8 character";
			throw ice;
		}

		value = value * 0xF5 + val;
		if (i % 3 == 2) {
			ret_buffer[ri + 3] = toBase62[(int)(value % 62)];
			value /= 62;
			ret_buffer[ri + 2] = toBase62[(int)(value % 62)];
			value /= 62;
			ret_buffer[ri + 1] = toBase62[(int)(value % 62)];
			value /= 62;
			ret_buffer[ri] = toBase62[(int)value];

			value = 0;
			ri += 4;
		}
	}
	free(utf8_buffer);

	int len = utf8_size % 3;
	if (len > 0) {
		for (int j = len; j >= 0; --j, value /= 62)
			ret_buffer[ri + j] = toBase62[(int)(value % 62)];

		ri += len + 1;
	}

	std::string ret(ret_buffer, ri);
	free(ret_buffer);
	return ret;
}

static std::vector<char> fromBase62;

std::wstring an62::decodeOld(const std::string& text)
{
	int len = (int)text.length();
	if (len % 4 == 1)	return L"";

	std::vector<unsigned char> dst;
	dst.resize(len / 4 * 3 + ((len % 4 > 0) ? len % 4 - 1 : 0), 0x00);
	std::vector<unsigned char> tmp;
	tmp.resize(3, 0x00);

	if (fromBase62.empty()) {
		fromBase62.resize(128, -1);
		for (int i = 0; i < 62; i++)
			fromBase62[toBase62[i]] = i;
	}

	int value = 0;
	int val = 0;
	char ch = 0;

	int bi = 0;
	for (int i = 0; i < len; ++i) {
		ch = text[i];
		if (ch >= 0x80)	return L"";

		val = fromBase62[ch];
		if (val < 0)	return L"";

		value = value * 62 + val;
		if (i % 4 == 3) {
			for (int j = 2; j >= 0; --j, value /= 0xF5)
				tmp[j] = value % 0xF5;

			memcpy(&dst[bi], &tmp[0], 3);
			bi += 3;
			value = 0;
		}
	}

	len = len % 4;
	if (len > 0) {
		len -= 1;
		for (int j = len - 1; j >= 0; --j, value /= 0xF5)
			tmp[j] = value % 0xF5;

		memcpy(&dst[bi], &tmp[0], len);
		bi += len;
	}

	dst.resize(bi);
	std::string utf8(dst.cbegin(), dst.cend());
	return utf8_to_wstring(utf8);
}

std::wstring an62::decode(const std::string& text)
{
	int len = (int)text.length() ;
	if(len % 4 == 1)	return L"" ;

	unsigned char* dst = (unsigned char*)malloc(len / 4 * 3 + ((len % 4 > 0) ? len % 4 - 1 : 0));

	if (fromBase62.empty()) {
		fromBase62.resize(128, -1);
		for (int i = 0; i < 62; i++)
			fromBase62[toBase62[i]] = i;
	}

	int value = 0 ;
	int val = 0 ;
	char ch = 0 ;
	int bi = 0 ;
	for(int i = 0; i < len; ++i) {
		ch = text[i] ;
		if (ch < 0) { free(dst);	 return L""; }

		val = fromBase62[ch] ;
		if(val < 0) { free(dst);	 return L""; }
			
		value = value * 62 + val;
		if(i % 4 == 3) {
			dst[bi + 2] = value % 0xF5;
			value /= 0xF5;
			dst[bi + 1] = value % 0xF5;
			value /= 0xF5;
			dst[bi] = value;

			bi += 3 ;
			value = 0 ;
		}
	}

	len = len % 4 ;
	if(len > 0) {
		len -= 1 ;
		for(int j = len-1; j >= 0; --j, value /= 0xF5)
			dst[bi + j] = value % 0xF5;

		bi += len ;
	}

	std::wstring ret = utf8_to_wstring(dst, bi);
	free(dst);
	return ret;
}
