{ charset : EUC-KR }
program AN62Test;

{$APPTYPE CONSOLE}

uses
  SysUtils,
  AN62 in 'AN62.pas',
  ZString in 'ZString.pas';

var
  src0, tmp0, out0 : String ;

begin
  src0 := 'http://test.com:8080/an62.do?name=°¡³ª´Ù ¤¡¤¤¡Ø'#10'Ê¦' ;
  Writeln('src0[' + IntToStr(Length(src0)) + ']:' + TZString.SafeUTF8Decode(src0)) ;
  tmp0 := TAN62.Encode(src0) ;
  Writeln('tmp0:' + tmp0) ;
  out0 := TAN62.Decode(tmp0) ;
  Writeln('out0:' + TZString.SafeUTF8Decode(out0)) ;
  
  ReadLn;
end.