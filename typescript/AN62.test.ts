import { AN62 } from './AN62'

function print_msg(msg: string): void {
    if(typeof document !== 'undefined')
        document.write(msg.replace(/\n/g,'<br/>') + '<br/>') ;
    console.log(msg) ;
}

try {
    {
        let src: string = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可" ;
        print_msg(`src[${src.length}]:${src}`) ;
        let tmp: string = AN62.encode(src) ;
        print_msg(`tmp[${tmp.length}]:${tmp}`) ;
        let out: string = AN62.decode(tmp) ;
        print_msg(`out[${out.length}]:${out}`) ;
    }
    {
        // [ 코끼리 = Unicode : 01F418, UTF16 : D83D DC18, UTF8 : F0 9F 90 98 ]
        let src: string = "http://test.com:8080/an62.do?name=가나다 ㄱㄴ※\n可🐘" ;
        print_msg(`src[${src.length}]:${src}`) ;
        let tmp: string = AN62.encode(src) ;
        print_msg(`tmp[${tmp.length}]:${tmp}`) ;
        let out: string = AN62.decode(tmp) ;
        print_msg(`out[${out.length}]:${out}`) ;

        if(src === out)   print_msg("src === out") ;
    }
} catch(e) {
    print_msg(''+e) ;
}
