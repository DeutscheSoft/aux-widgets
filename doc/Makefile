all: build

out/examples: ../aux_logo_4c.svg ../src/**/*.js ../styles/**/* ../styles/* ../examples.html Makefile
	rm -fr $@
	mkdir -p $@
	cp -r ../aux_logo_4c.svg ../src ../styles ../examples.html ../examples/ $@


build: jsdoc/* ../src/**/*.js ../src/*.js out/examples Makefile
	./node_modules/.bin/jsdoc -c jsdoc/conf.json -d out -r ../src
	cp ../aux_logo_4c.svg out/
	tail +1 out/styles/jsdoc.css > _foo || rm _foo
	mv _foo out/styles/jsdoc.css
