#ifndef _ZSTRING_H_
#define _ZSTRING_H_

#include <string>
#include <vector>

std::string fstr(const char *format, ...) ;
int toInteger(const std::string& digit, int default_value) ;

std::wstring ansi2wstring(const std::string& ansi) ;
std::string wstring2ansi(const std::wstring& unicode) ;

std::wstring utf8_to_wstring(const std::string& utf8) ;
std::string wstring2utf8(const std::wstring& unicode) ;

std::string utf8_to_ansi(const std::string& utf8) ;
std::string ansi2utf8(const std::string& ansi) ;

std::wstring system2wstring(const std::string& txt) ;
std::string wstring2system(const std::wstring& unicode) ;

std::string utf8_to_system(const std::string& txt) ;
std::string system2utf8(const std::string& txt) ;

#endif //_ZSTRING_H_
