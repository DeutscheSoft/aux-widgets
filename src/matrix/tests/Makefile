TESTS = tree_data.js virtualtree_view.js connection_view.js

test:
	@for test in $(TESTS); do \
	  echo '== Running tests' $$test; \
	  node --experimental-modules --no-warnings $$test; \
	done
