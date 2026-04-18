"""
kindlegen이 만든 MOBI 사전(type 258/259)을
MOBI type 2(일반 책)로 패치합니다.
사전 인덱스(INDX)는 유지되므로 팝업 검색은 그대로 동작합니다.

사용법: python patch-mobi-type.py kumo-dict.mobi
"""
import struct, sys, shutil

if len(sys.argv) < 2:
    print("사용법: python patch-mobi-type.py <파일.mobi>")
    sys.exit(1)

src = sys.argv[1]
backup = src + ".bak"
shutil.copy2(src, backup)
print(f"백업 생성: {backup}")

with open(src, "r+b") as f:
    # PalmDB record 0 offset
    f.seek(78)
    rec0_off = struct.unpack(">I", f.read(4))[0]

    # MOBI header starts at rec0 + 16
    mobi_off = rec0_off + 16

    # Verify MOBI magic
    f.seek(mobi_off)
    magic = f.read(4)
    if magic != b"MOBI":
        print(f"MOBI 헤더를 찾을 수 없습니다 (got: {magic})")
        sys.exit(1)

    # Read current type (offset +8 from MOBI magic)
    f.seek(mobi_off + 8)
    current_type = struct.unpack(">I", f.read(4))[0]
    print(f"현재 MOBI type: {current_type}")

    # Patch to type 2
    f.seek(mobi_off + 8)
    f.write(struct.pack(">I", 2))
    print(f"패치 완료: type {current_type} → 2")
