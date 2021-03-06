unit AN62;

interface

uses
  SysUtils;

type
  TAN62 = class
    public
      class function Encode(const s : UTF8String) : string ; overload ;
      class function Encode(const ws : WideString) : string ; overload ;
      class function Decode(const s : string) : UTF8String ;
  end;

implementation

uses
  Classes, ZString;

const
  BASE62String = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' ;

function _AN62_Encode(const utf8 : UTF8String) : string ;
var
  tmp : string ;
  i, j, len, val, value : Integer ;
begin
  result := '' ;
  value := 0 ;
  len := Length(utf8) ;
  for i := 0 to len - 1 do
  begin
    val := Ord(utf8[1+i]) ;
    if (val >= 245) then  // 245 : 0xF5
      raise Exception.Create('invalid UCS2 Character');

    value := value * 245 + val ;
    if( i mod 3 = 2) then
      begin
        tmp := '' ;

        for j := 3 downto 0 do
        begin
          tmp := BASE62String[1 + value mod 62] + tmp ;
          value := value div 62 ;
        end ;

        value := 0 ;
        result := result + tmp ;
      end ;
  end ;

  len := len mod 3 ;
  if (len > 0) then
    begin
      tmp := '' ;

      for i := len downto 0 do
      begin
        tmp := BASE62String[1 + value mod 62] + tmp ;
        value := value div 62 ;
      end ;

      result := result + tmp ;
    end ;
end ;

class function TAN62.Encode(const s : UTF8String) : string ;
begin
  result := _AN62_Encode(s) ;
end;

class function TAN62.Encode(const ws : WideString) : string ;
begin
  result := _AN62_Encode(TZString.SafeUTF8Encode(ws)) ;
end;

function AN62ToValue(const s : string) : Integer ;
begin
  result := AnsiPos(s, BASE62String) - 1;
end;

class function TAN62.Decode(const s : string) : UTF8String ;
var
  i, j, len, val, value : Integer ;
  tmp : UTF8String ;
begin
  result := '' ;
  value := 0;
  len := Length(s) ;

  for i := 1 to len do
  begin
    val := AN62ToValue(s[i]) ;
    if (val < 0) then
      raise Exception.Create('invalid AN62 Character') ;

    value := value * 62 + val ;
    if(i mod 4 = 0) then
      begin
        tmp := '' ;

        for j := 2 downto 0 do
        begin
          tmp := Chr(value mod 245) + tmp ; // 245 : 0xF5
          value := value div 245 ;
        end ;

        result := result + tmp ;
        value := 0 ;
      end ;
  end ;

  len := len mod 4 ;
  if (len > 0) then
    begin
      tmp := '' ;

      for i := len - 2 downto 0 do
        begin
          tmp := Chr(value mod 245) + tmp ;
          value := value div 245 ;
        end ;
      result := result + tmp ;
    end ;
end ;

end.

