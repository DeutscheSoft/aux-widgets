.PHONY: prettier icons all

all: check

icons: Makefile
	./tools/icongen.py -p aux- styles/fonts/AUXIcons
	./tools/icongen.py -p aux- styles/fonts/AUXShapes
	./tools/icongen.py -c -h styles/fonts/AUXShapes100
	./tools/icongen.py -c -h styles/fonts/AUXShapes200
	./tools/icongen.py -c -h styles/fonts/AUXShapes300
	./tools/icongen.py -c -h styles/fonts/AUXShapes400
	./tools/icongen.py -c -h styles/fonts/AUXShapes500
	./tools/icongen.py -c -h styles/fonts/AUXShapes600
	./tools/icongen.py -c -h styles/fonts/AUXShapes700
	./tools/icongen.py -c -h styles/fonts/AUXShapes800
	./tools/icongen.py -c -h styles/fonts/AUXShapes900

prettier:
	cd prettier && npm run prettier

check:
	cd eslint && npm run check

docs:
	cd doc && npm run build

backstop:
	cd backstop && npm run test
