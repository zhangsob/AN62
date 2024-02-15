#ifndef _AN62_H_
#define _AN62_H_

#include <string>
#include <vector>
#include <exception>

struct an62 {
struct invalid_character_exception : std::exception {
	const char* what() const noexcept { return msg.c_str(); }
	std::string msg ;
};

static std::string	encode(const std::wstring& text) ;
static std::string	encodeOld(const std::wstring& text) ;
static std::wstring	decode(const std::string& text) ;
static std::wstring	decodeOld(const std::string& text) ;
};
#endif
