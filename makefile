FORCE:

# Install dependencies
dev_env: FORCE
	npm install

# Run tests (currently just States)
tests: FORCE
	npm test

# Watch mode for development to run tests continuously
test_watch: FORCE
	npm run test:watch

# Build the project
build: FORCE
	npm run build

# GitHub deployment
github: FORCE
	-git commit -a
	git push origin main

# Production deployment (run tests first)
prod: tests github
