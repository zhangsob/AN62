unit ZString;

interface

type
  TBytes = array of byte;
  TZString = class
  public
    class function IsUTF8(const s : string) : Boolean ;
    class function SafeUTF8Encode(const s : string) : string ;
    class function SafeUTF8Decode(const s : string) : string ;
    class function StringToWideString(const s : string; CodePage: Integer = 0) : WideString ;
    class function WideStringToString(const ws : WideString; CodePage: Integer = 0) : string ;
    class function StringToBytes(const s : string) : TBytes ;
    class function BytesToString(const bs : TBytes) : string ;

    class function ToHexa(const bs : TBytes) : string ; overload ;
    class function ToHexa(const s : string) : string ; overload ;
    class function ToHexa(const ws : WideString) : string ; overload ;
  end;

implementation

uses
  Classes, SysUtils, Windows;

const
  HEXAString = '0123456789ABCDEF' ;

class function TZString.IsUTF8(const s : string) : Boolean ;
var
  i, val, next_count : Integer ;
begin
  result := false ;
  next_count :=  0 ;
  for i := 0 to Length(s)-1 do
    begin
      val := Ord(s[i+1]) ;
      if (val and 128 = 128) then         // 128 : 0x80
        begin
          if (next_count = 0) then
            if (val and 224 = 192) then       // 224 : 0xE0, 192 : 0xC0
              next_count := 1
            else if (val and 240 = 224) then  // 240 : 0xF0, 224 : 0xE0
              next_count := 2
            else if (val and 248 = 240) then  // 248 : 0xF8, 240 : 0xF0
              next_count := 3
            else
              exit
          else
            if (next_count = 0) then
              exit
            else
              next_count := next_count - 1 ;
        end

      else
        if (next_count <> 0) then
          exit ;
    end ;
  result := true ;
end ;

class function TZString.SafeUTF8Encode(const s : string) : string ;
begin
  if (IsUTF8(s)) then
    result := s
  else
    result := UTF8Encode(s) ;
end ;

class function TZString.SafeUTF8Decode(const s : string) : string ;
begin
  if (IsUTF8(s)) then
    result := UTF8Decode(s)
  else
    result := s ;
end ;

{**
   @param CodePage 0 : System Default, 65001 : UTF-8, 949 : EUC-KR
*}
class function TZString.StringToWideString(const s : string; CodePage: Integer = 0) : WideString ;
var
  len : Integer ;
begin
  if (IsUTF8(s)) then
    CodePage := 65001 ;

  len := MultiByteToWideChar(CodePage, 0, PChar(s), Length(s), nil, 0) ;
  SetLength(result, len) ;
  if (len > 0) then
    MultiByteToWideChar(CodePage, 0, PChar(s), Length(s), PWideChar(result), len) ;
end ;

{**
   @param CodePage 0 : System Default, 65001 : UTF-8, 949 : EUC-KR
*}
class function TZString.WideStringToString(const ws : WideString; CodePage: Integer = 0) : string ;
var
  len : Integer ;
begin
  len := WideCharToMultiByte(CodePage, 0, PWideChar(ws), Length(ws), nil, 0, nil, nil) ;
  SetLength(result, len) ;
  if (len > 0) then
    WideCharToMultiByte(CodePage, 0, PWideChar(ws), Length(ws), PChar(result), len, nil, nil) ;
end ;

class function TZString.StringToBytes(const s : string) : TBytes ;
var
  i : Integer ;
begin
  SetLength(result, Length(s)) ;
  for i := 0 to Length(s) - 1 do
    result[i] := Ord(s[i+1]) ;
end ;

class function TZString.BytesToString(const bs : TBytes) : string ;
var
  i : Integer ;
begin
  result := '' ;
  SetLength(result, Length(bs)) ;
  for i := 0 to Length(bs) - 1 do
    result[1+i] := Chr(bs[i]) ;
end ;

function _ToHexa(const b : Byte) : String ; overload;
begin
  result := '' ;
  result := result + HEXAString[1 + b div 16] ;
  result := result + HEXAString[1 + b mod 16] ;
end ;

function _ToHexa(const c : Char) : String ; overload;
var
  lsb : Byte ;
begin
  lsb := Integer(c) and 255 ;
  result := '0x' ;
  result := result + HEXAString[1 + lsb div 16] ;
  result := result + HEXAString[1 + lsb mod 16] ;
end;

function _ToHexa(const wc : WideChar) : String ; overload;
var
  msb : Byte ;
  lsb : Byte ;
begin
  msb := Integer(wc) shr 8 ;
  lsb := Integer(wc) and 255 ;
  result := '' ;
  result := result + HEXAString[1 + msb div 16] ;
  result := result + HEXAString[1 + msb mod 16] ;
  result := result + HEXAString[1 + lsb div 16] ;
  result := result + HEXAString[1 + lsb mod 16] ;
end;

class function TZString.ToHexa(const bs : TBytes) : string ;
var
  i : Integer ;
begin
  result := '' ;
  for i := 0 to Length(bs) - 1 do
  begin
    result := result + _ToHexa(bs[i]) + ' ' ;
    case (i mod 16) of
      7 : result := result + ' ' ;
      15: result := result + #10 ;
    end ;
  end ;
end ;

class function TZString.ToHexa(const s : string) : string ;
var
  i : Integer ;
begin
  result := '' ;
  for i := 0 to Length(s) - 1 do
  begin
    result := result + _ToHexa(Byte(s[1+i])) + ' ' ;
    case (i mod 16) of
      7 : result := result + ' ' ;
      15: result := result + #10 ;
    end ;
  end ;
  result := Trim(result) ;
end ;

class function TZString.ToHexa(const ws : WideString) : string ;
var
  i : Integer ;
begin
  result := '' ;
  for i := 0 to Length(ws) - 1 do
  begin
    result := result + _ToHexa(ws[1+i]) + ' ' ;
    case (i mod 16) of
      7 : result := result + ' ' ;
      15: result := result + #10 ;
    end ;
  end ;
  result := Trim(result) ;
end ;

end.

