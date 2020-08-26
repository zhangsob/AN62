{ charset : UTF-8 }
program AN62Test;

{$APPTYPE CONSOLE}

uses
  SysUtils, AN62, ZString;

var
  wsrc, wout : WideString ;
  wtmp : string ;
  src0, tmp0, out0 : String ;
  src1, tmp1, out1 : String ;

begin
  WriteLn('----------UTF-8----------') ;
  src0 := 'http://test.com:8080/an62.do?name=가나다 ㄱㄴ※'#10'可' ;
  WriteLn(UTF8Decode('src0[' + IntToStr(Length(src0)) + ']:') + UTF8Decode(src0)) ;
  tmp0 := TAN62.Encode(src0) ;
  WriteLn('tmp0:' + tmp0) ;
  out0 := UTF8Encode(TAN62.Decode(tmp0)) ;
  WriteLn(UTF8Decode('out0[' + IntToStr(Length(out0)) + ']:') + UTF8Decode(out0)) ;
  if (src0 = out0) then WriteLn('src0 = out0') ;
  if (UTF8Decode(src0) = UTF8Decode(out0)) then WriteLn('UTF8Decode(src0) = UTF8Decode(out0)') ;

  Writeln('----------WideString------------') ;
  // [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
  wsrc := TZString.StringToWideString('http://test.com:8080/an62.do?name=가나다 ㄱㄴ※'#10'可🐘' , 65001);
  WriteLn(UTF8Decode('wsrc[' + IntToStr(Length(wsrc)) + ']:') + wsrc) ;
  wtmp := TAN62.Encode(wsrc) ;
  WriteLn('wtmp:' + wtmp) ;
  wout := TAN62.Decode(wtmp) ;
  WriteLn(UTF8Decode('wout[' + IntToStr(Length(wout)) + ']:') + wout) ;
  if (wsrc = wout) then WriteLn('wsrc = wout') ;

  Writeln('----------UTF-8----------') ;
  // [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
  src1 := 'http://test.com:8080/an62.do?name=가나다 ㄱㄴ※'#10'可🐘' ;
  WriteLn(UTF8Decode('src1[' + IntToStr(Length(src1)) + ']:') + UTF8Decode(src1)) ;
  WriteLn(TZString.ToHexa(src1)) ;
  tmp1 := TAN62.Encode(src1) ;
  WriteLn('tmp1:' + tmp1) ;
  out1 := UTF8Encode(TAN62.Decode(tmp1)) ;
  WriteLn(UTF8Decode('out1[' + IntToStr(Length(out1)) + ']:') + UTF8Decode(out1)) ;
  WriteLn(TZString.ToHexa(out1)) ;
  if (src1 = out1) then WriteLn('src1 = out1') ;
  if (UTF8Decode(src1) = UTF8Decode(out1)) then WriteLn('UTF8Decode(src1) = UTF8Decode(out1)') ;

  ReadLn ;
end.
