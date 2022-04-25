# Examples

Serve this folder from a http server and open `index.html`.

## Python2
```
python -m SimpleHTTPServer
```

## Python3
```
python -m http.server
```

## Pike
 ```
 pike -x httpserver
 ```

## PHP
```
php -S 0.0.0.0:8000
```

## NPM
```
yarn global add serve
serve
```

## Erlang
```
erl -s inets -eval 'inets:start(httpd,[{server_name,"AUXExamples"},{document_root, "."},{server_root, "."},{port, 8000},{mime_types,[{"html","text/html"},{"js","text/javascript"},{"css","text/css"},{"svg","image/svg+xml"}]}]).'
```

## Plack (Perl)
```
cpan Plack
plackup -MPlack::App::Directory -e 'Plack::App::Directory->new(root=>".");' -p 8000
```

## webfs
```
webfsd -F -p 8000
```

## Ruby
```
ruby -run -ehttpd . -p8000
```
