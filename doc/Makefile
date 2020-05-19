all: build

out/examples: ../AUXLogo.png ../src/**/*.js ../styles/**/* ../styles/* ../examples.html Makefile
	rm -fr $@
	mkdir -p $@
	cp -r ../AUXLogo.png ../src ../styles ../examples.html ../examples/ $@


build: jsdoc/* ../src/**/*.js ../src/*.js out/examples Makefile
	./node_modules/.bin/jsdoc -c jsdoc/conf.json -d out -r ../src
	cp ../AUXLogo.png out/
	tail +2 out/styles/jsdoc.css > _foo || rm _foo
	mv _foo out/styles/jsdoc.css
