{ charset : UTF-8 }
program AN62Test;

{$APPTYPE CONSOLE}

uses
  SysUtils, AN62, ZString;

var
  wsrc, wout : WideString ;
  wtmp, tmp8, tmp0 : string ;
  src0, out0 : AnsiString ;
  utf8, out8 : UTF8String ;

begin
  WriteLn('----------UTF8String----------') ;
  utf8 := AnsiToUtf8(UTf8ToAnsi('http://test.com:8080/an62.do?name=가나다 ㄱㄴ※'#10'可')) ;
  WriteLn('utf8[', Length(utf8), ']:', Utf8ToAnsi(utf8)) ;

  tmp8 := TAN62.Encode(utf8) ;
  WriteLn('tmp8[', Length(tmp8), ']:', tmp8) ;

  out8 := TAN62.Decode(tmp8) ;
  WriteLn('out8[', Length(out8), ']:', Utf8ToAnsi(out8)) ;

  WriteLn('utf8 = out8 : ', (utf8 = out8)) ;

  WriteLn('----------AnsiString------------') ;
  src0 := Utf8ToAnsi('http://test.com:8080/an62.do?name=가나다 ㄱㄴ※'#10'可') ;
  WriteLn('src0[', Length(src0), ']:', src0) ;

  tmp0 := TAN62.Encode(AnsiToUtf8(src0)) ;
  WriteLn('tmp0[', Length(tmp0), ']:', tmp0) ;

  out0 := Utf8ToAnsi(TAN62.Decode(tmp0)) ;
  WriteLn('out0[', Length(out0), ']:', out0) ;

  WriteLn('src0 = out0 : ', (src0 = out0)) ;

  WriteLn('----------WideString----------') ;
  wsrc := UTF8Decode('http://test.com:8080/an62.do?name=가나다 ㄱㄴ※'#10'可') ;
  WriteLn('wsrc[', Length(wsrc), ']:', wsrc) ;

  wtmp := TAN62.Encode(wsrc) ;
  WriteLn('wtmp[', Length(wtmp), ']:', wtmp) ;

  wout := UTF8Decode(TAN62.Decode(wtmp)) ;
  WriteLn('wout[', Length(wout), ']:', wout) ;

  WriteLn('wsrc = wout : ', (wsrc = wout)) ;

  Writeln('----------UTF8String----------') ;
  // [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
  utf8 := UTF8Encode(UTF8Decode('http://test.com:8080/an62.do?name=가나다 ㄱㄴ※'#10'可🐘')) ;
  WriteLn('utf8[', Length(utf8), ']:', UTF8Decode(utf8)) ;

  tmp8 := TAN62.Encode(utf8) ;
  WriteLn('tmp8[', Length(tmp8), ']:', tmp8) ;

  out8 := TAN62.Decode(tmp8) ;
  WriteLn('out8[', Length(out8), ']:', UTF8Decode(out8)) ;

  WriteLn('utf8 = out8 : ', (utf8 = out8)) ;

  WriteLn('----------WideString------------') ;
  // [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
  wsrc := UTF8Decode('http://test.com:8080/an62.do?name=가나다 ㄱㄴ※'#10'可🐘') ;
  WriteLn('wsrc[', Length(wsrc), ']:', wsrc) ;

  wtmp := TAN62.Encode(wsrc) ;
  WriteLn('wtmp[', Length(wtmp), ']:', wtmp) ;

  wout := UTF8Decode(TAN62.Decode(wtmp)) ;
  WriteLn('wout[', Length(wout), ']:', wout) ;

  WriteLn('wsrc = wout : ', (wsrc = wout)) ;

  ReadLn ;
end.
