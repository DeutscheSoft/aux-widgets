all: build

out/examples: ../logo.png ../src/**/*.js ../styles/**/* ../styles/* ../examples.html Makefile
	rm -fr $@
	mkdir -p $@
	cp -r ../logo.png ../src ../styles ../examples.html ../examples/ $@


build: jsdoc/* ../src/**/*.js ../src/*.js out/examples Makefile
	./node_modules/.bin/jsdoc -c jsdoc/conf.json -d out -r ../src
	cp ../logo.png out/
	tail +2 out/styles/jsdoc.css > _foo || rm _foo
	mv _foo out/styles/jsdoc.css
