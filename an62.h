#ifndef _AN62_H_
#define _AN62_H_

#include <string>
#include <vector>

struct an62 {
static std::string	bin2txt(const std::vector<unsigned char>& bin) ;
static std::vector<unsigned char> txt2bin(const std::string& txt) ;
static std::string	encode(const std::wstring& text) ;
static std::wstring	decode(const std::string& text) ;
};
#endif
