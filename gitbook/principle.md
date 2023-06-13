# 원리

<table><thead><tr><th width="223">Unicode값</th><th width="110">UTF-8</th><th>Byte단위 값의 범위</th><th>비고</th></tr></thead><tbody><tr><td>0x000000~0x00007F</td><td>0xxx xxxx</td><td>0x00~0x7F</td><td>ASCII</td></tr><tr><td>0x000080~0x0007FF</td><td>110x xxxx 10xx xxxx</td><td>0xC0~0xDF, 0x80~0xBF</td><td>유럽</td></tr><tr><td>0x000800~0x00FFFF</td><td>1110 xxxx 10xx xxxx 10xx xxxx</td><td>0xE0~0xEF, 0x80~0xBF</td><td>한글등</td></tr><tr><td>0x010000~0x10FFFF</td><td>1111 0zzz 10zz xxxx 10xx xxxx 10xx xxxx</td><td>0xF0~0xF4, 0x80~0xBF</td><td></td></tr></tbody></table>

그래서, 0x00\~0x7F, 0x80\~0xBF, 0xC0\~0xDF, 0xE0\~0xEF, 0xF0\~0xF4 즉, 0x00\~0xF4(245가지).

245x245x245 < 62x62x62x62 (14,706,125 < 14,776,336) 이다. (즉, 245가지 3덩어리를 62가지 4덩어리로 표현가능하다.)

$$
245^3 < 62^4
$$

BASE64 Encode의 원리도 256x256x256 = 64x64x64x64 즉, 3Byte을 6bit씩 4덩어리로 표현한 것이다.

$$
256^3 = 64^4
$$

$$
2^{8*3} = 2^{6*4}
$$
